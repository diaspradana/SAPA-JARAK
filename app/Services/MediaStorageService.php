<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class MediaStorageService
{
    protected ImagePrivacyService $privacyService;
    protected ImageManager $imageManager;

    public const ALLOWED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];

    public const MAX_FILE_SIZE_KB = 10240; // 10MB input limit

    public const SENSITIVE_TYPES = [
        'KTP_KK',
        'SURAT_KETERANGAN_DOKTER',
    ];

    public const CITIZEN_PHOTO_TYPES = [
        'FOTO_KONDISI_AWAL',
        'FOTO_SURVEI_KASUN',
        'FOTO_PROGRES_50',
        'FOTO_SELESAI_100',
    ];

    public function __construct(ImagePrivacyService $privacyService)
    {
        $this->privacyService = $privacyService;
        $this->imageManager = new ImageManager(new Driver());
    }

    /**
     * Store and process an uploaded document or photo.
     *
     * Handles:
     * 1. Server-side image optimization and compression (via Intervention Image).
     * 2. Privacy compliance and automatic face blurring (via FastAPI microservice).
     * 3. Dual-storage isolation (private internal vs public masked).
     * 4. Strict visibility enforcement for identity documents.
     */
    public function storeDocument(UploadedFile $file, array $data, ?User $user = null): Document
    {
        $mime = $file->getMimeType();
        $isImage = str_starts_with($mime, 'image/');
        $originalName = $file->getClientOriginalName();
        $docType = $data['document_type'] ?? 'FOTO_KONDISI_AWAL';
        $uuid = Str::uuid()->toString();
        $year = date('Y');

        // Enforce strict INTERNAL_ONLY visibility for sensitive identity documents
        $visibility = in_array($docType, self::SENSITIVE_TYPES, true)
            ? 'INTERNAL_ONLY'
            : ($data['visibility'] ?? 'PUBLIC_MASKED');

        $internalFolder = "internal/documents/{$year}";
        $publicFolder = "documents/{$year}";

        // Ensure directories exist
        if (!Storage::disk('local')->exists($internalFolder)) {
            Storage::disk('local')->makeDirectory($internalFolder);
        }
        if (!Storage::disk('public')->exists($publicFolder)) {
            Storage::disk('public')->makeDirectory($publicFolder);
        }

        $internalFilename = "{$uuid}." . ($isImage ? 'jpg' : $file->getClientOriginalExtension());
        $internalPath = "{$internalFolder}/{$internalFilename}";
        $publicFilePath = null;
        $finalSize = 0;

        if ($isImage) {
            // 1. Optimize and compress image using Intervention Image GD driver
            $image = $this->imageManager->decodePath($file->getRealPath());

            // Scale down high-resolution smartphone photos (max 1920x1920)
            if ($image->width() > 1920 || $image->height() > 1920) {
                $image->scaleDown(1920, 1920);
            }

            // Encode to JPEG quality 82 for optimal size vs visual quality balance
            $compressedBytes = (string) $image->encodeUsingFileExtension('jpg', 82);
            $finalSize = strlen($compressedBytes);

            // Store original compressed photo in private internal storage
            Storage::disk('local')->put($internalPath, $compressedBytes);

            // 2. If visibility is PUBLIC_MASKED, generate sanitized public version
            if ($visibility === 'PUBLIC_MASKED') {
                $publicFilename = "public_{$uuid}.jpg";
                $publicRelPath = "{$publicFolder}/{$publicFilename}";

                // Request face blurring from Privacy AI microservice if it's a citizen/field photo
                if (in_array($docType, self::CITIZEN_PHOTO_TYPES, true)) {
                    $blurType = $data['blur_type'] ?? 'pixelate';
                    $blurResult = $this->privacyService->blurImage($compressedBytes, $blurType, 51, 0.20);
                    $publicBytes = ($blurResult && !empty($blurResult['image_bytes']))
                        ? $blurResult['image_bytes']
                        : $compressedBytes;
                } else {
                    $publicBytes = $compressedBytes;
                }

                Storage::disk('public')->put($publicRelPath, $publicBytes);
                $publicFilePath = $publicRelPath;
            }
        } else {
            // PDF or other non-image binary document
            $fileBytes = file_get_contents($file->getRealPath());
            $finalSize = strlen($fileBytes);
            Storage::disk('local')->put($internalPath, $fileBytes);

            if ($visibility === 'PUBLIC_MASKED') {
                $publicFilename = "public_{$uuid}." . $file->getClientOriginalExtension();
                $publicRelPath = "{$publicFolder}/{$publicFilename}";
                Storage::disk('public')->put($publicRelPath, $fileBytes);
                $publicFilePath = $publicRelPath;
            }
        }

        // 3. Persist record in database
        $document = Document::create([
            'application_id' => $data['application_id'] ?? null,
            'document_type' => $docType,
            'file_path' => $internalPath,
            'public_file_path' => $publicFilePath,
            'original_filename' => $originalName,
            'file_size' => $finalSize,
            'mime_type' => $isImage ? 'image/jpeg' : $mime,
            'visibility' => $visibility,
            'description' => $data['description'] ?? null,
            'uploaded_by' => $user?->id ?? $data['uploaded_by'] ?? null,
        ]);

        // 4. Record audit log if attached to an application
        if (!empty($document->application_id)) {
            AuditLog::create([
                'application_id' => $document->application_id,
                'user_id' => $user?->id,
                'action' => 'DOCUMENT_UPLOADED',
                'description' => "Berkas '{$originalName}' ({$docType}) diunggah dengan visibilitas {$visibility}.",
                'changes' => [
                    'document_id' => $document->id,
                    'document_type' => $docType,
                    'visibility' => $visibility,
                    'file_size' => $finalSize,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return $document;
    }

    /**
     * Delete document physical files and database record.
     */
    public function deleteDocument(Document $document): bool
    {
        // Delete internal file
        if (!empty($document->file_path) && Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        // Delete public file
        if (!empty($document->public_file_path) && Storage::disk('public')->exists($document->public_file_path)) {
            Storage::disk('public')->delete($document->public_file_path);
        }

        return $document->delete();
    }
}

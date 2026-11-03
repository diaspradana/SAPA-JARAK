<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
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

    // Internal (officials-only) copy: high fidelity for verification
    public const INTERNAL_MAX_DIMENSION = 1920;
    public const INTERNAL_JPEG_QUALITY = 82;

    // Public masked copy: compressed after face blurring so tracking pages load fast on village networks
    public const PUBLIC_MAX_DIMENSION = 1280;
    public const PUBLIC_JPEG_QUALITY = 75;

    public const BLUR_BLURRED = 'BLURRED';
    public const BLUR_NO_FACE = 'NO_FACE';
    public const BLUR_PENDING = 'PENDING';
    public const BLUR_SKIPPED = 'SKIPPED';

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
     * 1. Internal copy: scaled to 1920px, JPEG q82, private disk (officials only).
     * 2. Public copy for citizen photos: face blur via ml_service/face_blur.py, THEN compression
     *    (1280px, JPEG q75). If the blur service is unavailable the photo is marked PENDING and
     *    no public copy exists until `php artisan documents:blur-pending` succeeds.
     * 3. Strict INTERNAL_ONLY visibility for identity documents.
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

        $internalPath = "internal/documents/{$year}/{$uuid}." . ($isImage ? 'jpg' : $file->getClientOriginalExtension());
        $publicFilePath = null;
        $publicFileSize = null;

        if ($isImage) {
            $internalBytes = $this->encodeJpeg(
                file_get_contents($file->getRealPath()),
                self::INTERNAL_MAX_DIMENSION,
                self::INTERNAL_JPEG_QUALITY
            );
        } else {
            // PDF or other non-image binary document
            $internalBytes = file_get_contents($file->getRealPath());

            if ($visibility === 'PUBLIC_MASKED') {
                $publicFilePath = "documents/{$year}/public_{$uuid}." . $file->getClientOriginalExtension();
                Storage::disk('public')->put($publicFilePath, $internalBytes);
                $publicFileSize = strlen($internalBytes);
            }
        }

        Storage::disk('local')->put($internalPath, $internalBytes);

        $document = Document::create([
            'application_id' => $data['application_id'] ?? null,
            'document_type' => $docType,
            'file_path' => $internalPath,
            'public_file_path' => $publicFilePath,
            'original_filename' => $originalName,
            'file_size' => strlen($internalBytes),
            'public_file_size' => $publicFileSize,
            'mime_type' => $isImage ? 'image/jpeg' : $mime,
            'visibility' => $visibility,
            'description' => $data['description'] ?? null,
            'uploaded_by' => $user?->id ?? $data['uploaded_by'] ?? null,
        ]);

        if ($isImage && $visibility === 'PUBLIC_MASKED') {
            $this->publishMaskedCopy($document, $internalBytes, $data['blur_type'] ?? 'pixelate');
        }

        // Record audit log if attached to an application
        if (!empty($document->application_id)) {
            AuditLog::create([
                'application_id' => $document->application_id,
                'user_id' => $user?->id,
                'actor_name' => $user?->name ?? 'Warga',
                'action' => 'DOCUMENT_UPLOADED',
                'entity_type' => Document::class,
                'entity_id' => $document->id,
                'new_values' => [
                    'document_id' => $document->id,
                    'document_type' => $docType,
                    'visibility' => $visibility,
                    'file_size' => $document->file_size,
                    'blur_status' => $document->blur_status,
                    'faces_detected' => $document->faces_detected,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return $document;
    }

    /**
     * Retry face blurring for a photo stored while the ML service was unavailable.
     */
    public function retryPendingBlur(Document $document): bool
    {
        $internalBytes = Storage::disk('local')->get($document->file_path);
        if ($internalBytes === null) {
            Log::warning("Berkas internal dokumen #{$document->id} tidak ditemukan: {$document->file_path}");
            return false;
        }

        return $this->publishMaskedCopy($document, $internalBytes);
    }

    /**
     * Build the public copy: blur faces (citizen photos), compress, store, and record metadata.
     * Never publishes an unblurred citizen photo.
     */
    protected function publishMaskedCopy(Document $document, string $sourceBytes, string $blurType = 'pixelate'): bool
    {
        $facesDetected = null;
        $blurStatus = self::BLUR_SKIPPED;
        $bytesToPublish = $sourceBytes;

        if (in_array($document->document_type, self::CITIZEN_PHOTO_TYPES, true)) {
            $blurResult = $this->privacyService->blurImage($sourceBytes, $blurType);
            if (!$blurResult) {
                $document->update(['blur_status' => self::BLUR_PENDING, 'public_file_path' => null, 'public_file_size' => null]);
                return false;
            }

            $bytesToPublish = $blurResult['image_bytes'];
            $facesDetected = $blurResult['faces_detected'];
            $blurStatus = $facesDetected > 0 ? self::BLUR_BLURRED : self::BLUR_NO_FACE;
        }

        try {
            $publicBytes = $this->encodeJpeg($bytesToPublish, self::PUBLIC_MAX_DIMENSION, self::PUBLIC_JPEG_QUALITY);
        } catch (\Throwable $e) {
            // ML returned something that is not a decodable image: keep it private and retry later
            Log::warning("Hasil blur dokumen #{$document->id} tidak dapat dikompresi: " . $e->getMessage());
            $document->update(['blur_status' => self::BLUR_PENDING, 'public_file_path' => null, 'public_file_size' => null]);
            return false;
        }

        $publicPath = sprintf(
            'documents/%s/public_%s.jpg',
            $document->created_at?->format('Y') ?? date('Y'),
            pathinfo($document->file_path, PATHINFO_FILENAME)
        );
        Storage::disk('public')->put($publicPath, $publicBytes);

        $document->update([
            'public_file_path' => $publicPath,
            'public_file_size' => strlen($publicBytes),
            'blur_status' => $blurStatus,
            'faces_detected' => $facesDetected,
        ]);

        return true;
    }

    /**
     * Decode any supported image, scale down to fit $maxDimension, and re-encode as JPEG.
     */
    protected function encodeJpeg(string $bytes, int $maxDimension, int $quality): string
    {
        $image = $this->imageManager->decodeBinary($bytes);

        if ($image->width() > $maxDimension || $image->height() > $maxDimension) {
            $image->scaleDown($maxDimension, $maxDimension);
        }

        return (string) $image->encodeUsingFileExtension('jpg', $quality);
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

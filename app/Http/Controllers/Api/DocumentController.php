<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Document;
use App\Services\MediaStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    protected MediaStorageService $mediaService;

    public function __construct(MediaStorageService $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    /**
     * Upload and store a physical document or citizen photo.
     * Supports multi-part form-data with automatic compression and face blurring.
     */
    public function upload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240|mimes:jpeg,jpg,png,webp,pdf',
            'document_type' => 'nullable|string|in:FOTO_KONDISI_AWAL,FOTO_SURVEI_KASUN,FOTO_PROGRES_50,FOTO_SELESAI_100,KTP_KK,SURAT_KETERANGAN_DOKTER,BAST_SCAN,KUITANSI_SPJ',
            'application_id' => 'nullable|integer|exists:applications,id',
            'ticket_number' => 'nullable|string|exists:applications,ticket_number',
            'visibility' => 'nullable|string|in:PUBLIC_MASKED,INTERNAL_ONLY',
            'blur_type' => 'nullable|string|in:pixelate,mosaic,gaussian',
            'description' => 'nullable|string|max:500',
        ]);

        $applicationId = $validated['application_id'] ?? null;
        if (!$applicationId && !empty($validated['ticket_number'])) {
            $app = Application::where('ticket_number', $validated['ticket_number'])->first();
            $applicationId = $app?->id;
        }

        $user = $request->user('sanctum') ?? $request->user();

        $document = $this->mediaService->storeDocument(
            $request->file('file'),
            [
                'application_id' => $applicationId,
                'document_type' => $validated['document_type'] ?? 'FOTO_KONDISI_AWAL',
                'visibility' => $validated['visibility'] ?? 'PUBLIC_MASKED',
                'blur_type' => $validated['blur_type'] ?? 'pixelate',
                'description' => $validated['description'] ?? null,
                'uploaded_by' => $user?->id,
            ],
            $user
        );

        return response()->json([
            'success' => true,
            'message' => 'Berkas berhasil diunggah dan diproses ke penyimpanan media.',
            'data' => [
                'id' => $document->id,
                'application_id' => $document->application_id,
                'document_type' => $document->document_type,
                'original_filename' => $document->original_filename,
                'file_size' => $document->file_size,
                'formatted_size' => $document->formatted_size,
                'mime_type' => $document->mime_type,
                'visibility' => $document->visibility,
                'is_image' => $document->is_image,
                'public_url' => $document->public_url,
                'has_blurred_public_copy' => !empty($document->public_file_path),
                'created_at' => $document->created_at,
            ],
        ], 201);
    }

    /**
     * List documents with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::query()->with('uploader:id,name,role');

        if ($request->filled('application_id')) {
            $query->where('application_id', $request->query('application_id'));
        }

        if ($request->filled('document_type')) {
            $query->where('document_type', $request->query('document_type'));
        }

        $user = $request->user('sanctum') ?? $request->user();

        // If not authenticated or has no official role, restrict to public masked only
        if (!$user) {
            $query->where('visibility', 'PUBLIC_MASKED');
        } elseif ($request->filled('visibility')) {
            $query->where('visibility', $request->query('visibility'));
        }

        $documents = $query->orderByDesc('id')->paginate($request->query('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $documents->items(),
            'pagination' => [
                'current_page' => $documents->currentPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
                'last_page' => $documents->lastPage(),
            ],
        ]);
    }

    /**
     * Get document metadata by ID.
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $document = Document::with(['uploader:id,name,role', 'application:id,ticket_number,status'])->find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => "Dokumen dengan ID #{$id} tidak ditemukan.",
            ], 404);
        }

        $user = $request->user('sanctum') ?? $request->user();

        // If document is INTERNAL_ONLY, require authenticated official
        if ($document->visibility === 'INTERNAL_ONLY') {
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen bersifat rahasia/internal. Otentikasi aparatur diperlukan.',
                ], 401);
            }

            $allowedRoles = ['kades', 'kasi_kesra', 'sekdes', 'admin', 'kasun'];
            if (!in_array($user->role, $allowedRoles, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak: Anda tidak memiliki wewenang untuk melihat dokumen internal.',
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $document,
        ]);
    }

    /**
     * Download or stream the physical document file.
     */
    public function download(int $id, Request $request): BinaryFileResponse|StreamedResponse|JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => "Dokumen dengan ID #{$id} tidak ditemukan.",
            ], 404);
        }

        $version = $request->query('version', 'auto');
        $user = $request->user('sanctum') ?? $request->user();

        // Determine which file to serve
        // If version=original OR visibility=INTERNAL_ONLY, must verify official permissions
        if ($version === 'original' || $document->visibility === 'INTERNAL_ONLY' || empty($document->public_file_path)) {
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Berkas asli bersifat internal. Otentikasi aparatur diperlukan.',
                ], 401);
            }

            $allowedRoles = ['kades', 'kasi_kesra', 'sekdes', 'admin', 'kasun'];
            if (!in_array($user->role, $allowedRoles, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak: Anda tidak memiliki izin untuk mengunduh berkas internal ini.',
                ], 403);
            }

            if (!Storage::disk('local')->exists($document->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Berkas fisik tidak ditemukan di penyimpanan internal server.',
                ], 404);
            }

            return Storage::disk('local')->response(
                $document->file_path,
                $document->original_filename ?? basename($document->file_path),
                [
                    'Content-Type' => $document->mime_type ?? 'application/octet-stream',
                ]
            );
        }

        // Otherwise, serve public sanitized version
        if (!Storage::disk('public')->exists($document->public_file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Berkas publik tidak ditemukan di penyimpanan server.',
            ], 404);
        }

        return Storage::disk('public')->response(
            $document->public_file_path,
            $document->original_filename ?? basename($document->public_file_path),
            [
                'Content-Type' => $document->mime_type ?? 'application/octet-stream',
            ]
        );
    }

    /**
     * Delete document and physical files.
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => "Dokumen dengan ID #{$id} tidak ditemukan.",
            ], 404);
        }

        $user = $request->user('sanctum') ?? $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Otentikasi diperlukan untuk menghapus berkas.',
            ], 401);
        }

        $isAdminOrLeader = in_array($user->role, ['kades', 'kasi_kesra', 'admin'], true);
        $isOwner = $document->uploaded_by === $user->id;

        if (!$isAdminOrLeader && !$isOwner) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Hanya pemilik unggahan atau pengelola desa yang dapat menghapus berkas ini.',
            ], 403);
        }

        $this->mediaService->deleteDocument($document);

        return response()->json([
            'success' => true,
            'message' => "Dokumen #{$id} beserta berkas fisiknya berhasil dihapus.",
        ]);
    }
}

<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Service to handle citizen photo privacy & automatic face blurring (PRD Section 18 & UU PDP).
 * Communicates with the FastAPI AI Assistant microservice via Docker network.
 */
class ImagePrivacyService
{
    protected string $aiServiceUrl;

    public function __construct()
    {
        $this->aiServiceUrl = env('ML_SERVICE_URL', 'http://ai_assistant:8001');
    }

    /**
     * Send an image to the FastAPI Privacy AI microservice for face blurring.
     * Returns raw binary JPEG bytes of the blurred image, or null on failure.
     */
    public function blurImage(
        string $imageBytes,
        string $blurType = 'pixelate',
        int $blurStrength = 51,
        float $padding = 0.20,
        float $scoreThreshold = 0.55
    ): ?array {
        try {
            $response = Http::timeout(6.0)
                ->attach('file', $imageBytes, 'image.jpg', ['Content-Type' => 'image/jpeg'])
                ->post("{$this->aiServiceUrl}/blur-face", [
                    'blur_type' => $blurType,
                    'blur_strength' => $blurStrength,
                    'padding' => $padding,
                    'score_threshold' => $scoreThreshold,
                    'return_format' => 'image',
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'image_bytes' => $response->body(),
                    'faces_detected' => (int) $response->header('X-Faces-Detected', 0),
                    'detector_used' => $response->header('X-Detector-Used', 'YuNet-DNN'),
                    'blur_type' => $response->header('X-Blur-Type', $blurType),
                    'processing_time_ms' => (float) $response->header('X-Processing-Time-Ms', 0.0),
                ];
            }
        } catch (\Throwable $e) {
            \Log::warning("FastAPI Face Blur service failed: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Dual-storage workflow according to PRD Section 18:
     * 1. Store original photo in internal/private disk.
     * 2. Send photo to FastAPI Privacy AI engine to blur detected faces.
     * 3. Store sanitized version in public disk for transparency portal.
     *
     * @return array [ 'original_path' => string, 'public_path' => string, 'faces_detected' => int ]
     */
    public function processAndStoreCitizenPhoto(UploadedFile $file, string $folder = 'application_docs'): array
    {
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $fileBytes = file_get_contents($file->getRealPath());

        // 1. Store original photo in internal storage (restricted to Kades / Kasi Kesra)
        $internalPath = "internal/{$folder}/{$filename}";
        Storage::disk('local')->put($internalPath, $fileBytes);

        // 2. Request face blurring from FastAPI microservice
        $blurResult = $this->blurImage($fileBytes);

        // 3. Store public version (blurred if face detected, or fallback to original if service unavailable)
        $publicFilename = 'public_' . Str::uuid()->toString() . '.jpg';
        $publicPath = "public/{$folder}/{$publicFilename}";

        $publicBytes = ($blurResult && isset($blurResult['image_bytes']))
            ? $blurResult['image_bytes']
            : $fileBytes;

        Storage::disk('public')->put($publicPath, $publicBytes);

        return [
            'original_path' => $internalPath,
            'public_path' => $publicPath,
            'public_url' => Storage::disk('public')->url($publicPath),
            'faces_detected' => $blurResult['faces_detected'] ?? 0,
            'processing_time_ms' => $blurResult['processing_time_ms'] ?? 0.0,
            'blurred' => ($blurResult['faces_detected'] ?? 0) > 0,
        ];
    }
}

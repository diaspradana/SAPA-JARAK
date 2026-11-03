<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service to handle citizen photo privacy & automatic face blurring (PRD Section 18 & UU PDP).
 * Communicates with the FastAPI AI Assistant microservice (ml_service/face_blur.py).
 */
class ImagePrivacyService
{
    /**
     * Send an image to the FastAPI Privacy AI microservice for face blurring.
     * Returns the blurred JPEG bytes with detection metadata, or null when the
     * service is unreachable or rejects the image (caller must NOT publish the original).
     */
    public function blurImage(
        string $imageBytes,
        string $blurType = 'pixelate',
        int $blurStrength = 51,
        float $padding = 0.20,
        float $scoreThreshold = 0.55
    ): ?array {
        // FastAPI reads these as Query(...) parameters, not multipart form fields
        $query = http_build_query([
            'blur_type' => $blurType,
            'blur_strength' => $blurStrength,
            'padding' => $padding,
            'score_threshold' => $scoreThreshold,
            'return_format' => 'image',
        ]);

        try {
            $response = Http::timeout(config('services.ml.timeout'))
                ->attach('file', $imageBytes, 'image.jpg', ['Content-Type' => 'image/jpeg'])
                ->post(config('services.ml.url') . "/blur-face?{$query}");

            if ($response->successful() && $response->body() !== '') {
                return [
                    'success' => true,
                    'image_bytes' => $response->body(),
                    'faces_detected' => (int) $response->header('X-Faces-Detected'),
                    'detector_used' => $response->header('X-Detector-Used') ?: 'YuNet-DNN',
                    'blur_type' => $response->header('X-Blur-Type') ?: $blurType,
                    'processing_time_ms' => (float) $response->header('X-Processing-Time-Ms'),
                ];
            }

            Log::warning("FastAPI Face Blur service returned HTTP {$response->status()}: " . mb_substr($response->body(), 0, 300));
        } catch (\Throwable $e) {
            Log::warning('FastAPI Face Blur service failed: ' . $e->getMessage());
        }

        return null;
    }
}

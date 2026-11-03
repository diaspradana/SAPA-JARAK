<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Services\MediaStorageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (!extension_loaded('gd')) {
            $this->markTestSkipped('Ekstensi PHP GD diperlukan untuk kompresi gambar.');
        }

        Storage::fake('local');
        Storage::fake('public');
        config(['services.ml.url' => 'http://ml.test']);
    }

    public function test_citizen_photo_is_blurred_then_compressed_and_recorded(): void
    {
        Http::fake([
            'ml.test/blur-face*' => Http::response($this->jpeg(2400, 1600), 200, [
                'Content-Type' => 'image/jpeg',
                'X-Faces-Detected' => '2',
            ]),
        ]);

        $response = $this->postJson('/api/documents/upload', [
            'file' => UploadedFile::fake()->image('rumah.jpg', 3000, 2000),
            'document_type' => 'FOTO_KONDISI_AWAL',
            'visibility' => 'PUBLIC_MASKED',
            'blur_type' => 'pixelate',
        ]);

        $response->assertCreated()->assertJsonPath('data.has_blurred_public_copy', true);

        $document = Document::firstOrFail();
        $this->assertSame(MediaStorageService::BLUR_BLURRED, $document->blur_status);
        $this->assertSame(2, $document->faces_detected);
        $this->assertNotNull($document->public_url);

        Storage::disk('local')->assertExists($document->file_path);
        Storage::disk('public')->assertExists($document->public_file_path);

        $publicBytes = Storage::disk('public')->get($document->public_file_path);
        [$width, $height] = getimagesizefromstring($publicBytes);
        $this->assertLessThanOrEqual(MediaStorageService::PUBLIC_MAX_DIMENSION, max($width, $height));
        $this->assertSame(strlen($publicBytes), $document->public_file_size);

        Http::assertSent(fn (Request $request) => str_contains($request->url(), 'blur_type=pixelate')
            && str_contains($request->url(), 'return_format=image'));
    }

    public function test_photo_without_faces_is_published_as_no_face(): void
    {
        Http::fake([
            'ml.test/blur-face*' => Http::response($this->jpeg(800, 600), 200, ['X-Faces-Detected' => '0']),
        ]);

        $this->postJson('/api/documents/upload', [
            'file' => UploadedFile::fake()->image('rumah.jpg', 800, 600),
            'document_type' => 'FOTO_KONDISI_AWAL',
        ])->assertCreated();

        $document = Document::firstOrFail();
        $this->assertSame(MediaStorageService::BLUR_NO_FACE, $document->blur_status);
        $this->assertSame(0, $document->faces_detected);
        Storage::disk('public')->assertExists($document->public_file_path);
    }

    public function test_photo_is_kept_private_when_blur_service_fails(): void
    {
        Http::fake(['ml.test/blur-face*' => Http::response('error', 500)]);

        $this->postJson('/api/documents/upload', [
            'file' => UploadedFile::fake()->image('rumah.jpg', 1200, 900),
            'document_type' => 'FOTO_KONDISI_AWAL',
        ])->assertCreated()->assertJsonPath('data.has_blurred_public_copy', false);

        $document = Document::firstOrFail();
        $this->assertSame(MediaStorageService::BLUR_PENDING, $document->blur_status);
        $this->assertNull($document->public_file_path);
        $this->assertNull($document->public_url);
        Storage::disk('local')->assertExists($document->file_path);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_pending_photo_is_published_after_retry_command(): void
    {
        Http::fakeSequence('ml.test/blur-face*')
            ->push('error', 500)
            ->push($this->jpeg(1200, 900), 200, ['X-Faces-Detected' => '1']);

        $this->postJson('/api/documents/upload', [
            'file' => UploadedFile::fake()->image('rumah.jpg', 1200, 900),
            'document_type' => 'FOTO_KONDISI_AWAL',
        ])->assertCreated();
        $this->assertSame(MediaStorageService::BLUR_PENDING, Document::firstOrFail()->blur_status);

        $this->artisan('documents:blur-pending')->assertExitCode(0);

        $document = Document::firstOrFail();
        $this->assertSame(MediaStorageService::BLUR_BLURRED, $document->blur_status);
        $this->assertSame(1, $document->faces_detected);
        Storage::disk('public')->assertExists($document->public_file_path);
    }

    public function test_photo_larger_than_10mb_is_rejected(): void
    {
        Http::fake();

        $this->postJson('/api/documents/upload', [
            'file' => UploadedFile::fake()->create('besar.jpg', 10241, 'image/jpeg'),
            'document_type' => 'FOTO_KONDISI_AWAL',
        ])->assertStatus(422)->assertJsonValidationErrors('file');

        $this->assertSame(0, Document::count());
        Http::assertNothingSent();
    }

    private function jpeg(int $width, int $height): string
    {
        $image = imagecreatetruecolor($width, $height);
        imagefill($image, 0, 0, imagecolorallocate($image, 120, 90, 60));
        ob_start();
        imagejpeg($image, null, 90);
        return (string) ob_get_clean();
    }
}

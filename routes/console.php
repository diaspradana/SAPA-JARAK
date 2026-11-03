<?php

use App\Models\Document;
use App\Services\MediaStorageService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('documents:blur-pending', function (MediaStorageService $media) {
    $published = 0;
    $failed = 0;

    Document::where('blur_status', MediaStorageService::BLUR_PENDING)->orderBy('id')->each(function (Document $document) use ($media, &$published, &$failed) {
        $media->retryPendingBlur($document) ? $published++ : $failed++;
    });

    $this->info("Foto tersensor & dipublikasikan: {$published}. Masih tertunda: {$failed}.");

    return $failed > 0 ? 1 : 0;
})->purpose('Proses ulang sensor wajah untuk foto warga yang tertunda karena ml_service tidak tersedia');

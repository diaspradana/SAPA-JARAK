<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicApplicationController;
use App\Http\Controllers\Api\PublicTransparencyController;
use App\Http\Controllers\Api\KasunController;
use App\Http\Controllers\Api\DesaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController;

/*
|--------------------------------------------------------------------------
| API Routes for SAPA-JARAK
|--------------------------------------------------------------------------
*/

// Public Routes (Masyarakat / Pelapor) - Bebas Akses Tanpa Autentikasi
Route::prefix('public')->group(function () {
    Route::get('/hamlets', [PublicApplicationController::class, 'hamlets']);
    Route::post('/otp/request', [PublicApplicationController::class, 'requestOtp']);
    Route::post('/applications', [PublicApplicationController::class, 'submit']);
    Route::get('/applications/track/{ticket}', [PublicApplicationController::class, 'track']);
    Route::get('/applications/{ticket}/pdf', [PublicApplicationController::class, 'downloadReceiptPdf']);
    Route::get('/transparency/metrics', [PublicTransparencyController::class, 'metrics']);
    Route::get('/transparency/ledger', [PublicTransparencyController::class, 'ledger']);
});

// Auth Routes (Login Resmi & Demo Switcher)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/users', [AuthController::class, 'users']);
    Route::post('/switch-role', [AuthController::class, 'switchRole']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Kasun (Surveyor & Verifikator Wilayah) - Dilindungi Sanctum & Peran Kasun
Route::prefix('kasun')->middleware(['auth:sanctum', 'role:kasun,admin'])->group(function () {
    Route::get('/queue', [KasunController::class, 'queue']);
    Route::post('/applications/{id}/survey', [KasunController::class, 'submitSurvey']);
    Route::post('/ai-recommendation', [KasunController::class, 'getAiRecommendation']);
});

// Pemerintah Desa (Kasi Kesra, Sekdes, Kades, Admin) - Dilindungi Sanctum & Peran Desa
Route::prefix('desa')->middleware(['auth:sanctum', 'role:kades,kasi_kesra,sekdes,admin'])->group(function () {
    Route::get('/dashboard', [DesaController::class, 'dashboard']);
    Route::post('/applications/{id}/validate', [DesaController::class, 'validateAndFund']);
    Route::post('/applications/{id}/procurement', [DesaController::class, 'updateProcurement']);
    Route::post('/applications/{id}/handover', [DesaController::class, 'completeHandover']);
    Route::get('/applications/{id}/bast/pdf', [DesaController::class, 'downloadBastPdf']);
    Route::get('/reports/spj', [DesaController::class, 'spjReport']);
    Route::get('/reports/spj/pdf', [DesaController::class, 'downloadSpjPdf']);
});

// Modul Pengunggahan Berkas & Media Storage (Upload, Kompresi, dan Privasi Sensor Wajah)
Route::prefix('documents')->group(function () {
    Route::post('/upload', [DocumentController::class, 'upload']);
    Route::get('/', [DocumentController::class, 'index']);
    Route::get('/{id}', [DocumentController::class, 'show']);
    Route::get('/{id}/file', [DocumentController::class, 'download']);
    Route::delete('/{id}', [DocumentController::class, 'destroy'])->middleware('auth:sanctum');
});



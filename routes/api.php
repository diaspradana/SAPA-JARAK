<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicApplicationController;
use App\Http\Controllers\Api\PublicTransparencyController;
use App\Http\Controllers\Api\KasunController;
use App\Http\Controllers\Api\DesaController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes for SAPA-JARAK
|--------------------------------------------------------------------------
*/

// Public Routes (Masyarakat / Pelapor)
Route::prefix('public')->group(function () {
    Route::get('/hamlets', [PublicApplicationController::class, 'hamlets']);
    Route::post('/otp/request', [PublicApplicationController::class, 'requestOtp']);
    Route::post('/applications', [PublicApplicationController::class, 'submit']);
    Route::get('/applications/track/{ticket}', [PublicApplicationController::class, 'track']);
    Route::get('/transparency/metrics', [PublicTransparencyController::class, 'metrics']);
    Route::get('/transparency/ledger', [PublicTransparencyController::class, 'ledger']);
});

// Kasun (Surveyor & Verifikator Wilayah)
Route::prefix('kasun')->group(function () {
    Route::get('/queue', [KasunController::class, 'queue']);
    Route::post('/applications/{id}/survey', [KasunController::class, 'submitSurvey']);
});

// Pemerintah Desa (Kasi Kesra, Sekdes, Kades)
Route::prefix('desa')->group(function () {
    Route::get('/dashboard', [DesaController::class, 'dashboard']);
    Route::post('/applications/{id}/validate', [DesaController::class, 'validateAndFund']);
    Route::post('/applications/{id}/procurement', [DesaController::class, 'updateProcurement']);
    Route::post('/applications/{id}/handover', [DesaController::class, 'completeHandover']);
    Route::get('/reports/spj', [DesaController::class, 'spjReport']);
});

// Auth & Interactive Demo Role Switcher
Route::prefix('auth')->group(function () {
    Route::get('/users', [AuthController::class, 'users']);
    Route::post('/switch-role', [AuthController::class, 'switchRole']);
});

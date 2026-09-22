<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes for SAPA-JARAK
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (view()->exists('spa')) {
        return view('spa');
    }
    return response()->json([
        'app' => 'SAPA-JARAK Backend API',
        'version' => '1.0.0',
        'status' => 'online',
    ]);
});

// Single Page Application Fallback Route
Route::fallback(function () {
    if (view()->exists('spa')) {
        return view('spa');
    }
    return response()->json([
        'message' => 'Resource not found.',
    ], 404);
});

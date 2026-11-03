<?php

return [

    'admin_registration_code' => env('ADMIN_REGISTRATION_CODE'),

    'postmark' => [
        'token' => env('POSTMARK_USAGE_TRACKING_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'whatsapp' => [
        'url' => env('WHATSAPP_GATEWAY_URL', 'https://api.fonnte.com/send'),
        'token' => env('WHATSAPP_API_TOKEN', 'mock_token_sapa_jarak_2026'),
        'simulation' => env('WHATSAPP_SIMULATION_MODE', true),
    ],

    // FastAPI sidecar (ml_service): /predict & /blur-face. Docker sets ML_SERVICE_URL=http://ai_assistant:8001
    'ml' => [
        'url' => rtrim(env('ML_SERVICE_URL', 'http://127.0.0.1:8001'), '/'),
        'timeout' => (float) env('ML_SERVICE_TIMEOUT', 15),
    ],

];

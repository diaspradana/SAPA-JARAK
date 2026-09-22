<?php

return [

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

];

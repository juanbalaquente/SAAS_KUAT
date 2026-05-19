<?php

return [
    'mailgun'  => ['domain' => env('MAILGUN_DOMAIN'), 'secret' => env('MAILGUN_SECRET'), 'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net')],
    'postmark' => ['token' => env('POSTMARK_TOKEN')],
    'ses'      => ['key' => env('AWS_ACCESS_KEY_ID'), 'secret' => env('AWS_SECRET_ACCESS_KEY'), 'region' => env('AWS_DEFAULT_REGION', 'us-east-1')],
    'evolution' => [
        'url'      => env('EVOLUTION_API_URL', 'http://localhost:8080'),
        'key'      => env('EVOLUTION_API_KEY'),
        'instance' => env('EVOLUTION_INSTANCE', 'saas_kuat'),
    ],
];

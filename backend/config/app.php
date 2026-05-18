<?php

return [
    'name'            => env('APP_NAME', 'SAAS Kuat'),
    'env'             => env('APP_ENV', 'production'),
    'debug'           => (bool) env('APP_DEBUG', false),
    'url'             => env('APP_URL', 'http://localhost'),
    'frontend_url'    => env('FRONTEND_URL', 'http://localhost:5173'),
    'timezone'        => 'America/Sao_Paulo',
    'locale'          => 'pt_BR',
    'fallback_locale' => 'en',
    'faker_locale'    => 'pt_BR',
    'cipher'          => 'AES-256-CBC',
    'key'             => env('APP_KEY'),
    'previous_keys'   => array_filter(explode(',', env('APP_PREVIOUS_KEYS', ''))),
    'maintenance'     => ['driver' => 'file'],
    'providers'       => Illuminate\Support\ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
    ])->toArray(),
];

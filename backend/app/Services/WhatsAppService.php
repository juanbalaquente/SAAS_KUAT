<?php

namespace App\Services;

use App\Models\NotificacaoLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $url;
    private string $key;
    private string $instance;

    public function __construct()
    {
        $this->url      = rtrim(config('services.evolution.url', ''), '/');
        $this->key      = config('services.evolution.key', '');
        $this->instance = config('services.evolution.instance', 'saas_kuat');
    }

    public function send(string $phone, string $message, ?int $clienteId = null): bool
    {
        $status = 'enviado';
        $phone  = $this->formatPhone($phone);

        try {
            if ($this->url && $this->key) {
                $response = Http::withHeaders(['apikey' => $this->key])
                    ->post("{$this->url}/message/sendText/{$this->instance}", [
                        'number' => $phone,
                        'text'   => $message,
                    ]);

                if (!$response->successful()) {
                    $status = 'erro';
                    Log::warning('WhatsApp send failed', [
                        'phone'    => $phone,
                        'status'   => $response->status(),
                        'response' => $response->body(),
                    ]);
                }
            } else {
                Log::info("WhatsApp [SIMULADO] → {$phone}: {$message}");
            }
        } catch (\Throwable $e) {
            $status = 'erro';
            Log::error('WhatsApp exception: ' . $e->getMessage());
        }

        NotificacaoLog::create([
            'cliente_id' => $clienteId,
            'tipo'       => 'whatsapp',
            'mensagem'   => $message,
            'status'     => $status,
        ]);

        return $status === 'enviado';
    }

    private function formatPhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (strlen($digits) <= 11) {
            $digits = '55' . $digits;
        }

        return $digits;
    }
}

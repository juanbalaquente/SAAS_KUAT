<?php

namespace App\Services;

use App\Models\NotificacaoLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public function send(string $phone, string $message, int $clienteId = null): void
    {
        $url    = config('services.evolution.url');
        $apiKey = config('services.evolution.key');

        $status = 'enviado';

        try {
            if ($url && $apiKey) {
                Http::withHeaders(['apikey' => $apiKey])
                    ->post($url . '/message/sendText', [
                        'number' => $this->formatPhone($phone),
                        'text'   => $message,
                    ]);
            } else {
                Log::info("WhatsApp [SIMULADO] → {$phone}: {$message}");
            }
        } catch (\Throwable $e) {
            $status = 'erro';
            Log::error("WhatsApp error: " . $e->getMessage());
        }

        if ($clienteId) {
            NotificacaoLog::create([
                'cliente_id' => $clienteId,
                'tipo'       => 'whatsapp',
                'mensagem'   => $message,
                'status'     => $status,
            ]);
        }
    }

    private function formatPhone(string $phone): string
    {
        return '55' . preg_replace('/\D/', '', $phone);
    }
}

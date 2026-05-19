<?php

namespace App\Jobs;

use App\Models\Agendamento;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarConfirmacaoAgendamento implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Agendamento $agendamento) {}

    public int $tries = 3;

    public function handle(WhatsAppService $whatsapp): void
    {
        try {
        $ag   = $this->agendamento->load(['cliente', 'servico', 'profissional', 'loja']);
        $hora = $ag->scheduled_at->format('d/m/Y \à\s H:i');

        $isAdega = $ag->loja->slug === 'adega_r1';

        if ($isAdega) {
            $entrega = $ag->servico->name;
            $frete   = $ag->servico->price_cents > 0
                ? "\n💳 Frete ({$entrega}): R$" . number_format($ag->servico->price_cents / 100, 2, ',', '.')
                : '';

            $pedidoBloco = '';
            if ($ag->notas) {
                $pedidoBloco = "\n\n🛒 *Pedido:*\n" . $ag->notas;
            }

            $message = "✅ *Pedido confirmado!*\n\n"
                     . "📍 *{$ag->loja->name}*\n"
                     . "👤 {$ag->cliente->name}\n"
                     . "🚚 {$entrega}\n"
                     . "🕐 {$hora}"
                     . $pedidoBloco
                     . $frete
                     . "\n\nPara cancelar: " . config('app.frontend_url') . "/confirmacao/{$ag->id}";
        } else {
            $prof    = $ag->profissional ? "\n✂️ {$ag->profissional->name}" : '';
            $message = "✅ *Agendamento confirmado!*\n\n"
                     . "📍 *{$ag->loja->name}*\n"
                     . "👤 {$ag->cliente->name}\n"
                     . "💈 {$ag->servico->name}\n"
                     . "🕐 {$hora}"
                     . $prof
                     . "\n\nPara cancelar: " . config('app.frontend_url') . "/confirmacao/{$ag->id}";
        }

        $whatsapp->send($ag->cliente->phone, $message, $ag->cliente->id);
        } catch (\Throwable $e) {
            \Log::error('EnviarConfirmacaoAgendamento falhou', ['ag_id' => $this->agendamento->id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}

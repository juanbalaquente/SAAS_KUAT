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

    public function handle(WhatsAppService $whatsapp): void
    {
        $ag      = $this->agendamento->load(['cliente', 'servico', 'profissional', 'loja']);
        $hora    = $ag->scheduled_at->format('d/m/Y \à\s H:i');
        $message = "✅ *Agendamento confirmado!*\n\n"
                 . "📍 *{$ag->loja->name}*\n"
                 . "👤 {$ag->cliente->name}\n"
                 . "💈 {$ag->servico->name}\n"
                 . "🕐 {$hora}\n\n"
                 . "Para cancelar, acesse: " . config('app.frontend_url') . "/confirmacao/{$ag->id}";

        $whatsapp->send($ag->cliente->phone, $message, $ag->cliente->id);
    }
}

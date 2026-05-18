<?php

namespace App\Jobs;

use App\Models\Agendamento;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarLembreteAgendamento implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Agendamento $agendamento) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $ag   = $this->agendamento->load(['cliente', 'servico', 'loja']);
        $hora = $ag->scheduled_at->format('H:i');
        $message = "⏰ *Lembrete de agendamento*\n\n"
                 . "Olá, {$ag->cliente->name}!\n"
                 . "Seu {$ag->servico->name} na {$ag->loja->name} é daqui a 1 hora ({$hora}).\n\n"
                 . "Até logo! 👋";

        $whatsapp->send($ag->cliente->phone, $message, $ag->cliente->id);
    }
}

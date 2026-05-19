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

    public int $tries = 3;

    public function handle(WhatsAppService $whatsapp): void
    {
        try {
            $ag   = $this->agendamento->load(['cliente', 'servico', 'loja']);
            $hora = $ag->scheduled_at->format('H:i');
            $message = "⏰ *Lembrete de agendamento*\n\n"
                     . "Olá, {$ag->cliente->name}!\n"
                     . "Seu {$ag->servico->name} na {$ag->loja->name} é daqui a 1 hora ({$hora}).\n\n"
                     . "Até logo! 👋";

            $whatsapp->send($ag->cliente->phone, $message, $ag->cliente->id);
        } catch (\Throwable $e) {
            \Log::error('EnviarLembreteAgendamento falhou', ['ag_id' => $this->agendamento->id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}

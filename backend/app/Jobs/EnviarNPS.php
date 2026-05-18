<?php

namespace App\Jobs;

use App\Models\Agendamento;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarNPS implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Agendamento $agendamento) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $ag = $this->agendamento->load(['cliente', 'servico', 'loja']);
        $message = "⭐ *Avalie seu atendimento!*\n\n"
                 . "Olá, {$ag->cliente->name}!\n"
                 . "Como foi sua experiência na *{$ag->loja->name}*?\n\n"
                 . "De 1 a 10, quanto você indicaria para um amigo?\n"
                 . "Responda aqui mesmo com o número. Sua opinião é muito importante para nós! 🙏";

        $whatsapp->send($ag->cliente->phone, $message, $ag->cliente->id);
    }
}

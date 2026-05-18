<?php

namespace App\Jobs;

use App\Models\Agendamento;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarNotificacaoCarroPronto implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Agendamento $agendamento) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $ag = $this->agendamento->load(['cliente', 'servico']);
        $message = "🚗 *Seu carro está pronto!*\n\n"
                 . "Olá, {$ag->cliente->name}!\n"
                 . "O seu veículo já está pronto para retirada na *Lava Kuat*.\n\n"
                 . "Obrigado pela preferência! ✨";

        $whatsapp->send($ag->cliente->phone, $message, $ag->cliente->id);
    }
}

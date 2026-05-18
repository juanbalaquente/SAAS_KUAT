<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\Box;
use App\Models\Loja;
use App\Models\Pedido;
use App\Models\Produto;

class DashboardController extends Controller
{
    public function resumo()
    {
        $hoje = today();

        $barbearia = Loja::where('slug', 'barbearia_kuat')->first();
        $lavaKuat  = Loja::where('slug', 'lava_kuat')->first();

        $agBarbearia = Agendamento::where('loja_id', $barbearia?->id)->whereDate('scheduled_at', $hoje);
        $agLava      = Agendamento::where('loja_id', $lavaKuat?->id)->whereDate('scheduled_at', $hoje);

        $totalAgendamentos = Agendamento::whereDate('scheduled_at', $hoje)->count();
        $totalConcluidos   = Agendamento::whereDate('scheduled_at', $hoje)->where('status', 'concluido')->count();
        $alertasEstoque    = Produto::where('ativo', true)->whereColumn('estoque_atual', '<=', 'estoque_minimo')->count();

        $fatBarbearia = Agendamento::where('agendamentos.loja_id', $barbearia?->id)
            ->whereDate('scheduled_at', $hoje)->where('status', 'concluido')
            ->join('servicos', 'agendamentos.servico_id', '=', 'servicos.id')
            ->sum('servicos.price_cents');

        $fatLava = Agendamento::where('agendamentos.loja_id', $lavaKuat?->id)
            ->whereDate('scheduled_at', $hoje)->where('status', 'concluido')
            ->join('servicos', 'agendamentos.servico_id', '=', 'servicos.id')
            ->sum('servicos.price_cents');

        $fatAdega = Pedido::whereDate('created_at', $hoje)->where('status', '!=', 'cancelado')->sum('total_cents');

        return response()->json([
            'success' => true,
            'data'    => [
                'geral' => [
                    'total_agendamentos_hoje' => $totalAgendamentos,
                    'total_concluidos'        => $totalConcluidos,
                    'alertas_estoque'         => $alertasEstoque,
                    'faturamento_total'       => $fatBarbearia + $fatLava + $fatAdega,
                ],
                'barbearia_kuat' => [
                    'agendamentos_hoje' => (clone $agBarbearia)->count(),
                    'concluidos'        => (clone $agBarbearia)->where('status', 'concluido')->count(),
                    'faturamento'       => $fatBarbearia,
                ],
                'lava_kuat' => [
                    'agendamentos_hoje' => (clone $agLava)->count(),
                    'boxes_livres'      => Box::where('status', 'livre')->count(),
                    'total_boxes'       => Box::count(),
                    'faturamento'       => $fatLava,
                ],
                'adega_r1' => [
                    'vendas_hoje'        => Pedido::whereDate('created_at', $hoje)->where('status', '!=', 'cancelado')->count(),
                    'entregas_pendentes' => Pedido::whereIn('status', ['aguardando', 'preparando', 'em_rota'])->count(),
                    'faturamento'        => $fatAdega,
                ],
            ],
        ]);
    }
}

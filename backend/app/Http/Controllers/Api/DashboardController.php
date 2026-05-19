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

        // Últimos agendamentos do dia
        $agendamentosRecentes = Agendamento::with(['cliente', 'servico', 'loja'])
            ->whereDate('scheduled_at', $hoje)
            ->orderBy('scheduled_at')
            ->limit(8)
            ->get()
            ->map(fn($ag) => [
                'id'           => $ag->id,
                'cliente'      => $ag->cliente?->name,
                'servico'      => $ag->servico?->name,
                'loja'         => $ag->loja?->name,
                'loja_slug'    => $ag->loja?->slug,
                'status'       => $ag->status,
                'scheduled_at' => $ag->scheduled_at,
            ]);

        // Faturamento dos últimos 7 dias
        $fatSemana = [];
        for ($i = 6; $i >= 0; $i--) {
            $dia = now()->subDays($i)->toDateString();
            $fatB = Agendamento::where('agendamentos.loja_id', $barbearia?->id)
                ->whereDate('scheduled_at', $dia)->where('status', 'concluido')
                ->join('servicos', 'agendamentos.servico_id', '=', 'servicos.id')
                ->sum('servicos.price_cents');
            $fatL = Agendamento::where('agendamentos.loja_id', $lavaKuat?->id)
                ->whereDate('scheduled_at', $dia)->where('status', 'concluido')
                ->join('servicos', 'agendamentos.servico_id', '=', 'servicos.id')
                ->sum('servicos.price_cents');
            $fatA = Pedido::whereDate('created_at', $dia)->where('status', '!=', 'cancelado')->sum('total_cents');
            $fatSemana[] = [
                'dia'   => now()->subDays($i)->format('d/m'),
                'total' => (int)($fatB + $fatL + $fatA),
            ];
        }

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
                    'faturamento'       => (int) $fatBarbearia,
                ],
                'lava_kuat' => [
                    'agendamentos_hoje' => (clone $agLava)->count(),
                    'boxes_livres'      => Box::where('status', 'livre')->count(),
                    'total_boxes'       => Box::count(),
                    'faturamento'       => (int) $fatLava,
                ],
                'adega_r1' => [
                    'vendas_hoje'        => Pedido::whereDate('created_at', $hoje)->where('status', '!=', 'cancelado')->count(),
                    'entregas_pendentes' => Pedido::whereIn('status', ['aguardando', 'preparando', 'em_rota'])->count(),
                    'faturamento'        => (int) $fatAdega,
                ],
                'agendamentos_recentes' => $agendamentosRecentes,
                'faturamento_semana'    => $fatSemana,
            ],
        ]);
    }
}

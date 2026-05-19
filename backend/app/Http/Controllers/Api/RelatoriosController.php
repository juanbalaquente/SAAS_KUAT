<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\Pedido;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;

class RelatoriosController extends Controller
{
    public function index(Request $request)
    {
        $inicio = $request->input('inicio', now()->startOfMonth()->toDateString());
        $fim    = $request->input('fim',    now()->toDateString());

        $agendamentos = Agendamento::with(['loja', 'servico'])
            ->whereBetween('scheduled_at', [$inicio, $fim . ' 23:59:59'])
            ->whereNotIn('status', ['cancelado'])
            ->get();

        $pedidos = Pedido::whereBetween('created_at', [$inicio, $fim . ' 23:59:59'])
            ->where('status', '!=', 'cancelado')
            ->get();

        // ── Resumo por loja ──
        $defaultLojas = [
            'barbearia_kuat' => ['nome' => 'Barbearia Kuat', 'emoji' => '✂️',  'color' => '#E8593C'],
            'lava_kuat'      => ['nome' => 'Lava Kuat',      'emoji' => '🚗', 'color' => '#E8A020'],
            'adega_r1'       => ['nome' => 'Adega R1',       'emoji' => '🍷',  'color' => '#4CAF70'],
        ];

        $resumo = [];
        foreach ($defaultLojas as $slug => $meta) {
            $ags = $agendamentos->filter(fn($ag) => $ag->loja->slug === $slug);
            $topServico = $ags->groupBy('servico.name')
                ->map->count()
                ->sortDesc()
                ->keys()
                ->first();

            $resumo[$slug] = [
                'nome'                => $meta['nome'],
                'emoji'               => $meta['emoji'],
                'color'               => $meta['color'],
                'total_agendamentos'  => $ags->count(),
                'faturamento_cents'   => (int) $ags->sum(fn($ag) => $ag->servico->price_cents),
                'top_servico'         => $topServico,
                'faturamento_pedidos_cents' => 0,
                'total_pedidos'       => 0,
            ];
        }

        $resumo['adega_r1']['faturamento_pedidos_cents'] = (int) $pedidos->sum('total_cents');
        $resumo['adega_r1']['total_pedidos']             = $pedidos->count();

        // ── Faturamento diário ──
        $period = CarbonPeriod::create($inicio, $fim);
        $faturamentoDiario = [];

        foreach ($period as $day) {
            $data   = $day->toDateString();
            $diaAgs = $agendamentos->filter(fn($ag) => $ag->scheduled_at->toDateString() === $data);

            $entry = ['data' => $data];
            foreach (array_keys($defaultLojas) as $slug) {
                $entry[$slug] = (int) $diaAgs
                    ->filter(fn($ag) => $ag->loja->slug === $slug)
                    ->sum(fn($ag) => $ag->servico->price_cents);
            }

            $diaPedidos = $pedidos->filter(
                fn($p) => Carbon::parse($p->created_at)->toDateString() === $data
            );
            $entry['adega_r1'] += (int) $diaPedidos->sum('total_cents');

            $faturamentoDiario[] = $entry;
        }

        // ── Serviços populares ──
        $servicosPopulares = $agendamentos
            ->groupBy(fn($ag) => $ag->servico_id . '-' . $ag->loja_id)
            ->map(fn($ags) => [
                'nome'             => $ags->first()->servico->name,
                'loja'             => $ags->first()->loja->name,
                'count'            => $ags->count(),
                'faturamento_cents'=> (int) $ags->sum(fn($ag) => $ag->servico->price_cents),
            ])
            ->sortByDesc('count')
            ->values()
            ->take(10);

        return response()->json([
            'success' => true,
            'data'    => [
                'periodo'            => ['inicio' => $inicio, 'fim' => $fim],
                'resumo_lojas'       => $resumo,
                'faturamento_diario' => $faturamentoDiario,
                'servicos_populares' => $servicosPopulares,
            ],
        ]);
    }
}

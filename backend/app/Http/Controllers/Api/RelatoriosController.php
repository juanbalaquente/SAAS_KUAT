<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\Pedido;
use Illuminate\Http\Request;

class RelatoriosController extends Controller
{
    public function index(Request $request)
    {
        $inicio = $request->input('inicio', now()->startOfMonth()->toDateString());
        $fim    = $request->input('fim',    now()->toDateString());

        $agendamentos = Agendamento::whereBetween('scheduled_at', [$inicio, $fim . ' 23:59:59'])
            ->whereNotIn('status', ['cancelado'])
            ->with(['loja', 'servico'])
            ->get()
            ->groupBy('loja.slug');

        $pedidos = Pedido::whereBetween('created_at', [$inicio, $fim . ' 23:59:59'])
            ->where('status', '!=', 'cancelado')
            ->sum('total_cents');

        return response()->json([
            'success' => true,
            'data'    => [
                'agendamentos' => $agendamentos,
                'faturamento_adega' => $pedidos,
                'periodo' => ['inicio' => $inicio, 'fim' => $fim],
            ],
        ]);
    }
}

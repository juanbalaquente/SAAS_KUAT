<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\Loja;

class BarbeariaController extends Controller
{
    public function agendaHoje()
    {
        $loja = Loja::where('slug', 'barbearia_kuat')->first();
        $ags  = Agendamento::with(['cliente', 'servico', 'profissional'])
            ->where('loja_id', $loja->id)
            ->whereDate('scheduled_at', today())
            ->orderBy('scheduled_at')
            ->get();

        return response()->json(['success' => true, 'data' => $ags]);
    }

    public function fila()
    {
        $loja = Loja::where('slug', 'barbearia_kuat')->first();
        $fila = Agendamento::with(['cliente', 'servico', 'profissional'])
            ->where('loja_id', $loja->id)
            ->whereDate('scheduled_at', today())
            ->whereIn('status', ['pendente', 'confirmado'])
            ->orderBy('scheduled_at')
            ->get();

        return response()->json(['success' => true, 'data' => $fila]);
    }
}

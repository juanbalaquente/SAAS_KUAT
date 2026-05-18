<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Box;
use App\Models\ChecklistVeiculo;
use App\Jobs\EnviarNotificacaoCarroPronto;
use Illuminate\Http\Request;

class LavaJatoController extends Controller
{
    public function boxes()
    {
        $boxes = Box::with(['agendamento.cliente', 'agendamento.servico'])->orderBy('numero')->get();
        return response()->json(['success' => true, 'data' => $boxes]);
    }

    public function updateBox(Request $request, int $id)
    {
        $request->validate(['status' => 'required|in:livre,ocupado,manutencao']);
        $box = Box::findOrFail($id);
        $oldStatus = $box->status;
        $box->update([
            'status'         => $request->status,
            'agendamento_id' => $request->status === 'livre' ? null : ($request->agendamento_id ?? $box->agendamento_id),
        ]);

        if ($oldStatus === 'ocupado' && $request->status === 'livre' && $box->agendamento) {
            $box->agendamento->update(['status' => 'concluido']);
            EnviarNotificacaoCarroPronto::dispatch($box->agendamento);
        }

        return response()->json(['success' => true, 'data' => $box->fresh(['agendamento.cliente'])]);
    }

    public function salvarChecklist(Request $request)
    {
        $request->validate(['agendamento_id' => 'required|exists:agendamentos,id', 'itens' => 'required|array']);
        $checklist = ChecklistVeiculo::updateOrCreate(
            ['agendamento_id' => $request->agendamento_id],
            ['itens' => $request->itens, 'fotos' => $request->fotos ?? [], 'assinatura_url' => $request->assinatura_url]
        );
        return response()->json(['success' => true, 'data' => $checklist]);
    }
}

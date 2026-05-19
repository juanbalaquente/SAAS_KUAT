<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\Cliente;
use Illuminate\Http\Request;

class AgendamentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Agendamento::with(['cliente', 'servico', 'profissional', 'loja']);
        if ($request->loja_id) $query->where('loja_id', $request->loja_id);
        if ($request->status)  $query->where('status', $request->status);
        if ($request->data)    $query->whereDate('scheduled_at', $request->data);
        if ($request->inicio)  $query->whereDate('scheduled_at', '>=', $request->inicio);
        if ($request->fim)     $query->whereDate('scheduled_at', '<=', $request->fim);
        return response()->json(['success' => true, 'data' => $query->orderBy('scheduled_at', 'desc')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'loja_id'      => 'required|exists:lojas,id',
            'servico_id'   => 'required|exists:servicos,id',
            'scheduled_at' => 'required|date',
            'cliente.name' => 'required|string',
            'cliente.phone'=> 'required|string',
        ]);

        $clienteData = $request->input('cliente');
        $cliente = Cliente::firstOrCreate(
            ['phone' => $clienteData['phone']],
            ['name' => $clienteData['name'], 'email' => $clienteData['email'] ?? null]
        );

        $ag = Agendamento::create([
            'loja_id'         => $request->loja_id,
            'cliente_id'      => $cliente->id,
            'servico_id'      => $request->servico_id,
            'profissional_id' => $request->profissional_id,
            'scheduled_at'    => $request->scheduled_at,
            'status'          => 'confirmado',
            'veiculo_placa'   => $request->veiculo_placa,
            'notas'           => $request->notas,
        ]);

        $ag->load(['cliente', 'servico', 'profissional', 'loja']);
        return response()->json(['success' => true, 'data' => $ag], 201);
    }

    public function show(int $id)
    {
        $ag = Agendamento::with(['cliente', 'servico', 'profissional', 'loja'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $ag]);
    }

    public function update(Request $request, int $id)
    {
        $ag = Agendamento::findOrFail($id);
        $ag->update($request->only(['status', 'notas', 'veiculo_placa', 'profissional_id']));
        return response()->json(['success' => true, 'data' => $ag]);
    }

    public function destroy(int $id)
    {
        Agendamento::findOrFail($id)->update(['status' => 'cancelado']);
        return response()->json(['success' => true]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate(['status' => 'required|in:pendente,confirmado,em_atendimento,concluido,cancelado']);
        $ag = Agendamento::findOrFail($id);
        $ag->update(['status' => $request->status]);

        if ($request->status === 'concluido') {
            $servico = $ag->servico;
            $pontos  = intdiv($servico->price_cents, 100);
            $ag->cliente->increment('pontos_fidelidade', $pontos);
        }

        return response()->json(['success' => true, 'data' => $ag->fresh(['cliente', 'servico', 'profissional'])]);
    }
}

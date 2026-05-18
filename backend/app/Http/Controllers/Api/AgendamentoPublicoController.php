<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\Cliente;
use App\Models\Loja;
use App\Models\Servico;
use App\Jobs\EnviarConfirmacaoAgendamento;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AgendamentoPublicoController extends Controller
{
    public function servicos(string $slug)
    {
        $loja = Loja::where('slug', $slug)->firstOrFail();
        return response()->json([
            'success' => true,
            'data'    => $loja->servicos()->where('ativo', true)->get(),
        ]);
    }

    public function disponibilidade(Request $request, string $slug)
    {
        $loja     = Loja::where('slug', $slug)->firstOrFail();
        $servico  = Servico::findOrFail($request->servico_id);
        $data     = $request->input('data', now()->toDateString());
        $profId   = $request->profissional_id;

        $abertura = Carbon::parse("$data {$loja->open_time}");
        $fechamento = Carbon::parse("$data {$loja->close_time}");
        $duracao  = $servico->duration_minutes;

        $slots = [];
        $cursor = $abertura->copy();
        while ($cursor->copy()->addMinutes($duracao)->lte($fechamento)) {
            $slots[] = $cursor->format('H:i');
            $cursor->addMinutes($loja->slot_duration_minutes);
        }

        // Remove slots ocupados
        $query = Agendamento::where('loja_id', $loja->id)
            ->whereDate('scheduled_at', $data)
            ->whereNotIn('status', ['cancelado']);
        if ($profId) $query->where('profissional_id', $profId);

        $ocupados = $query->with('servico')->get();
        $slotsLivres = array_filter($slots, function ($slot) use ($ocupados, $duracao, $data) {
            $inicio = Carbon::parse("$data $slot");
            $fim    = $inicio->copy()->addMinutes($duracao);
            foreach ($ocupados as $ag) {
                $agInicio = $ag->scheduled_at;
                $agFim    = $agInicio->copy()->addMinutes($ag->servico->duration_minutes);
                if ($inicio->lt($agFim) && $fim->gt($agInicio)) return false;
            }
            return true;
        });

        $profissionais = $loja->profissionais()->where('ativo', true)->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'slots'         => array_values($slotsLivres),
                'profissionais' => $profissionais,
            ],
        ]);
    }

    public function agendar(Request $request, string $slug)
    {
        $loja = Loja::where('slug', $slug)->firstOrFail();
        $request->validate([
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

        $agendamento = Agendamento::create([
            'loja_id'         => $loja->id,
            'cliente_id'      => $cliente->id,
            'servico_id'      => $request->servico_id,
            'profissional_id' => $request->profissional_id,
            'scheduled_at'    => $request->scheduled_at,
            'status'          => 'confirmado',
            'veiculo_placa'   => $request->veiculo_placa,
            'notas'           => $request->notas,
        ]);

        EnviarConfirmacaoAgendamento::dispatch($agendamento);

        $agendamento->load(['cliente', 'servico', 'profissional', 'loja']);

        return response()->json(['success' => true, 'data' => $agendamento], 201);
    }

    public function show(int $id)
    {
        $ag = Agendamento::with(['cliente', 'servico', 'profissional', 'loja'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $ag]);
    }

    public function cancelar(int $id)
    {
        $ag = Agendamento::whereIn('status', ['pendente', 'confirmado'])->findOrFail($id);
        $ag->update(['status' => 'cancelado']);
        return response()->json(['success' => true, 'data' => $ag]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    public function index()
    {
        $pedidos = Pedido::with(['cliente', 'itens.produto'])->orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $pedidos]);
    }

    public function store(Request $request)
    {
        $pedido = Pedido::create($request->all());
        return response()->json(['success' => true, 'data' => $pedido], 201);
    }

    public function show(int $id)
    {
        $pedido = Pedido::with(['cliente', 'itens.produto'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $pedido]);
    }

    public function update(Request $request, int $id)
    {
        $pedido = Pedido::findOrFail($id);
        $pedido->update($request->all());
        return response()->json(['success' => true, 'data' => $pedido]);
    }

    public function destroy(int $id)
    {
        Pedido::findOrFail($id)->update(['status' => 'cancelado']);
        return response()->json(['success' => true]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate(['status' => 'required|in:aguardando,preparando,em_rota,entregue,cancelado']);
        $pedido = Pedido::findOrFail($id);
        $pedido->update(['status' => $request->status]);
        return response()->json(['success' => true, 'data' => $pedido]);
    }
}

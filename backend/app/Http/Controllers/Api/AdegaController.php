<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Produto;
use App\Models\MovimentacaoEstoque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdegaController extends Controller
{
    public function estoque()
    {
        $produtos = Produto::where('ativo', true)->orderBy('categoria')->orderBy('nome')->get();
        return response()->json(['success' => true, 'data' => $produtos]);
    }

    public function alertas()
    {
        $alertas = Produto::where('ativo', true)
            ->whereColumn('estoque_atual', '<=', 'estoque_minimo')
            ->get();
        return response()->json(['success' => true, 'data' => $alertas]);
    }

    public function processarVenda(Request $request)
    {
        $request->validate([
            'itens'             => 'required|array|min:1',
            'itens.*.produto_id'=> 'required|exists:produtos,id',
            'itens.*.quantidade'=> 'required|integer|min:1',
            'tipo'              => 'required|in:balcao,delivery',
        ]);

        // Validar estoque antes de abrir transação
        foreach ($request->itens as $item) {
            $produto = Produto::findOrFail($item['produto_id']);
            if ($produto->estoque_atual < $item['quantidade']) {
                return response()->json([
                    'success' => false,
                    'message' => "Estoque insuficiente para \"{$produto->nome}\" (disponível: {$produto->estoque_atual}).",
                ], 422);
            }
        }

        DB::transaction(function () use ($request, &$pedido) {
            $total = 0;
            foreach ($request->itens as $item) {
                $produto = Produto::findOrFail($item['produto_id']);
                $total  += $produto->preco_cents * $item['quantidade'];
            }

            $pedido = Pedido::create([
                'tipo'            => $request->tipo,
                'status'          => 'aguardando',
                'total_cents'     => $total,
                'forma_pagamento' => $request->pagamento,
            ]);

            foreach ($request->itens as $item) {
                $produto = Produto::findOrFail($item['produto_id']);
                PedidoItem::create([
                    'pedido_id'           => $pedido->id,
                    'produto_id'          => $item['produto_id'],
                    'quantidade'          => $item['quantidade'],
                    'preco_unitario_cents'=> $item['preco_unitario_cents'] ?? $produto->preco_cents,
                ]);
                $produto->decrement('estoque_atual', $item['quantidade']);
                MovimentacaoEstoque::create([
                    'produto_id'  => $item['produto_id'],
                    'tipo'        => 'saida',
                    'quantidade'  => $item['quantidade'],
                    'observacao'  => "Venda PDV #{$pedido->id}",
                    'user_id'     => $request->user()?->id,
                ]);
            }
        });

        return response()->json(['success' => true, 'data' => $pedido->load('itens.produto')], 201);
    }

    public function movimentarEstoque(Request $request)
    {
        $request->validate([
            'produto_id' => 'required|exists:produtos,id',
            'tipo'       => 'required|in:entrada,saida,ajuste',
            'quantidade' => 'required|integer|min:1',
            'observacao' => 'nullable|string|max:255',
        ]);

        $produto = Produto::findOrFail($request->produto_id);

        DB::transaction(function () use ($request, $produto) {
            if ($request->tipo === 'entrada') {
                $produto->increment('estoque_atual', $request->quantidade);
            } elseif ($request->tipo === 'saida') {
                if ($produto->estoque_atual < $request->quantidade) {
                    throw new \Exception("Estoque insuficiente para \"{$produto->nome}\".");
                }
                $produto->decrement('estoque_atual', $request->quantidade);
            } else {
                $produto->update(['estoque_atual' => $request->quantidade]);
            }

            MovimentacaoEstoque::create([
                'produto_id'  => $request->produto_id,
                'tipo'        => $request->tipo,
                'quantidade'  => $request->quantidade,
                'observacao'  => $request->observacao,
                'user_id'     => $request->user()?->id,
            ]);
        });

        return response()->json(['success' => true, 'data' => $produto->fresh()]);
    }

    public function movimentacoes()
    {
        $movimentacoes = MovimentacaoEstoque::with(['produto', 'user'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json(['success' => true, 'data' => $movimentacoes]);
    }

    public function vendasHoje()
    {
        $hoje   = now()->toDateString();
        $pedidos = Pedido::whereDate('created_at', $hoje)
            ->whereNotIn('status', ['cancelado'])
            ->with('itens.produto')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'pedidos'     => $pedidos,
                'total_cents' => $pedidos->sum('total_cents'),
                'count'       => $pedidos->count(),
            ],
        ]);
    }
}

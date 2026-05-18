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
            'itens'            => 'required|array|min:1',
            'itens.*.produto_id'=> 'required|exists:produtos,id',
            'itens.*.quantidade'=> 'required|integer|min:1',
            'tipo'             => 'required|in:balcao,delivery',
        ]);

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
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    protected $fillable = ['nome', 'codigo_barras', 'categoria', 'preco_cents', 'estoque_atual', 'estoque_minimo', 'ativo'];

    public function pedidoItens()
    {
        return $this->hasMany(PedidoItem::class);
    }

    public function movimentacoes()
    {
        return $this->hasMany(MovimentacaoEstoque::class);
    }
}

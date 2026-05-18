<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $fillable = ['name', 'phone', 'email', 'pontos_fidelidade'];

    public function agendamentos()
    {
        return $this->hasMany(Agendamento::class);
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }
}

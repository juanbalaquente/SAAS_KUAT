<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Servico extends Model
{
    protected $fillable = ['loja_id', 'name', 'duration_minutes', 'price_cents', 'ativo'];

    public function loja()
    {
        return $this->belongsTo(Loja::class);
    }

    public function agendamentos()
    {
        return $this->hasMany(Agendamento::class);
    }
}

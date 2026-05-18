<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profissional extends Model
{
    protected $table = 'profissionais';
    protected $fillable = ['loja_id', 'user_id', 'name', 'ativo'];

    public function loja()
    {
        return $this->belongsTo(Loja::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function agendamentos()
    {
        return $this->hasMany(Agendamento::class);
    }
}

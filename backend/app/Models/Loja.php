<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loja extends Model
{
    protected $fillable = ['slug', 'name', 'emoji', 'color_hex', 'open_time', 'close_time', 'slot_duration_minutes', 'active'];

    public function servicos()
    {
        return $this->hasMany(Servico::class);
    }

    public function profissionais()
    {
        return $this->hasMany(Profissional::class);
    }

    public function agendamentos()
    {
        return $this->hasMany(Agendamento::class);
    }
}

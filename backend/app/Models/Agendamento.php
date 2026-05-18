<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agendamento extends Model
{
    protected $fillable = [
        'loja_id', 'cliente_id', 'servico_id', 'profissional_id',
        'scheduled_at', 'status', 'veiculo_placa', 'notas'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function loja()
    {
        return $this->belongsTo(Loja::class);
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function servico()
    {
        return $this->belongsTo(Servico::class);
    }

    public function profissional()
    {
        return $this->belongsTo(Profissional::class);
    }

    public function checklist()
    {
        return $this->hasOne(ChecklistVeiculo::class);
    }
}

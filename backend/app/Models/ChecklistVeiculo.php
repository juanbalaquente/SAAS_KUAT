<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecklistVeiculo extends Model
{
    protected $table = 'checklist_veiculo';
    protected $fillable = ['agendamento_id', 'itens', 'fotos', 'assinatura_url'];
    protected $casts = ['itens' => 'array', 'fotos' => 'array'];

    public function agendamento()
    {
        return $this->belongsTo(Agendamento::class);
    }
}

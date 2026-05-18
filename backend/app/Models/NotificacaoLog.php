<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificacaoLog extends Model
{
    protected $table = 'notificacoes_log';
    protected $fillable = ['cliente_id', 'tipo', 'mensagem', 'status'];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }
}

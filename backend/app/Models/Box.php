<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Box extends Model
{
    protected $table = 'boxes';
    protected $fillable = ['numero', 'status', 'agendamento_id'];

    public function agendamento()
    {
        return $this->belongsTo(Agendamento::class);
    }
}

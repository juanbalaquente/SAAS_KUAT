<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Lembrete de agendamento — 1h antes
Schedule::call(function () {
    $agendamentos = \App\Models\Agendamento::with(['cliente', 'servico', 'loja'])
        ->whereIn('status', ['confirmado'])
        ->whereBetween('scheduled_at', [now()->addHour(), now()->addHour()->addMinutes(5)])
        ->get();
    foreach ($agendamentos as $ag) {
        \App\Jobs\EnviarLembreteAgendamento::dispatch($ag);
    }
})->everyFiveMinutes();

// NPS — 30min após concluído
Schedule::call(function () {
    $agendamentos = \App\Models\Agendamento::with(['cliente', 'servico', 'loja'])
        ->where('status', 'concluido')
        ->whereBetween('updated_at', [now()->subMinutes(35), now()->subMinutes(30)])
        ->get();
    foreach ($agendamentos as $ag) {
        \App\Jobs\EnviarNPS::dispatch($ag);
    }
})->everyFiveMinutes();

<?php

use App\Http\Controllers\Api\AdegaController;
use App\Http\Controllers\Api\AgendamentoController;
use App\Http\Controllers\Api\AgendamentoPublicoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarbeariaController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LavaJatoController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProdutoController;
use App\Http\Controllers\Api\ProfissionalController;
use App\Http\Controllers\Api\RelatoriosController;
use App\Http\Controllers\Api\ServicoController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Público
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/lojas/{slug}/servicos',       [AgendamentoPublicoController::class, 'servicos']);
Route::get('/lojas/{slug}/disponibilidade',[AgendamentoPublicoController::class, 'disponibilidade']);
Route::get('/lojas/{slug}/produtos',       [AgendamentoPublicoController::class, 'produtos']);
Route::post('/lojas/{slug}/agendar',       [AgendamentoPublicoController::class, 'agendar']);
Route::get('/agendamentos/{id}/publico',   [AgendamentoPublicoController::class, 'show']);
Route::patch('/agendamentos/{id}/cancelar',[AgendamentoPublicoController::class, 'cancelar']);

// Autenticado
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me',           [AuthController::class, 'me']);

    Route::apiResource('agendamentos',  AgendamentoController::class);
    Route::patch('/agendamentos/{id}/status', [AgendamentoController::class, 'updateStatus']);

    Route::get('/barbearia/agenda-hoje', [BarbeariaController::class, 'agendaHoje']);
    Route::get('/barbearia/fila',        [BarbeariaController::class, 'fila']);

    Route::get('/lavajato/boxes',          [LavaJatoController::class, 'boxes']);
    Route::patch('/lavajato/boxes/{id}',   [LavaJatoController::class, 'updateBox']);
    Route::post('/lavajato/checklist',     [LavaJatoController::class, 'salvarChecklist']);

    Route::get('/adega/estoque',          [AdegaController::class, 'estoque']);
    Route::get('/adega/alertas',          [AdegaController::class, 'alertas']);
    Route::get('/adega/vendas-hoje',      [AdegaController::class, 'vendasHoje']);
    Route::get('/adega/movimentacoes',    [AdegaController::class, 'movimentacoes']);
    Route::post('/adega/pdv',             [AdegaController::class, 'processarVenda']);
    Route::post('/adega/movimentacao',    [AdegaController::class, 'movimentarEstoque']);

    Route::apiResource('pedidos', PedidoController::class);
    Route::patch('/pedidos/{id}/status', [PedidoController::class, 'updateStatus']);

    Route::get('/dashboard/resumo', [DashboardController::class, 'resumo']);
    Route::get('/relatorios',        [RelatoriosController::class, 'index']);

    Route::apiResource('users',          UserController::class);
    Route::apiResource('servicos',       ServicoController::class);
    Route::apiResource('profissionais',  ProfissionalController::class);
    Route::apiResource('produtos',       ProdutoController::class);
});

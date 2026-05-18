<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->onDelete('set null');
            $table->enum('tipo', ['balcao', 'delivery'])->default('balcao');
            $table->enum('status', ['aguardando', 'preparando', 'em_rota', 'entregue', 'cancelado'])->default('aguardando');
            $table->text('endereco_entrega')->nullable();
            $table->integer('total_cents')->default(0);
            $table->string('forma_pagamento')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};

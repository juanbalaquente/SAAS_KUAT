<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['dono', 'barbeiro', 'atendente_lava', 'atendente_adega'])->default('barbeiro');
            $table->enum('loja', ['barbearia_kuat', 'lava_kuat', 'adega_r1'])->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'loja']);
        });
    }
};

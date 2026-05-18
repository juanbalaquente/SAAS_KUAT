<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Loja;
use App\Models\Cliente;
use App\Models\Profissional;
use App\Models\Servico;
use App\Models\Box;
use App\Models\Produto;
use App\Models\Agendamento;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuários
        $carlos = User::create(['name' => 'Carlos', 'email' => 'carlos@saaskuat.com', 'password' => Hash::make('kuat@2024'), 'role' => 'dono', 'loja' => null]);
        $rafael = User::create(['name' => 'Rafael', 'email' => 'rafael@saaskuat.com', 'password' => Hash::make('kuat@2024'), 'role' => 'barbeiro', 'loja' => 'barbearia_kuat']);
        $diego  = User::create(['name' => 'Diego',  'email' => 'diego@saaskuat.com',  'password' => Hash::make('kuat@2024'), 'role' => 'atendente_lava',  'loja' => 'lava_kuat']);
        $marcos = User::create(['name' => 'Marcos', 'email' => 'marcos@saaskuat.com', 'password' => Hash::make('kuat@2024'), 'role' => 'atendente_adega', 'loja' => 'adega_r1']);

        // Lojas
        $barbearia = Loja::create(['slug' => 'barbearia_kuat', 'name' => 'Barbearia Kuat', 'emoji' => '✂️', 'color_hex' => '#E8593C', 'open_time' => '08:00', 'close_time' => '19:00', 'slot_duration_minutes' => 30]);
        $lavaKuat  = Loja::create(['slug' => 'lava_kuat',       'name' => 'Lava Kuat',       'emoji' => '🚗', 'color_hex' => '#E8A020', 'open_time' => '07:00', 'close_time' => '18:00', 'slot_duration_minutes' => 30]);
        $adegaR1   = Loja::create(['slug' => 'adega_r1',         'name' => 'Adega R1',         'emoji' => '🍷', 'color_hex' => '#4CAF70', 'open_time' => '09:00', 'close_time' => '22:00', 'slot_duration_minutes' => 30]);

        // Serviços — Barbearia
        Servico::create(['loja_id' => $barbearia->id, 'name' => 'Corte masculino',  'duration_minutes' => 30, 'price_cents' => 3500]);
        Servico::create(['loja_id' => $barbearia->id, 'name' => 'Barba',            'duration_minutes' => 20, 'price_cents' => 2500]);
        $corteBarbearia = Servico::create(['loja_id' => $barbearia->id, 'name' => 'Corte + Barba', 'duration_minutes' => 50, 'price_cents' => 5500]);
        Servico::create(['loja_id' => $barbearia->id, 'name' => 'Sobrancelha',      'duration_minutes' => 15, 'price_cents' => 1500]);

        // Serviços — Lava Kuat
        Servico::create(['loja_id' => $lavaKuat->id, 'name' => 'Lavagem simples',       'duration_minutes' => 30,  'price_cents' => 3000]);
        Servico::create(['loja_id' => $lavaKuat->id, 'name' => 'Lavagem completa',      'duration_minutes' => 60,  'price_cents' => 6000]);
        Servico::create(['loja_id' => $lavaKuat->id, 'name' => 'Premium + polimento',   'duration_minutes' => 120, 'price_cents' => 12000]);
        Servico::create(['loja_id' => $lavaKuat->id, 'name' => 'Higienização interna',  'duration_minutes' => 90,  'price_cents' => 9000]);

        // Serviços — Adega R1
        Servico::create(['loja_id' => $adegaR1->id, 'name' => 'Retirada na loja',    'duration_minutes' => 5,  'price_cents' => 0]);
        Servico::create(['loja_id' => $adegaR1->id, 'name' => 'Delivery até 5km',    'duration_minutes' => 30, 'price_cents' => 800]);
        Servico::create(['loja_id' => $adegaR1->id, 'name' => 'Delivery 5–10km',     'duration_minutes' => 60, 'price_cents' => 1500]);

        // Profissionais — Barbearia
        $profRafael = Profissional::create(['loja_id' => $barbearia->id, 'user_id' => $rafael->id, 'name' => 'Rafael']);
        $profDiego  = Profissional::create(['loja_id' => $barbearia->id, 'user_id' => null,         'name' => 'Diego']);
        $profLucas  = Profissional::create(['loja_id' => $barbearia->id, 'user_id' => null,         'name' => 'Lucas']);

        // Boxes — Lava Kuat
        Box::create(['numero' => 1, 'status' => 'livre']);
        Box::create(['numero' => 2, 'status' => 'ocupado']);
        Box::create(['numero' => 3, 'status' => 'livre']);

        // Produtos — Adega R1
        $produtos = [
            ['nome' => 'Heineken 600ml',         'categoria' => 'Cerveja',    'preco_cents' => 1200, 'estoque_atual' => 48, 'estoque_minimo' => 12],
            ['nome' => 'Budweiser 600ml',         'categoria' => 'Cerveja',    'preco_cents' => 1000, 'estoque_atual' => 3,  'estoque_minimo' => 10],
            ['nome' => 'Corona Extra 355ml',      'categoria' => 'Cerveja',    'preco_cents' => 1400, 'estoque_atual' => 24, 'estoque_minimo' => 8],
            ['nome' => 'Skol Lata 350ml',         'categoria' => 'Cerveja',    'preco_cents' => 500,  'estoque_atual' => 60, 'estoque_minimo' => 24],
            ['nome' => 'Brahma Duplo Malte 350ml','categoria' => 'Cerveja',    'preco_cents' => 600,  'estoque_atual' => 2,  'estoque_minimo' => 12],
            ['nome' => 'Vinho Tinto Miolo 750ml', 'categoria' => 'Vinho',      'preco_cents' => 4500, 'estoque_atual' => 12, 'estoque_minimo' => 4],
            ['nome' => 'Vinho Branco Suave 750ml','categoria' => 'Vinho',      'preco_cents' => 3500, 'estoque_atual' => 8,  'estoque_minimo' => 4],
            ['nome' => 'Espumante Chandon 750ml', 'categoria' => 'Espumante',  'preco_cents' => 8500, 'estoque_atual' => 2,  'estoque_minimo' => 3],
            ['nome' => 'Whisky Jack Daniel\'s 1L','categoria' => 'Destilado',  'preco_cents' => 18000,'estoque_atual' => 6,  'estoque_minimo' => 2],
            ['nome' => 'Vodka Absolut 1L',        'categoria' => 'Destilado',  'preco_cents' => 9500, 'estoque_atual' => 4,  'estoque_minimo' => 3],
            ['nome' => 'Cachaça 51 1L',           'categoria' => 'Destilado',  'preco_cents' => 2500, 'estoque_atual' => 10, 'estoque_minimo' => 5],
            ['nome' => 'Red Bull 250ml',           'categoria' => 'Energético', 'preco_cents' => 1200, 'estoque_atual' => 1,  'estoque_minimo' => 12],
            ['nome' => 'Monster Energy 473ml',    'categoria' => 'Energético', 'preco_cents' => 1000, 'estoque_atual' => 15, 'estoque_minimo' => 6],
            ['nome' => 'Água Mineral 500ml',      'categoria' => 'Água',       'preco_cents' => 300,  'estoque_atual' => 50, 'estoque_minimo' => 24],
            ['nome' => 'Refrigerante Coca-Cola 2L','categoria' => 'Refrigerante','preco_cents' => 900, 'estoque_atual' => 3,  'estoque_minimo' => 8],
        ];
        foreach ($produtos as $p) {
            Produto::create($p);
        }

        // Clientes demo
        $clientes = [];
        $nomes = ['João Silva', 'Pedro Alves', 'Marcos Santos', 'Carlos Mendes', 'Lucas Ferreira', 'Bruno Costa', 'Thiago Lima', 'André Ramos'];
        foreach ($nomes as $i => $nome) {
            $clientes[] = Cliente::create(['name' => $nome, 'phone' => '4799900' . str_pad($i + 1, 4, '0', STR_PAD_LEFT), 'pontos_fidelidade' => rand(0, 150)]);
        }

        // Agendamentos de hoje — Barbearia Kuat
        $hoje = Carbon::today();
        $servicoCorte = Servico::where('loja_id', $barbearia->id)->where('name', 'Corte masculino')->first();
        $statusList = ['concluido', 'concluido', 'em_atendimento', 'confirmado', 'confirmado', 'pendente', 'pendente', 'cancelado'];
        $profissionais = [$profRafael, $profDiego, $profLucas, $profRafael, $profDiego, $profLucas, $profRafael, $profDiego];

        for ($i = 0; $i < 8; $i++) {
            Agendamento::create([
                'loja_id'        => $barbearia->id,
                'cliente_id'     => $clientes[$i]->id,
                'servico_id'     => $servicoCorte->id,
                'profissional_id'=> $profissionais[$i]->id,
                'scheduled_at'   => $hoje->copy()->setTime(8 + $i, 0),
                'status'         => $statusList[$i],
            ]);
        }
    }
}

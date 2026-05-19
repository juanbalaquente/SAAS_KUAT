# SAAS Kuat — Sistema de Gestão Multi-Loja

Você é responsável por construir do zero o sistema **SAAS Kuat**, uma aplicação web completa de gestão para um cliente com 3 lojas.

## Nomes oficiais das lojas
- **Barbearia Kuat** — serviços de barbearia
- **Lava Kuat** — lava-jato
- **Adega R1** — adega de bebidas

---

## Regra de Git — OBRIGATÓRIA

A cada funcionalidade concluída e aprovada, execute imediatamente:

```bash
git add .
git commit -m "feat: [descreva o que foi feito]"
git push origin main
```

Exemplos de mensagens de commit:
- `feat: migrations e seeders do banco de dados`
- `feat: autenticação com Laravel Sanctum`
- `feat: dashboard do dono com resumo das 3 lojas`
- `feat: página de agendamento público - Barbearia Kuat`
- `feat: PDV da Adega R1`
- `fix: correção no cálculo de slots disponíveis`

**Nunca acumule mudanças. Commit e push após cada etapa concluída.**

---

## Configuração inicial do Git

Execute estes comandos antes de qualquer coisa:

```bash
git init
git config user.name "juanbalaquente"
git config user.email "juangrochowski@gmail.com"
git remote add origin https://github.com/juanbalaquente/SAAS_KUAT.git
git checkout -b main
```

Crie um `.gitignore` com:
```
/vendor
/node_modules
.env
.env.local
*.log
/storage/logs
/public/hot
/public/storage
```

Faça o primeiro commit:
```bash
git add .gitignore README.md
git commit -m "chore: init projeto SAAS Kuat"
git push -u origin main
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + React Router 6 + TailwindCSS |
| Backend | Laravel 11 + Laravel Sanctum |
| Banco de dados | MySQL 8 |
| HTTP client | Axios + TanStack Query |
| Notificações | Evolution API (WhatsApp) via Jobs |
| Utilitários | date-fns, react-hook-form, zod |

---

## Estrutura de pastas

```
SAAS_KUAT/
├── CLAUDE.md
├── README.md
├── .gitignore
├── backend/          # Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Jobs/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
└── frontend/         # React + Vite
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   └── store/
    └── vite.config.js
```

---

## Passo a passo de construção

### Etapa 1 — Setup inicial
> Commitar após esta etapa

```bash
# Backend
composer create-project laravel/laravel backend
cd backend
composer require laravel/sanctum
php artisan install:api
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
cd ..

# Frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios @tanstack/react-query react-router-dom react-hook-form zod @hookform/resolvers date-fns
cd ..
```

---

### Etapa 2 — Banco de dados (migrations)
> Commitar após esta etapa

#### `users`
```
id, name, email, password,
role ENUM('dono','barbeiro','atendente_lava','atendente_adega'),
loja ENUM('barbearia_kuat','lava_kuat','adega_r1') nullable,
remember_token, timestamps
```

#### `lojas`
```
id, slug (barbearia_kuat|lava_kuat|adega_r1), name, emoji, color_hex,
open_time, close_time, slot_duration_minutes, active, timestamps
```

#### `clientes`
```
id, name, phone, email nullable, pontos_fidelidade DEFAULT 0, timestamps
```

#### `profissionais`
```
id, loja_id FK, user_id FK nullable, name, ativo, timestamps
```

#### `servicos`
```
id, loja_id FK, name, duration_minutes, price_cents, ativo, timestamps
```

#### `agendamentos`
```
id, loja_id FK, cliente_id FK, servico_id FK,
profissional_id FK nullable, scheduled_at DATETIME,
status ENUM('pendente','confirmado','em_atendimento','concluido','cancelado'),
veiculo_placa nullable, notas nullable, timestamps
```

#### `boxes` (Lava Kuat)
```
id, numero, status ENUM('livre','ocupado','manutencao'),
agendamento_id FK nullable, timestamps
```

#### `checklist_veiculo` (Lava Kuat)
```
id, agendamento_id FK, itens JSON, fotos JSON, assinatura_url nullable, timestamps
```

#### `produtos` (Adega R1)
```
id, nome, codigo_barras nullable, categoria, preco_cents,
estoque_atual INT, estoque_minimo INT, ativo, timestamps
```

#### `pedidos` (Adega R1)
```
id, cliente_id FK nullable,
tipo ENUM('balcao','delivery'),
status ENUM('aguardando','preparando','em_rota','entregue','cancelado'),
endereco_entrega nullable, total_cents, timestamps
```

#### `pedido_itens`
```
id, pedido_id FK, produto_id FK, quantidade, preco_unitario_cents, timestamps
```

#### `movimentacoes_estoque`
```
id, produto_id FK, tipo ENUM('entrada','saida','ajuste'),
quantidade, observacao nullable, user_id FK, timestamps
```

#### `notificacoes_log`
```
id, cliente_id FK, tipo, mensagem, status ENUM('enviado','erro'), timestamps
```

```bash
cd backend && php artisan migrate
```

---

### Etapa 3 — Models, Seeders e Auth
> Commitar após esta etapa

#### Seeder — dados de demonstração

**Usuários:**
| nome | email | senha | role | loja |
|---|---|---|---|---|
| Carlos (Dono) | carlos@saaskuat.com | kuat@2024 | dono | null |
| Rafael | rafael@saaskuat.com | kuat@2024 | barbeiro | barbearia_kuat |
| Diego | diego@saaskuat.com | kuat@2024 | atendente_lava | lava_kuat |
| Marcos | marcos@saaskuat.com | kuat@2024 | atendente_adega | adega_r1 |

**Lojas:**
- Barbearia Kuat — slug: barbearia_kuat — ✂️ — #E8593C — 08:00–19:00 — slots 30min
- Lava Kuat — slug: lava_kuat — 🚗 — #E8A020 — 07:00–18:00 — slots 30min
- Adega R1 — slug: adega_r1 — 🍷 — #4CAF70 — 09:00–22:00

**Serviços — Barbearia Kuat:** Corte masculino (30min, R$35), Barba (20min, R$25), Corte + Barba (50min, R$55), Sobrancelha (15min, R$15)

**Serviços — Lava Kuat:** Lavagem simples (30min, R$30), Lavagem completa (60min, R$60), Premium + polimento (120min, R$120), Higienização interna (90min, R$90)

**Serviços — Adega R1:** Retirada na loja (grátis), Delivery até 5km (R$8), Delivery 5–10km (R$15)

**Profissionais — Barbearia Kuat:** Rafael, Diego, Lucas

**Boxes — Lava Kuat:** Box 1, Box 2, Box 3

**Produtos — Adega R1:** 15 produtos variados (cervejas, vinhos, destilados). Alguns com estoque abaixo do mínimo para gerar alertas.

**Agendamentos:** 8 para hoje na Barbearia Kuat com status variados.

```bash
php artisan db:seed
```

---

### Etapa 4 — API Routes e Controllers
> Commitar após esta etapa

#### `routes/api.php`

```php
// Público
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/lojas/{slug}/servicos', [AgendamentoPublicoController::class, 'servicos']);
Route::get('/lojas/{slug}/disponibilidade', [AgendamentoPublicoController::class, 'disponibilidade']);
Route::post('/lojas/{slug}/agendar', [AgendamentoPublicoController::class, 'agendar']);
Route::get('/agendamentos/{id}/publico', [AgendamentoPublicoController::class, 'show']);
Route::patch('/agendamentos/{id}/cancelar', [AgendamentoPublicoController::class, 'cancelar']);

// Autenticado
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::apiResource('agendamentos', AgendamentoController::class);
    Route::patch('/agendamentos/{id}/status', [AgendamentoController::class, 'updateStatus']);
    Route::get('/barbearia/agenda-hoje', [BarbeariaController::class, 'agendaHoje']);
    Route::get('/barbearia/fila', [BarbeariaController::class, 'fila']);
    Route::get('/lavajato/boxes', [LavaJatoController::class, 'boxes']);
    Route::patch('/lavajato/boxes/{id}', [LavaJatoController::class, 'updateBox']);
    Route::post('/lavajato/checklist', [LavaJatoController::class, 'salvarChecklist']);
    Route::get('/adega/estoque', [AdegaController::class, 'estoque']);
    Route::get('/adega/alertas', [AdegaController::class, 'alertas']);
    Route::apiResource('pedidos', PedidoController::class);
    Route::patch('/pedidos/{id}/status', [PedidoController::class, 'updateStatus']);
    Route::post('/adega/pdv', [AdegaController::class, 'processarVenda']);
    Route::get('/dashboard/resumo', [DashboardController::class, 'resumo']);
    Route::get('/relatorios', [RelatoriosController::class, 'index']);
    Route::apiResource('users', UserController::class);
    Route::apiResource('servicos', ServicoController::class);
    Route::apiResource('profissionais', ProfissionalController::class);
    Route::apiResource('produtos', ProdutoController::class);
});
```

**Padrão de resposta JSON:**
```json
{ "success": true, "data": {...} }
{ "success": false, "message": "Erro..." }
```

---

### Etapa 5 — Jobs WhatsApp
> Commitar após esta etapa

`app/Services/WhatsAppService.php`:
```php
class WhatsAppService {
    public function send(string $phone, string $message): void {
        Http::withHeaders(['apikey' => config('services.evolution.key')])
            ->post(config('services.evolution.url') . '/message/sendText', [
                'number' => $phone,
                'text'   => $message,
            ]);
    }
}
```

Jobs a criar:
- `EnviarConfirmacaoAgendamento` — ao criar agendamento
- `EnviarLembreteAgendamento` — 1h antes via scheduler
- `EnviarNotificacaoCarroPronto` — ao marcar box como concluído na Lava Kuat
- `EnviarNPS` — 30min após serviço concluído

---

### Etapa 6 — Frontend: Auth + Router
> Commitar após esta etapa

`src/store/AuthContext.jsx` — guarda user + token, persiste no localStorage, injeta Bearer em todas as chamadas Axios.

`src/services/api.js`:
```js
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
```

Redirect por role pós-login:
```js
const redirectMap = {
  dono:            '/dashboard',
  barbeiro:        '/barbearia',
  atendente_lava:  '/lavajato',
  atendente_adega: '/adega',
};
```

---

### Etapa 7 — Páginas
> Commitar cada página individualmente

**`/login`** — Form + botões demo (Carlos, Rafael, Diego, Marcos). Logo "SAAS Kuat".

**`/dashboard`** — Cards das 3 lojas com métricas do dia. Visão consolidada para o dono.

**`/barbearia`** — Próximo atendimento em destaque, agenda do dia com status, fila.

**`/lavajato`** — Grid de boxes com polling 30s, botões iniciar/concluir, fila de espera.

**`/adega`** — Botão PDV, alertas de estoque, deliveries em andamento com status.

**PDV (modal)** — Busca produto, carrinho, total, tipos de pagamento, finalizar venda.

**`/`** — Landing page com as 3 lojas e botão agendar.

**`/agendar/:loja`** — Fluxo em steps: serviço → profissional → data/hora → dados cliente → confirmação.

**`/confirmacao/:id`** — Resumo + botão cancelar.

---

### Etapa 8 — Variáveis de ambiente

`backend/.env`:
```
APP_NAME="SAAS Kuat"
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_DATABASE=saas_kuat
DB_USERNAME=root
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
```

---

## Regras de negócio

1. Não permitir dois agendamentos no mesmo profissional/box no mesmo horário
2. Calcular slots disponíveis com base nos agendamentos existentes e `duration_minutes`
3. 1 ponto de fidelidade por R$1 gasto, válido nas 3 lojas
4. Ao finalizar venda no PDV: decrementar estoque e verificar `estoque_minimo`
5. Confirmação WhatsApp imediata + lembrete 1h antes via scheduler
6. Middleware de role bloqueia acesso a rotas de outras lojas
7. Todas as queries filtradas por `loja_id`

---

## Como rodar

```bash
cd backend && php artisan migrate --seed && php artisan serve
cd frontend && npm run dev
```

---

## Ordem recomendada

1. Git init + config + primeiro push
2. Setup Laravel + React (commit)
3. Migrations + Seeders (commit)
4. Auth API (commit)
5. Todos os Controllers (commit)
6. Jobs WhatsApp (commit)
7. Frontend AuthContext + Router (commit)
8. LoginPage (commit)
9. DashboardPage (commit)
10. BarbeariaPage (commit)
11. LavaJatoPage (commit)
12. AdegaPage + PDV (commit)
13. Landing + AgendamentoPage (commit)
14. README final (commit)

**Commit e push após cada etapa. Sem exceção.**

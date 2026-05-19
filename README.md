# SAAS Kuat — Sistema de Gestão Multi-Loja

Sistema web completo de gestão para as 3 lojas do grupo Kuat.

- **Barbearia Kuat** — Agendamentos online, fila de atendimento, gestão de profissionais
- **Lava Kuat** — Controle de boxes em tempo real, checklist de veículos, notificação de carro pronto
- **Adega R1** — PDV (caixa), controle de estoque com movimentações, delivery

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS v4 |
| Backend | Laravel 11 + Sanctum (Bearer token) |
| Banco | MySQL 8 |
| HTTP client | Axios + TanStack Query |
| Notificações | Evolution API (WhatsApp) via Jobs + Scheduler |

## Pré-requisitos

- PHP 8.2+ com extensões: pdo_mysql, mbstring, openssl, tokenizer
- MySQL 8
- Node.js 18+
- Composer

## Como rodar

```bash
# 1. Backend
cd backend
cp .env.example .env          # editar DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate --seed
php artisan serve             # http://localhost:8000

# 2. Frontend (outro terminal)
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev                   # http://localhost:5173

# 3. Scheduler WhatsApp (opcional, outro terminal)
cd backend
php artisan schedule:work
```

## Variáveis de ambiente relevantes

**backend/.env**
```
DB_CONNECTION=mysql
DB_DATABASE=saas_kuat
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Evolution API — deixar vazio para modo simulado (log)
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000/api
```

## Contas demo

| Usuário | Email | Senha | Acesso |
|---|---|---|---|
| Carlos | carlos@saaskuat.com | kuat@2024 | Dashboard completo (dono) |
| Rafael | rafael@saaskuat.com | kuat@2024 | Barbearia Kuat |
| Diego | diego@saaskuat.com | kuat@2024 | Lava Kuat |
| Marcos | marcos@saaskuat.com | kuat@2024 | Adega R1 |

## Funcionalidades

### Barbearia Kuat (`/barbearia`)
- Agenda do dia com status em tempo real
- Próximo atendimento em destaque
- Fila de espera
- Atualização de status (pendente → confirmado → em atendimento → concluído)
- Pontos de fidelidade automáticos ao concluir (1pt/R$1)

### Lava Kuat (`/lavajato`)
- Grid de boxes com polling a cada 30s
- Iniciar / concluir lavagem por box
- Notificação WhatsApp automática ao carro ficar pronto
- Checklist de veículo

### Adega R1 (`/adega`)
- **Caixa**: PDV com busca de produtos, carrinho, total, tipo (balcão/delivery) e forma de pagamento; histórico de vendas do dia
- **Estoque**: tabela com status (Normal/Crítico/Esgotado), modal de movimentação (entrada/saída/ajuste), histórico de movimentações
- **Pedidos**: fila de deliveries com progressão de status

### Agendamento público (`/agendar/:loja`)
- Fluxo em 5 passos: serviço → profissional → data/hora → dados do cliente → confirmação
- Anti-colisão de horários
- Link de cancelamento na página de confirmação (`/confirmacao/:id`)

### Notificações WhatsApp
- Confirmação imediata ao agendar
- Lembrete 1h antes (scheduler a cada 5min)
- Carro pronto ao liberar box (Lava Kuat)
- NPS 30min após serviço concluído (scheduler a cada 5min)
- Sem Evolution API configurada: simula via `Log::info` e grava em `notificacoes_log`

## Rotas da API

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/me

GET    /api/lojas/{slug}/servicos
GET    /api/lojas/{slug}/disponibilidade
POST   /api/lojas/{slug}/agendar
GET    /api/agendamentos/{id}/publico
PATCH  /api/agendamentos/{id}/cancelar

GET    /api/dashboard/resumo
GET    /api/barbearia/agenda-hoje
GET    /api/barbearia/fila
PATCH  /api/agendamentos/{id}/status

GET    /api/lavajato/boxes
PATCH  /api/lavajato/boxes/{id}
POST   /api/lavajato/checklist

GET    /api/adega/estoque
GET    /api/adega/alertas
GET    /api/adega/vendas-hoje
GET    /api/adega/movimentacoes
POST   /api/adega/movimentacao
POST   /api/adega/pdv
```

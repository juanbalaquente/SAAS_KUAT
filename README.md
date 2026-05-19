# SAAS Kuat — Sistema de Gestão Multi-Loja

Sistema web completo de gestão para as 3 lojas do grupo Kuat, construído com Laravel 11 + React 18.

| Loja | Tipo | Slug |
|---|---|---|
| **Barbearia Kuat** | Barbearia | `barbearia_kuat` |
| **Lava Kuat** | Lava-jato | `lava_kuat` |
| **Adega R1** | Adega / delivery | `adega_r1` |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS v4 |
| Backend | Laravel 11 + Sanctum (Bearer token) |
| Banco | MySQL 8 |
| HTTP client | Axios + TanStack Query |
| Notificações | Evolution API v1.8.7 (WhatsApp) via Docker |
| Jobs | Laravel Queue (driver database) + Scheduler |

---

## Pré-requisitos

- PHP 8.2+ com extensões: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`
- MySQL 8
- Node.js 18+
- Composer
- Docker (opcional — para notificações WhatsApp)

---

## Instalação e execução

### 1. Backend (Laravel)

```bash
cd backend
cp .env.example .env
# editar: DB_DATABASE, DB_USERNAME, DB_PASSWORD, FRONTEND_URL

php artisan key:generate
php artisan migrate --seed
php artisan serve             # http://localhost:8000
```

### 2. Frontend (React + Vite)

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api

npm install
npm run dev                   # http://localhost:5173
```

### 3. Queue worker (processamento de Jobs/notificações)

```bash
cd backend
php artisan queue:work
```

### 4. Scheduler (lembretes e NPS — a cada minuto)

```bash
cd backend
php artisan schedule:work
```

### 5. Evolution API — WhatsApp (opcional, via Docker)

```bash
# Na raiz do projeto
docker compose up -d
```

Acesse `http://localhost:8080/manager`, crie uma instância chamada **saas_kuat** e conecte o WhatsApp escaneando o QR Code.

---

## Script de inicialização rápida (Windows)

Rode `start.ps1` na raiz do projeto para abrir todos os serviços em janelas separadas:

```powershell
.\start.ps1
```

---

## Variáveis de ambiente

### `backend/.env`

```env
APP_NAME="SAAS Kuat"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=saas_kuat
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=kuat_evolution_key_2024
EVOLUTION_INSTANCE=saas_kuat
```

> **Sem Evolution API configurada:** as mensagens são gravadas em `notificacoes_log` e registradas via `Log::info` — o sistema funciona normalmente sem WhatsApp.

### `frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Contas demo

| Usuário | E-mail | Senha | Role | Acesso |
|---|---|---|---|---|
| Carlos | carlos@saaskuat.com | kuat@2024 | dono | Tudo |
| Rafael | rafael@saaskuat.com | kuat@2024 | barbeiro | Barbearia Kuat |
| Diego | diego@saaskuat.com | kuat@2024 | atendente_lava | Lava Kuat |
| Marcos | marcos@saaskuat.com | kuat@2024 | atendente_adega | Adega R1 |

---

## Funcionalidades

### Dashboard do dono (`/dashboard`)
- Cards das 3 lojas com faturamento do dia, atendimentos realizados e média por atendimento
- Gráfico sparkline de faturamento dos últimos 7 dias por loja
- Lista dos agendamentos recentes do dia com status colorido
- Timestamp de última atualização

### Relatórios (`/relatorios`) — dono
- Filtros de período: esta semana, este mês, mês passado, últimos 3 meses e datas personalizadas
- Card de faturamento total consolidado
- Cards por loja: faturamento, total de atendimentos/pedidos e serviço mais popular
- Gráfico de barras diário com as 3 lojas lado a lado
- Tabela dos serviços mais realizados no período com quantidade e faturamento

### Agendamentos consolidados (`/agendamentos`) — dono
- Tabela com todos os agendamentos das 3 lojas
- Filtros: período (início/fim), loja, status
- Botão rápido "Hoje"
- Dropdown inline para alterar status sem sair da página
- Ordenação por data decrescente

### Gestão — CRUD admin (`/gestao`) — dono
**Aba Serviços:** cadastrar/editar/excluir serviços por loja com nome, duração, preço e status ativo/inativo  
**Aba Profissionais:** cadastrar/editar/remover profissionais por loja com status  
**Aba Produtos (Adega):** cadastrar/editar produtos com categoria, código de barras, preço, estoque atual e mínimo; alerta visual ⚠ para estoque abaixo do mínimo; toggle para mostrar inativos

### Barbearia Kuat (`/barbearia`)
- Próximo atendimento em destaque com nome do cliente, serviço, profissional e horário
- Agenda do dia com cards de status coloridos (pendente → confirmado → em atendimento → concluído)
- Fila de espera
- Botões de progressão de status por agendamento
- Pontos de fidelidade somados automaticamente ao concluir (1 ponto por R$1)

### Lava Kuat (`/lavajato`)
- Grid de boxes com status em tempo real (polling 30s)
- Iniciar lavagem: vincula agendamento ao box, muda status para "ocupado"
- Concluir lavagem: libera o box e dispara WhatsApp automático para o cliente
- Fila de espera com placa e serviço
- Checklist de veículo com registro de itens

### Adega R1 (`/adega`)
- **PDV (caixa):** busca de produtos por nome, carrinho com controle de quantidade, total em tempo real, tipo de venda (balcão/delivery) com campo de endereço, forma de pagamento (Dinheiro/Cartão/PIX), cálculo automático de troco, confirmação de venda e decremento de estoque
- **Estoque:** tabela de todos os produtos com status (Normal / Baixo / Crítico / Esgotado), modal de movimentação (entrada/saída/ajuste com observação), histórico de movimentações
- **Pedidos:** fila de deliveries em andamento com progressão de status (aguardando → preparando → em rota → entregue)
- **Alertas:** lista de produtos abaixo do estoque mínimo

### Agendamento público (`/agendar/:loja`)
- Disponível sem login para qualquer cliente
- **Fluxo padrão (Barbearia/Lava Kuat):** serviço → profissional → data/horário → dados do cliente → confirmação
- **Fluxo Adega R1:** tipo de entrega → seleção de produtos com carrinho → data/horário → dados + endereço → confirmação com resumo do pedido
- Anti-colisão de horários: slots calculados em tempo real com base em agendamentos existentes
- Confirmação WhatsApp imediata após agendar (inclui itens e valores para a Adega)

### Confirmação de agendamento (`/confirmacao/:id`)
- Resumo do agendamento: loja, serviço, data/hora, profissional, cliente
- Para Adega R1: lista de produtos pedidos
- Botão de cancelamento

---

## Notificações WhatsApp

| Evento | Quando | Conteúdo |
|---|---|---|
| Confirmação de agendamento | Imediato após agendar | Loja, serviço, data/hora + itens do pedido (Adega) |
| Lembrete | 1h antes do horário (scheduler) | Dados do agendamento + link |
| Carro pronto | Ao concluir box (Lava Kuat) | Placa + mensagem de retirada |
| NPS | 30min após serviço concluído (scheduler) | Avaliação de 1–5 |

---

## Regras de negócio

1. Não permite dois agendamentos no mesmo profissional/box no mesmo horário
2. Slots calculados com base no `duration_minutes` do serviço e no `open_time`/`close_time` da loja
3. **Programa de fidelidade:** 1 ponto por R$1 gasto, acumulado nas 3 lojas
4. Ao finalizar venda no PDV: decrementa `estoque_atual` e verifica `estoque_minimo`
5. Cancelamento disponível para clientes via link público até o momento do serviço
6. Acesso por role: cada usuário acessa apenas a loja vinculada à sua conta

---

## Rotas da API

### Públicas (sem autenticação)

```
POST   /api/auth/login

GET    /api/lojas/{slug}/servicos
GET    /api/lojas/{slug}/disponibilidade?servico_id=&data=&profissional_id=
GET    /api/lojas/{slug}/produtos
POST   /api/lojas/{slug}/agendar
GET    /api/agendamentos/{id}/publico
PATCH  /api/agendamentos/{id}/cancelar
```

### Autenticadas (`Authorization: Bearer {token}`)

```
POST   /api/auth/logout
GET    /api/me

# Dashboard e relatórios
GET    /api/dashboard/resumo
GET    /api/relatorios?inicio=&fim=

# Agendamentos (admin)
GET    /api/agendamentos?inicio=&fim=&loja_id=&status=
POST   /api/agendamentos
GET    /api/agendamentos/{id}
PUT    /api/agendamentos/{id}
DELETE /api/agendamentos/{id}
PATCH  /api/agendamentos/{id}/status

# Barbearia
GET    /api/barbearia/agenda-hoje
GET    /api/barbearia/fila

# Lava Kuat
GET    /api/lavajato/boxes
PATCH  /api/lavajato/boxes/{id}
POST   /api/lavajato/checklist

# Adega R1
GET    /api/adega/estoque
GET    /api/adega/alertas
GET    /api/adega/vendas-hoje
GET    /api/adega/movimentacoes
POST   /api/adega/movimentacao
POST   /api/adega/pdv
GET    /api/pedidos
PATCH  /api/pedidos/{id}/status

# Gestão (CRUD)
GET|POST              /api/servicos
GET|PUT|DELETE        /api/servicos/{id}
GET|POST              /api/profissionais
GET|PUT|DELETE        /api/profissionais/{id}
GET|POST              /api/produtos?todos=1
GET|PUT|DELETE        /api/produtos/{id}
GET|POST              /api/users
GET|PUT|DELETE        /api/users/{id}
```

---

## Estrutura de pastas

```
SAAS_KUAT/
├── backend/                    # Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── RelatoriosController.php
│   │   │   ├── AgendamentoController.php
│   │   │   ├── AgendamentoPublicoController.php
│   │   │   ├── BarbeariaController.php
│   │   │   ├── LavaJatoController.php
│   │   │   ├── AdegaController.php
│   │   │   ├── PedidoController.php
│   │   │   ├── ServicoController.php
│   │   │   ├── ProfissionalController.php
│   │   │   ├── ProdutoController.php
│   │   │   └── UserController.php
│   │   ├── Jobs/
│   │   │   ├── EnviarConfirmacaoAgendamento.php
│   │   │   ├── EnviarLembreteAgendamento.php
│   │   │   ├── EnviarNotificacaoCarroPronto.php
│   │   │   └── EnviarNPS.php
│   │   ├── Models/
│   │   │   ├── Agendamento.php
│   │   │   ├── Box.php
│   │   │   ├── Cliente.php
│   │   │   ├── Loja.php
│   │   │   ├── MovimentacaoEstoque.php
│   │   │   ├── NotificacaoLog.php
│   │   │   ├── Pedido.php
│   │   │   ├── PedidoItem.php
│   │   │   ├── Produto.php
│   │   │   ├── Profissional.php
│   │   │   ├── Servico.php
│   │   │   └── User.php
│   │   └── Services/
│   │       └── WhatsAppService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
└── frontend/                   # React 18 + Vite
    └── src/
        ├── components/
        │   ├── Layout.jsx
        │   ├── PDVModal.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── RelatoriosPage.jsx
        │   ├── AgendamentosAdminPage.jsx
        │   ├── GestaoPage.jsx
        │   ├── BarbeariaPage.jsx
        │   ├── LavaJatoPage.jsx
        │   ├── AdegaPage.jsx
        │   ├── AgendamentoPage.jsx
        │   └── ConfirmacaoPage.jsx
        ├── services/api.js
        └── store/AuthContext.jsx
```

---

## Docker Compose — Evolution API

O arquivo `docker-compose.yml` na raiz sobe a Evolution API v1.8.7 na porta 8080:

```yaml
# Chave de API: kuat_evolution_key_2024
# Manager: http://localhost:8080/manager
```

Para parar:
```bash
docker compose down
```

---

## Banco de dados

Tabelas principais:

| Tabela | Descrição |
|---|---|
| `users` | Usuários do sistema com role e loja vinculada |
| `lojas` | Configuração das 3 lojas (horários, slots, cores) |
| `clientes` | Clientes com telefone e pontos de fidelidade |
| `profissionais` | Profissionais por loja |
| `servicos` | Serviços por loja com duração e preço |
| `agendamentos` | Agendamentos de todas as lojas |
| `boxes` | Boxes do Lava Kuat com status em tempo real |
| `checklist_veiculo` | Checklists dos veículos |
| `produtos` | Produtos da Adega com estoque |
| `pedidos` | Pedidos balcão/delivery da Adega |
| `pedido_itens` | Itens de cada pedido |
| `movimentacoes_estoque` | Histórico de entradas/saídas/ajustes |
| `notificacoes_log` | Log de todas as mensagens WhatsApp enviadas |
| `jobs` | Fila de jobs Laravel |

Para resetar com dados de demonstração:
```bash
cd backend
php artisan migrate:fresh --seed
```

# SAAS Kuat — Sistema de Gestão Multi-Loja

Sistema web completo de gestão para as lojas do grupo Kuat:

- **Barbearia Kuat** ✂️ — Agendamentos, fila de atendimento, profissionais
- **Lava Kuat** 🚗 — Gestão de boxes, checklist de veículos, notificações
- **Adega R1** 🍷 — PDV, controle de estoque, delivery

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Laravel 11 + Sanctum |
| Banco | MySQL 8 |
| Notificações | Evolution API (WhatsApp) |

## Como rodar

```bash
# Backend
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend
cd frontend
npm install
npm run dev
```

## Acesso demo

| Usuário | Email | Senha | Role |
|---|---|---|---|
| Carlos | carlos@saaskuat.com | kuat@2024 | Dono |
| Rafael | rafael@saaskuat.com | kuat@2024 | Barbeiro |
| Diego | diego@saaskuat.com | kuat@2024 | Atendente Lava |
| Marcos | marcos@saaskuat.com | kuat@2024 | Atendente Adega |

# Instalação do SAAS Kuat

## Pré-requisitos

- PHP 8.2+
- Composer
- MySQL 8+
- Node.js 20+

## Instalação rápida

### 1. Backend (Laravel)

```bash
cd backend

# Instalar dependências PHP
composer install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Banco de dados (crie o banco saas_kuat no MySQL antes)
php artisan migrate
php artisan db:seed

# Iniciar servidor
php artisan serve
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## Banco de dados

Crie o banco antes de migrar:

```sql
CREATE DATABASE saas_kuat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Acesso

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

## Usuários demo

| Email | Senha | Role |
|---|---|---|
| carlos@saaskuat.com | kuat@2024 | Dono |
| rafael@saaskuat.com | kuat@2024 | Barbeiro |
| diego@saaskuat.com | kuat@2024 | Atendente Lava Kuat |
| marcos@saaskuat.com | kuat@2024 | Atendente Adega R1 |

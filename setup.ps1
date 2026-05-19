# ============================================================
#  SAAS Kuat — Setup automatico (primeira execucao)
#  Execute: .\setup.ps1
# ============================================================

$root    = $PSScriptRoot
$backend = "$root\backend"
$frontend= "$root\frontend"

function Ok($msg)   { Write-Host "  [OK] $msg"    -ForegroundColor Green  }
function Warn($msg) { Write-Host "  [!]  $msg"    -ForegroundColor Yellow }
function Err($msg)  { Write-Host "  [X]  $msg"    -ForegroundColor Red    }
function Step($msg) { Write-Host "`n>> $msg"       -ForegroundColor Cyan   }

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   SAAS Kuat — Setup automatico"            -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# ─── 1. Verificar pre-requisitos ───────────────────────────
Step "Verificando pre-requisitos..."

$phpOk      = $null -ne (Get-Command php      -ErrorAction SilentlyContinue)
$composerOk = $null -ne (Get-Command composer -ErrorAction SilentlyContinue)
$nodeOk     = $null -ne (Get-Command node     -ErrorAction SilentlyContinue)
$npmOk      = $null -ne (Get-Command npm      -ErrorAction SilentlyContinue)
$gitOk      = $null -ne (Get-Command git      -ErrorAction SilentlyContinue)
$dockerOk   = $null -ne (Get-Command docker   -ErrorAction SilentlyContinue)

if ($phpOk)      { Ok "PHP: $((php -r 'echo PHP_VERSION;' 2>$null))" }      else { Err "PHP nao encontrado. Instale em https://www.php.net/downloads" }
if ($composerOk) { Ok "Composer encontrado" }   else { Err "Composer nao encontrado. Instale em https://getcomposer.org" }
if ($nodeOk)     { Ok "Node.js: $((node -v))" } else { Err "Node.js nao encontrado. Instale em https://nodejs.org" }
if ($npmOk)      { Ok "npm encontrado" }         else { Err "npm nao encontrado" }
if ($gitOk)      { Ok "Git encontrado" }         else { Warn "Git nao encontrado (opcional se ja clonou)" }
if ($dockerOk)   { Ok "Docker encontrado (WhatsApp disponivel)" } else { Warn "Docker nao encontrado — notificacoes WhatsApp desativadas" }

if (-not $phpOk -or -not $composerOk -or -not $nodeOk) {
    Write-Host ""
    Err "Instale os pre-requisitos acima e rode o setup novamente."
    exit 1
}

# ─── 2. Detectar MySQL ──────────────────────────────────────
Step "Detectando MySQL..."

$mysqlRunning = $null -ne (Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue)

if ($mysqlRunning) {
    Ok "MySQL ja esta rodando na porta 3306"
} else {
    # Tentar XAMPP
    $xamppMysql = "C:\xampp\mysql\bin\mysqld.exe"
    if (Test-Path $xamppMysql) {
        Warn "MySQL nao esta rodando. Tentando iniciar via XAMPP..."
        Start-Process -FilePath $xamppMysql -ArgumentList "--defaults-file=C:\xampp\mysql\bin\my.ini" -WindowStyle Hidden
        Start-Sleep -Seconds 4
        $mysqlRunning = $null -ne (Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue)
        if ($mysqlRunning) { Ok "MySQL iniciado via XAMPP" }
        else { Err "Nao foi possivel iniciar o MySQL. Inicie manualmente e rode o setup novamente." ; exit 1 }
    } else {
        Err "MySQL nao esta rodando e XAMPP nao foi encontrado em C:\xampp."
        Err "Inicie o MySQL manualmente e rode o setup novamente."
        exit 1
    }
}

# ─── 3. Configurar backend .env ─────────────────────────────
Step "Configurando backend..."

$envFile    = "$backend\.env"
$envExample = "$backend\.env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Ok ".env criado a partir de .env.example"
    } else {
        # Criar .env minimo
        @"
APP_NAME="SAAS Kuat"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=saas_kuat
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database

EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=kuat_evolution_key_2024
EVOLUTION_INSTANCE=saas_kuat
"@ | Out-File -FilePath $envFile -Encoding utf8
        Ok ".env criado com configuracoes padrao"
    }
} else {
    Ok ".env ja existe"
}

# Perguntar senha do MySQL
Write-Host ""
Write-Host "  Qual a senha do root do MySQL? (deixe em branco se nao tiver senha)" -ForegroundColor White
$dbPass = Read-Host "  Senha"

# Atualizar DB_PASSWORD no .env
$envContent = Get-Content $envFile -Raw
$envContent = $envContent -replace 'DB_PASSWORD=.*', "DB_PASSWORD=$dbPass"
$envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline
Ok "DB_PASSWORD configurado"

# ─── 4. Composer install ────────────────────────────────────
Step "Instalando dependencias PHP (composer install)..."

Set-Location $backend
$composerResult = composer install --no-interaction 2>&1
if ($LASTEXITCODE -eq 0) { Ok "Dependencias PHP instaladas" }
else { Err "Erro no composer install. Verifique a saida acima." ; exit 1 }

# ─── 5. APP_KEY ─────────────────────────────────────────────
Step "Gerando APP_KEY..."

$envContent = Get-Content $envFile -Raw
if ($envContent -match 'APP_KEY=base64:') {
    Ok "APP_KEY ja existe"
} else {
    php artisan key:generate | Out-Null
    Ok "APP_KEY gerado"
}

# ─── 6. Banco de dados ──────────────────────────────────────
Step "Criando banco de dados saas_kuat (se nao existir)..."

$mysqlCmd = "CREATE DATABASE IF NOT EXISTS saas_kuat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if ($dbPass -eq "") {
    echo $mysqlCmd | mysql -u root 2>$null
} else {
    echo $mysqlCmd | mysql -u root -p"$dbPass" 2>$null
}

if ($LASTEXITCODE -eq 0) { Ok "Banco saas_kuat pronto" }
else { Warn "Nao foi possivel criar o banco automaticamente — tentando continuar mesmo assim" }

Step "Rodando migrations e seeders..."

php artisan migrate --seed --force 2>&1
if ($LASTEXITCODE -eq 0) { Ok "Banco populado com dados de demonstracao" }
else { Err "Erro nas migrations. Verifique a saida acima." ; exit 1 }

# ─── 7. Frontend ────────────────────────────────────────────
Step "Instalando dependencias do frontend (npm install)..."

Set-Location $frontend

$frontendEnv = "$frontend\.env"
if (-not (Test-Path $frontendEnv)) {
    "VITE_API_URL=http://localhost:8000/api" | Out-File -FilePath $frontendEnv -Encoding utf8
    Ok "frontend/.env criado"
} else {
    Ok "frontend/.env ja existe"
}

npm install --silent 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Ok "Dependencias do frontend instaladas" }
else { Err "Erro no npm install. Verifique a saida acima." ; exit 1 }

# ─── 8. Evolution API (Docker) ──────────────────────────────
if ($dockerOk) {
    Step "Subindo Evolution API (Docker)..."
    Set-Location $root
    docker compose up -d 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "Evolution API rodando em http://localhost:8080/manager" }
    else { Warn "Erro ao subir Docker — WhatsApp desativado, resto funciona normalmente" }
}

# ─── 9. Subir todos os servicos ─────────────────────────────
Set-Location $root
Step "Subindo todos os servicos..."

# Laravel
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; Write-Host 'LARAVEL - http://localhost:8000' -ForegroundColor Cyan; php artisan serve" -WindowStyle Normal

Start-Sleep -Seconds 2

# Queue worker
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; Write-Host 'QUEUE WORKER' -ForegroundColor Cyan; php artisan queue:work --verbose" -WindowStyle Normal

# Scheduler
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; Write-Host 'SCHEDULER' -ForegroundColor Cyan; php artisan schedule:work" -WindowStyle Normal

# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontend'; Write-Host 'FRONTEND - http://localhost:5173' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# ─── Fim ────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Setup concluido com sucesso!"            -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:        http://localhost:5173"   -ForegroundColor White
Write-Host "  Backend API:     http://localhost:8000"   -ForegroundColor White
if ($dockerOk) {
Write-Host "  Evolution API:   http://localhost:8080/manager" -ForegroundColor White
}
Write-Host ""
Write-Host "  Login demo:      carlos@saaskuat.com / kuat@2024" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Nas proximas vezes use apenas: .\start.ps1" -ForegroundColor Cyan
Write-Host ""

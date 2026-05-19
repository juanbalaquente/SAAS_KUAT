# ============================================================
#  SAAS Kuat — Iniciar todos os servicos
#  Use apos ja ter rodado setup.ps1 pelo menos uma vez.
#  Execute: .\start.ps1
# ============================================================

$root     = $PSScriptRoot
$backend  = "$root\backend"
$frontend = "$root\frontend"

function Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green  }
function Warn($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Step($msg) { Write-Host "`n>> $msg"    -ForegroundColor Cyan   }

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   SAAS Kuat — Iniciando servicos"          -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

# ─── MySQL ──────────────────────────────────────────────────
Step "MySQL..."
$mysqlRunning = $null -ne (Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue)
if ($mysqlRunning) {
    Ok "MySQL ja esta rodando"
} else {
    $xamppMysql = "C:\xampp\mysql\bin\mysqld.exe"
    if (Test-Path $xamppMysql) {
        Start-Process -FilePath $xamppMysql -ArgumentList "--defaults-file=C:\xampp\mysql\bin\my.ini" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Ok "MySQL iniciado via XAMPP"
    } else {
        Warn "MySQL nao encontrado — inicie manualmente se necessario"
    }
}

# ─── Evolution API ──────────────────────────────────────────
Step "Evolution API (Docker)..."
$dockerOk = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)
if ($dockerOk) {
    docker compose -f "$root\docker-compose.yml" up -d 2>&1 | Out-Null
    Ok "Evolution API rodando em http://localhost:8080/manager"
} else {
    Warn "Docker nao encontrado — WhatsApp desativado"
}

# ─── Laravel ────────────────────────────────────────────────
Step "Laravel (backend)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; Write-Host 'LARAVEL  http://localhost:8000' -ForegroundColor Cyan; php artisan serve" -WindowStyle Normal
Ok "Laravel iniciando..."

Start-Sleep -Seconds 1

# ─── Queue worker ───────────────────────────────────────────
Step "Queue Worker..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; Write-Host 'QUEUE WORKER' -ForegroundColor Cyan; php artisan queue:work --verbose" -WindowStyle Normal
Ok "Queue worker iniciando..."

# ─── Scheduler ──────────────────────────────────────────────
Step "Scheduler (lembretes/NPS)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; Write-Host 'SCHEDULER' -ForegroundColor Cyan; php artisan schedule:work" -WindowStyle Normal
Ok "Scheduler iniciando..."

# ─── Frontend ───────────────────────────────────────────────
Step "Frontend (React)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontend'; Write-Host 'FRONTEND  http://localhost:5173' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
Ok "Frontend iniciando..."

# ─── Resumo ─────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Tudo iniciado!"                          -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:    http://localhost:5173"       -ForegroundColor White
Write-Host "  Backend:     http://localhost:8000"       -ForegroundColor White
if ($dockerOk) {
Write-Host "  WhatsApp:    http://localhost:8080/manager" -ForegroundColor White
}
Write-Host ""
Write-Host "  Login:  carlos@saaskuat.com / kuat@2024"  -ForegroundColor Yellow
Write-Host ""

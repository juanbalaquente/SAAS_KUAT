# SAAS Kuat — Start All Services

$root = $PSScriptRoot
$backend = "$root\backend"

Write-Host "Iniciando MySQL (XAMPP)..." -ForegroundColor Cyan
$mysqlRunning = Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue
if (-not $mysqlRunning) {
    Start-Process -FilePath "C:\xampp\mysql\bin\mysqld.exe" -ArgumentList "--defaults-file=C:\xampp\mysql\bin\my.ini" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "  MySQL iniciado." -ForegroundColor Green
} else {
    Write-Host "  MySQL ja esta rodando." -ForegroundColor Yellow
}

Write-Host "Iniciando Evolution API (Docker)..." -ForegroundColor Cyan
docker compose -f "$root\docker-compose.yml" up -d evolution | Out-Null
Write-Host "  Evolution API OK." -ForegroundColor Green

Write-Host "Iniciando Laravel..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; php artisan serve" -WindowStyle Normal

Write-Host "Iniciando Queue Worker..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; php artisan queue:work --verbose" -WindowStyle Normal

Write-Host "Iniciando Scheduler..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backend'; php artisan schedule:work" -WindowStyle Normal

Write-Host ""
Write-Host "Tudo rodando!" -ForegroundColor Green
Write-Host "  Backend:        http://localhost:8000" -ForegroundColor White
Write-Host "  Frontend:       http://localhost:5173  (rode 'npm run dev' na pasta frontend)" -ForegroundColor White
Write-Host "  Evolution API:  http://localhost:8080/manager" -ForegroundColor White
Write-Host ""

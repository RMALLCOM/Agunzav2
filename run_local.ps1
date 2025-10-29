# JetSMART Kiosk - Local runner (Windows PowerShell)
# - Starts FastAPI backend on :8001 (ALWAYS_COMPLY=1)
# - Starts React dev server on :3000 with REACT_APP_BACKEND_URL=http://localhost:8001
# - When you close the frontend, backend process is stopped

$ErrorActionPreference = "Stop"

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"
$VENV = Join-Path $BACKEND ".venv"

Write-Host "=================================================="
Write-Host "1) Preparing Python virtualenv (backend)"
Write-Host "=================================================="
if (-not (Test-Path $VENV)) {
  py -m venv $VENV
}
$activate = Join-Path $VENV "Scripts\Activate.ps1"
. $activate
python -m pip install --upgrade pip | Out-Null
pip install -r (Join-Path $BACKEND "requirements.txt")

Write-Host "=================================================="
Write-Host "2) Launching FastAPI backend on :8001 (ALWAYS_COMPLY=1)"
Write-Host "=================================================="
$env:ALWAYS_COMPLY = "1"
Push-Location $BACKEND
$backendProcess = Start-Process -FilePath "python" -ArgumentList "-m","uvicorn","server:app","--host","0.0.0.0","--port","8001" -PassThru -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 1
Write-Host "Backend PID: $($backendProcess.Id)"

try {
  Write-Host "=================================================="
  Write-Host "3) Starting React dev server on :3000"
  Write-Host "=================================================="
  $env:REACT_APP_BACKEND_URL = "http://localhost:8001"
  Set-Location $FRONTEND
  if (-not (Test-Path (Join-Path $FRONTEND "node_modules"))) {
    yarn install
  }
  if (-not (Test-Path (Join-Path $FRONTEND "public/assets/jetsmart_bg.jpg"))) {
    New-Item -ItemType Directory -Force -Path (Join-Path $FRONTEND "public/assets") | Out-Null
    Write-Host "Tip: place your background at frontend/public/assets/jetsmart_bg.jpg"
  }
  yarn start
}
finally {
  Write-Host "Stopping backend (PID $($backendProcess.Id)) ..."
  if ($backendProcess -and !$backendProcess.HasExited) {
    Stop-Process -Id $backendProcess.Id -Force
  }
}

# Start local stack (MySQL + optional services). Run from repo root: backend\, after copying .env.example to .env
# Usage: .\compose-up.ps1
#        .\compose-up.ps1 --build

Set-Location $PSScriptRoot
$ErrorActionPreference = "Continue"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host @"

Docker was not found on your PATH.

1) Install Docker Desktop for Windows:
   https://docs.docker.com/desktop/install/windows-install/

2) Start Docker Desktop, then open a new terminal.

3) Run this script again (or use: docker compose up -d)

Note: Use 'docker compose' (space), not 'docker-compose' (hyphen).

"@
    exit 1
}

Write-Host "Using: docker compose up -d" -ForegroundColor Cyan
docker compose up -d @args
exit $LASTEXITCODE

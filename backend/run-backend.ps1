# Run Spring Boot locally with sensible defaults for Windows.
# Usage: .\run-backend.ps1   or   .\run-backend.ps1 spring-boot:run -DskipTests

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not $env:JAVA_HOME) {
    foreach ($d in @(
            "$env:ProgramFiles\Java\jdk-17",
            "$env:ProgramFiles\Java\jdk-21"
        )) {
        if (Test-Path "$d\bin\java.exe") {
            $env:JAVA_HOME = $d
            break
        }
    }
    if (-not $env:JAVA_HOME) {
        $adoptium = Join-Path $env:ProgramFiles "Eclipse Adoptium"
        if (Test-Path $adoptium) {
            $jdk = Get-ChildItem -Path $adoptium -Directory -Filter "jdk*" -ErrorAction SilentlyContinue |
                Where-Object { Test-Path (Join-Path $_.FullName "bin\java.exe") } |
                Select-Object -First 1
            if ($jdk) { $env:JAVA_HOME = $jdk.FullName }
        }
    }
}

if (-not $env:JAVA_HOME) {
    Write-Error "JAVA_HOME is not set and no JDK was found under Program Files. Install JDK 17+ or set JAVA_HOME."
    exit 1
}

if (-not $env:PORT) {
    $busy = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
    if ($busy) {
        $env:PORT = "8081"
        Write-Warning "Port 8080 is in use. Starting on PORT=$env:PORT."
        $localEnv = Join-Path $PSScriptRoot "..\frontend\.env.development.local"
        @"
VITE_API_URL=http://localhost:$($env:PORT)
VITE_BACKEND_ORIGIN=http://localhost:$($env:PORT)
"@ | Set-Content -Path $localEnv -Encoding utf8
        Write-Host "Wrote $localEnv - restart the Vite dev server so the UI uses this API URL." -ForegroundColor Cyan
    }
}

if ($args.Count -eq 0) {
    & .\mvnw.cmd spring-boot:run
}
else {
    & .\mvnw.cmd @args
}

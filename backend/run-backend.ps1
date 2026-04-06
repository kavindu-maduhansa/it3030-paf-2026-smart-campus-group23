# Start the Spring Boot API without a global Maven install.
# Sets JAVA_HOME on Windows when it is missing (mvnw.cmd requires it).

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

if (-not $env:JAVA_HOME) {
    $found = $null
    foreach ($name in @("jdk-17", "jdk-21")) {
        $p = "$env:ProgramFiles\Java\$name"
        if (Test-Path "$p\bin\javac.exe") {
            $found = $p
            break
        }
    }
    if (-not $found) {
        $adoptium = Get-ChildItem "$env:ProgramFiles\Eclipse Adoptium" -Directory -Filter "jdk-*" -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending
        foreach ($d in $adoptium) {
            if (Test-Path "$($d.FullName)\bin\javac.exe") {
                $found = $d.FullName
                break
            }
        }
    }
    if (-not $found) {
        Write-Error "JAVA_HOME is not set and no JDK was found under Program Files\Java or Eclipse Adoptium. Install JDK 17+ or set JAVA_HOME to your JDK folder."
    }
    $env:JAVA_HOME = $found
    Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
}

Set-Location $root

$checkPort = if ($env:PORT) { [int]$env:PORT } else { 8080 }
$inUse = @(Get-NetTCPConnection -LocalPort $checkPort -State Listen -ErrorAction SilentlyContinue) | Select-Object -First 1
if ($inUse) {
    Write-Host "Port $checkPort is already in use (PID $($inUse.OwningProcess)). Stop that process first, e.g.:" -ForegroundColor Yellow
    Write-Host "  taskkill /PID $($inUse.OwningProcess) /F" -ForegroundColor Yellow
    Write-Host "Or use another port: `$env:PORT=8081 .\run-backend.ps1" -ForegroundColor Yellow
}

if ($args.Count -eq 0) {
    & "$root\mvnw.cmd" spring-boot:run
} else {
    & "$root\mvnw.cmd" @args
}

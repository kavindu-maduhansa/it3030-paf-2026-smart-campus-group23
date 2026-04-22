$ErrorActionPreference = "Stop"

$port = 8081

try {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listeners) {
        $pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($ownerPid in $pids) {
            try {
                Stop-Process -Id $ownerPid -Force -ErrorAction Stop
                Write-Host "Stopped process on port $port (PID: $ownerPid)"
            } catch {
                Write-Host "Could not stop PID ${ownerPid}: $($_.Exception.Message)"
            }
        }
        Start-Sleep -Milliseconds 700
    }
} catch {
    Write-Host "Port check warning: $($_.Exception.Message)"
}

Write-Host "Starting backend on port $port ..."
& ".\mvnw.cmd" spring-boot:run

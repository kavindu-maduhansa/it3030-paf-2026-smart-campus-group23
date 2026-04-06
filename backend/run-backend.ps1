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
if ($args.Count -eq 0) {
    & "$root\mvnw.cmd" spring-boot:run
} else {
    & "$root\mvnw.cmd" @args
}

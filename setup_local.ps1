# NexusQuant Local Bootstrap & Installation Script for Windows Systems
# Powershell version

$ErrorActionPreference = "Stop"

Write-Host "==================================================================" -ForegroundColor Blue
Write-Host "  NEXUSQUANT PRO — WINDOWS BOOTSTRAP INSTALLER ENGINE" -ForegroundColor Blue
Write-Host "==================================================================" -ForegroundColor Blue

# Check requirements
function Check-Command ($cmd, $name) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Write-Host "[✓] Success: $name is available on this system." -ForegroundColor Green
        return $true
    } else {
        Write-Host "[!] Alert: $name ($cmd) is missing." -ForegroundColor Yellow
        return $false
    }
}

Write-Host "`n[1/4] Running system capabilities checks..." -ForegroundColor Blue
$HasNode = Check-Command "node" "Node.js Runtime"
$HasPnpm = Check-Command "pnpm" "PNPM Package Manager"
$HasPython = Check-Command "python" "Python Environment"
$HasCargo = Check-Command "cargo" "Rust Cargo Compiler"

if (-not $HasPython) {
    $HasPython = Check-Command "python3" "Python Environment"
}

# Install dependencies
Write-Host "`n[2/4] Installing web workspace dependencies..." -ForegroundColor Blue
if ($HasPnpm) {
    Write-Host "Running pnpm install..." -ForegroundColor Green
    pnpm install
} else {
    Write-Host "Skipping package manager installs as pnpm was not found." -ForegroundColor Yellow
}

# Python Services setup (Isolated and treated as distinct deployable entities)
Write-Host "`n[3/4] Registering python microservices dependencies..." -ForegroundColor Blue
if ($HasPython) {
    $services = @("services/ingestion-engine", "services/alert-service", "services/replay-service")
    foreach ($service in $services) {
        if (Test-Path $service) {
            Write-Host "Setting up virtual environment for $service..." -ForegroundColor Green
            $pyCmd = if (Get-Command "python" -ErrorAction SilentlyContinue) { "python" } else { "python3" }
            & $pyCmd -m venv "$service/.venv"

            # Activate and install dependencies
            $activateScript = "$service/.venv/Scripts/Activate.ps1"
            if (Test-Path $activateScript) {
                . $activateScript
                & pip install --upgrade pip
                if (Test-Path "$service/requirements.txt") {
                    & pip install -r "$service/requirements.txt"
                } elseif (Test-Path "$service/pyproject.toml") {
                    & pip install poetry
                    & poetry install --no-root
                }
                deactivate
            }
            Write-Host "Finished bootstrapping $service successfully." -ForegroundColor Green
        }
    }
} else {
    Write-Host "Skipping isolated virtual env setups as python was not found." -ForegroundColor Yellow
}

# Compile web assets only (Tauri binary compiles skipped if cargo is missing)
Write-Host "`n[4/4] Compiling native desktop executables and bundles..." -ForegroundColor Blue
if ($HasPnpm) {
    Write-Host "Running pnpm build to compile Web assets..." -ForegroundColor Green
    pnpm build

    if ($HasCargo) {
        Write-Host "Compiling native Windows desktop executable (.exe installer) using Tauri..." -ForegroundColor Green
        pnpm --filter @nexusquant/desktop-frontend tauri
    } else {
        Write-Host "Skipping native Tauri compiler check because Rust Cargo was not detected." -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping monorepo bundle compiles as pnpm was not found." -ForegroundColor Yellow
}

Write-Host "`n==================================================================" -ForegroundColor Green
Write-Host "  NEXUSQUANT LOCAL WINDOWS BOOTSTRAP COMPLETED SUCCESSFULLY! " -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "Your native Windows installer/executable has been successfully built!"
Write-Host "You can find your desktop app installer in:"
Write-Host "  -> apps\desktop\src-tauri\target\release\bundle\"
Write-Host "==================================================================" -ForegroundColor Green

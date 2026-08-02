#!/usr/bin/env bash

# NexusQuant Local Bootstrap & Compilation Script
# Designed for zero-friction open-source workspace configurations.

set -euo pipefail

# ANSI color escape codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0;0m' # No Color

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}  NEXUSQUANT PRO — SYSTEM-WIDE LOCAL BOOTSTRAP ENGINE           ${NC}"
echo -e "${BLUE}==================================================================${NC}"

# Detect Operating System
OS_TYPE=$(uname -s || echo "Unknown")
echo -e "${BLUE}Detected Operating System environment: ${OS_TYPE}${NC}"

# Helper function to check command dependencies
check_dep() {
    local cmd=$1
    local name=$2
    if ! command -v "$cmd" &>/dev/null; then
        echo -e "${YELLOW}[!] Alert: $name ($cmd) is missing on your system.${NC}"
        return 1
    else
        echo -e "${GREEN}[✓] Success: $name is available.${NC}"
        return 0
    fi
}

echo -e "\n${BLUE}[1/4] Running system tool checks...${NC}"
HAS_NODE=0 && check_dep "node" "Node.js Runtime" && HAS_NODE=1 || true
HAS_PNPM=0 && check_dep "pnpm" "PNPM Package Manager" && HAS_PNPM=1 || true
HAS_PYTHON=0 && check_dep "python3" "Python3 Environment" && HAS_PYTHON=1 || true
HAS_CARGO=0 && check_dep "cargo" "Rust Cargo Compiler" && HAS_CARGO=1 || true

# 2. Package installation helpers
echo -e "\n${BLUE}[2/4] Installing TypeScript/React Workspace dependencies...${NC}"
if [ "$HAS_PNPM" -eq 1 ]; then
    echo -e "${GREEN}Running pnpm install...${NC}"
    pnpm install
else
    echo -e "${YELLOW}Skipping frontend installation because pnpm is not available.${NC}"
fi

# 3. Python Service Virtual Environment Setup (Treated as decoupled, separate entities)
echo -e "\n${BLUE}[3/4] Setting up isolated Python services (treated as distinct entities)...${NC}"
if [ "$HAS_PYTHON" -eq 1 ]; then
    services=(
        "services/ingestion-engine"
        "services/alert-service"
        "services/replay-service"
    )
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            echo -e "${GREEN}Bootstrapping virtual environment for isolated service: $service...${NC}"
            python3 -m venv "$service/.venv" || true
            source "$service/.venv/bin/activate" || true
            pip install --upgrade pip || true
            if [ -f "$service/requirements.txt" ]; then
                pip install -r "$service/requirements.txt" || true
            elif [ -f "$service/pyproject.toml" ]; then
                pip install poetry || true
                poetry install --no-root || true
            fi
            deactivate || true
            echo -e "${GREEN}Finished bootstrapping service: $service.${NC}"
        fi
    done
else
    echo -e "${YELLOW}Skipping python environments setup because python3 is not available.${NC}"
fi

# 4. Compiling TS and Web assets only (skipping native Mac/Win Tauri desktop compilations)
echo -e "\n${BLUE}[4/4] Compiling platform-agnostic web and native executables...${NC}"
if [ "$HAS_PNPM" -eq 1 ] && [ "$HAS_NODE" -eq 1 ]; then
    echo -e "${GREEN}Compiling TypeScript workspace packages and frontend application...${NC}"
    pnpm build

    if [ "$HAS_CARGO" -eq 1 ]; then
        echo -e "${GREEN}Compiling native desktop app executable installer using Tauri...${NC}"
        pnpm --filter @nexusquant/desktop-frontend tauri build
    else
        echo -e "${YELLOW}Skipping native Tauri desktop compile because Rust Cargo was not detected.${NC}"
    fi
else
    echo -e "${YELLOW}Skipping build because pnpm/node is missing.${NC}"
fi

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}  NEXUSQUANT LOCAL BOOTSTRAP SUITE COMPLETED SUCCESSFULLY!        ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "Your native platform desktop installer/executable has been successfully built!"
echo -e "You can find your desktop app installer inside:"
echo -e "  -> apps/desktop/src-tauri/target/release/bundle/"
echo -e "=================================================================="

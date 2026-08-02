# NexusQuant Pro — Institution-Grade Professional Trading & Analytics Platform

Welcome to **NexusQuant Pro**, an elite, open-source professional charting workstation and distributed quantitative analytics platform. Engineered for high-frequency trading desks, systematic quantitative analysts, and professional scalpers, NexusQuant Pro outclasses standard web charting apps through low-latency hardware-accelerated Canvas/WebGL visualization, a dynamic multi-database ingestion pipeline, and local persistence synchronization.

---

## 🧭 Key Architectural Pillars

### 1. Unified 5-Zone Grid Workspace
The user interface is strictly partitioned into five layout zones matching professional trading systems:
* **Zone 1: Top Control Bar (48px):** Houses ticker search, timeframe selectors, chart types, indicators drawer, alert creators, playback controllers, splitter, layout management, and direct order execute panels.
* **Zone 2: Left Drawing Column (52px):** Hosts cursor tracking, trend lines, Fibonacci arcs/wedges, shapes, texts, harmonic patterns, price ruler, pencil stay, magnet snap, padlock locks, and clean tools.
* **Zone 3: Main Chart Canvas Viewport:** Centered canvas stage rendering price candles, indicators, overlays, order lines, and active cursor crosshairs with zero latency.
* **Zone 4: Right Widget Dock (Collapsible 320-380px):** Watchlist multi-asset tracking, active alert rules logs, drawing tree hierarchies, volume hotlists, calendar macro events, and Depth of Market (DOM).
* **Zone 5: Bottom Panel Drawer (240-400px):** Asset screeners table, Pine Script IDE with terminal compile logs, strategy backtester metrics, and active broker positions/orders sheets.

### 2. High-Performance Multi-Database Ingestion Engine
The ingestion server dynamically routes market telemetry to chosen database backends using the environment variable `DB_TYPE`:
* **Supabase:** Synchronizes metadata and live ticker tick events directly via transactional REST API.
* **PostgreSQL (Generic/RDS):** Leverages connection pooling to issue robust upsert transactions.
* **TimescaleDB:** Tailored for time-series hypertables with hypertable upserts.
* **Local SQLite:** Zero-dependency embedded database for local desktop storage.

### 3. Local Caching & Bandwidth Conservation
To protect remote server bandwidth and maximize client performance, historical candle data is kept in local client-side caches (LocalStorage/IndexedDB) with a 10-minute cache expiration (TTL). The chart loads cached historical candles instantly, fetching updates only if stale, and appends real-time streaming updates smoothly.

---

## 📦 Directory Structure

```text
├── apps/
│   ├── desktop/                # Electron desktop wrapper
│   │   └── frontend/           # Vite + React + HTML5 Canvas UI Core (Main & Preload Process Isolated)
│   └── docs-site/              # Documentation site static generation
├── docs/                       # Technical specifications, API files, guides
│   ├── USER_GUIDE/             # Charting types & programming reference
│   ├── DEVELOPMENT/            # Ingestion service & components docs
│   ├── API/                    # Rest, WebSocket & FlatBuffers protocols
│   └── ADR/                    # Architectural Decision Records
├── packages/
│   ├── core-types/             # Shared TypeScript schemas & definitions
│   └── plugin-sdk/             # Official Python plugin module
├── plugins/                    # Community & Official quant plugin libraries
└── services/
    ├── ingestion-engine/       # Real-time multi-db Python ingestion server
    ├── alert-service/          # High-speed trigger calculation service
    └── replay-service/         # Playback simulator & replay microservice
```

---

## 🛠️ Installation & Getting Started

### Prerequisites
* **Node.js** v18+ and **pnpm** v9
* **Python** v3.11+

### 1. Backend Ingestion Engine Setup
Configure database connection parameters in your environment:
```bash
export DB_TYPE=sqlite                # Options: sqlite, postgres, timescaledb, supabase
export DB_FILE=storage/nexusquant.db # SQLite only
export DB_HOST=localhost             # Postgres only
export DB_PORT=5432
export DB_NAME=nexusquant
export DB_USER=postgres
export DB_PASSWORD=my-secure-password
```

Start the ingestion server:
```bash
cd services/ingestion-engine
pip install -r requirements.txt      # Or use poetry install
python src/main.py
```

### 2. Frontend Desktop Workspace Setup
From the repository root:
```bash
# Install dependencies
pnpm install

# Start local development server (Local: http://localhost:3000)
pnpm --filter @nexusquant/desktop-frontend run dev

# Run Electron desktop application in development mode
pnpm --filter @nexusquant/desktop-frontend run electron:dev

# Compile and package production-ready Electron app
pnpm --filter @nexusquant/desktop-frontend run electron:build
```

---

## 📖 Complete Documentation Suite
To dive deeper, review our specialized documents located inside the `docs/` folder:

* **Guides & Visualizations:**
  - [Custom series and 21 visualizer configurations](docs/USER_GUIDE/CUSTOM_SERIES.md)
  - [Pine Script and indicator programming reference](docs/USER_GUIDE/INDICATOR_PROGRAMMING.md)
* **Backend & API Specifications:**
  - [Ingestion service ingestion pipeline](docs/DEVELOPMENT/INGESTION_SERVICE.md)
  - [REST API JSON spec](docs/API/REST_SPEC.openapi.json)
  - [WebSocket connection and frames spec](docs/API/WEBSOCKET_PROTO.md)
* **Architecture Decisions (ADRs):**
  - [ADR 0001: Monorepo workspace architecture](docs/ADR/0001-monorepo-architecture.md)
  - [ADR 0002: FlatBuffers schema over IPC](docs/ADR/0002-ipc-protocol-flatbuffers.md)
  - [ADR 0003: DuckDB analytics storage engine](docs/ADR/0003-duckdb-storage-engine.md)
  - [ADR 0004: WebGL/Canvas multi-pane renderer](docs/ADR/0004-webgl-canvas-renderer.md)

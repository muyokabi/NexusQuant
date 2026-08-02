# NexusQuant Pro — Institution-Grade Professional Trading Terminal

Welcome to the **NexusQuant Pro Trading Terminal**, an elite, institution-grade frontend charting and multi-workspace workspace container designed for high-frequency trading desk set ups, professional scalp setups, and multi-monitor power users.

This terminal outclasses generic web charts with custom-designed hardware-accelerated Canvas/WebGL visualization, modular indicator calculators, local workspace persistence synchronization, global command palettes, and advanced terminal settings matrices.

---

## 🚀 Key Architectural Pillars

### 1. Unified 5-Zone Grid Workspace
- **Dynamic Docking Layout:** Supports tiled viewports, split screens, floating detached popouts, and integrated browser-within-app tabs.
- **Workspace Presets:** Fast switching between configurations like *Macro Overview*, *Scalper Terminal*, *Orderflow & Footprint*, and *Multi-Timeframe Matrix*.
- **Persistence:** Local state is hydrated from local storage across sessions, preserving assets, parameters, and vector drawing coordinates.

### 2. Custom 21-Chart Canvas Engine
Native high-efficiency painting algorithm support for 21 visualization types:
1. **Standard Candlesticks**
2. **Hollow Candlesticks**
3. **Volume Candlesticks** (Width modulated by tick volume weight)
4. **Heikin-Ashi** (Trend smoothing calculations)
5. **Renko Bricks** (Time-independent price boxes)
6. **Kagi Trend Lines** (Structural trend reversals)
7. **Point & Figure** (Classic Xs and Os columns)
8. **Line Break** (Breakout comparing bars)
9. **Classic Line** (Close connection)
10. **Line with Markers** (Continuous with node dots)
11. **Step Line** (Staircase transitions)
12. **Standard Area** (Gradient background)
13. **HLC Area** (High-Low-Close boundaries)
14. **Baseline** (Delta compared to baseline)
15. **Bar Chart (OHLC)** (Traditional tick wicks)
16. **High-Low Bars** (Range without bodies)
17. **Range Bars** (Constant price move)
18. **Columns Chart** (Macro histograms)
19. **Volume Footprint** (Bid vs Ask volume overlays)
20. **Time Price Opportunity (TPO / Market Profile)**
21. **Session Volume Profile (SVP)**

### 3. Integrated Global Command Palette
- **Access Hotkey:** Toggle the command palette instantly with `Ctrl+K` or `Cmd+K`.
- **Fast Commands:** Jump tickers, change timeframes (e.g. `1m`, `5m`, `15m`, `1H`), apply indicator overlays, and swap visual themes.

---

## 🛠️ Build and Development

The repository utilizes a monorepo structure managed with `pnpm` workspaces.

### Frontend Development

```bash
# Install dependencies
pnpm install

# Run the local Vite dev server
pnpm --filter @nexusquant/desktop-frontend dev

# Build for production and verify typings
pnpm --filter @nexusquant/desktop-frontend build
```

---

## 🎬 Testing & Verification

We practice visual verification using automated Playwright journeys:
```bash
# Run the end-to-end user verification journeys
python /home/jules/verification/verify_terminal.py
```
This launches a headless browser, interacts with preset switches and color customizers, verifies performance caps, and saves screenshots to `/home/jules/verification/screenshots/verification.png`.

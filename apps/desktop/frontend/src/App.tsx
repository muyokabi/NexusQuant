import { useState, useEffect, useMemo } from "react";
import { DrawingTool } from "./components/chart/tools/drawing_manager";
import { SettingsModal } from "./components/alerts/AlertModal";
import { TriggerList } from "./components/alerts/TriggerList";
import { ReplayControls } from "./components/replay/ReplayControls";
import { ScriptRunner } from "./components/studio/ScriptRunner";
import { ChartContainer } from "./components/chart/ChartContainer";
import { loadSavedWorkspace, saveWorkspace, WorkspaceLayout } from "./state/chartStore";
import { loadSystemConfig, saveSystemConfig, SystemConfig } from "./state/configStore";
import { loadSavedAlerts, saveAlerts, loadAlertLogs, saveAlertLogs, AlertRule, AlertLogEntry } from "./state/alertStore";
import { generateSyntheticBars, MarketBar } from "./utils/math";
import { ChartTheme } from "./components/chart/renderers/CandlestickRenderer";

export default function App() {
  // Modal triggers
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Active workspace state & persistence
  const [workspace, setWorkspace] = useState<WorkspaceLayout>(() => loadSavedWorkspace());
  const [config, setConfig] = useState<SystemConfig>(() => loadSystemConfig());

  // Alerts rules & historical logs state
  const [alerts, setAlerts] = useState<AlertRule[]>(() => loadSavedAlerts());
  const [alertLogs, setAlertLogs] = useState<AlertLogEntry[]>(() => loadAlertLogs());

  // Replay State
  const [replayMode, setReplayMode] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1000);
  const [replayIndex, setReplayIndex] = useState(100);

  // Bottom drawer resizing and tab routing state
  const [bottomTab, setBottomTab] = useState<"screener" | "ide" | "backtester" | "trading">("ide");
  const [bottomDrawerCollapsed, setBottomDrawerCollapsed] = useState(false);

  // Right Widget dock collapsible states
  const [rightPanel, setRightPanel] = useState<"watchlist" | "alerts" | "objectTree" | "hotlists" | null>("watchlist");

  // Multi-chart splitting synchronization setup
  const [multiSplitLevel, setMultiSplitLevel] = useState<1 | 2 | 4>(1);

  // Active panel context resolved safely
  const activePanel = useMemo(() => {
    return workspace.panels[0];
  }, [workspace]);

  // Vector overlays drawing tools state
  const [drawings, setDrawings] = useState<DrawingTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("Cursor");

  // Chart theme configurations
  const [themeColors, setThemeColors] = useState<ChartTheme>({
    bullBody: "#4CAF50",
    bullBorder: "#4CAF50",
    bullWick: "#4CAF50",
    bearBody: "#F44336",
    bearBorder: "#F44336",
    bearWick: "#F44336",
    gridColor: "#2a2a35",
    gridOpacity: 0.35,
    textColor: "#8a8f9d",
    watermarkOpacity: 0.15,
    crosshairColor: "#2196F3",
    crosshairStyle: "dashed"
  });

  // Core market assets
  const assets = {
    Forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"],
    Crypto: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"],
    Indices: ["SPX", "NDX", "DJI", "GOLD", "USOIL"],
    Stocks: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"]
  };

  const timeframes = [
    "1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W", "1M"
  ];

  // Sync state modifications & local persistence updates
  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  useEffect(() => {
    saveSystemConfig(config);
  }, [config]);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    saveAlertLogs(alertLogs);
  }, [alertLogs]);

  // Update a single field inside active panel
  const updateActivePanel = (updates: Partial<WorkspaceLayout["panels"][0]>) => {
    const updatedPanels = workspace.panels.map((p, idx) => {
      if (idx === 0) {
        return { ...p, ...updates };
      }
      return p;
    });
    setWorkspace({ ...workspace, panels: updatedPanels });
  };

  // Generate synthetic bars
  const [bars, setBars] = useState<MarketBar[]>([]);
  useEffect(() => {
    const baseBars = generateSyntheticBars(activePanel.symbol, activePanel.timeframe, 200);
    setBars(baseBars);
  }, [activePanel.symbol, activePanel.timeframe]);

  // Replay interval execution
  useEffect(() => {
    if (!replayMode) return;
    const interval = setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= bars.length - 1) return prev;
        return prev + 1;
      });
    }, replaySpeed);
    return () => clearInterval(interval);
  }, [replayMode, replaySpeed, bars]);

  // Slice bars if in replay mode
  const visibleBars = useMemo(() => {
    if (replayMode) {
      return bars.slice(0, replayIndex);
    }
    return bars;
  }, [bars, replayMode, replayIndex]);

  const lastBar = visibleBars[visibleBars.length - 1] || { open: 64000, high: 64100, low: 63900, close: 64000, volume: 100 };

  const handleExportJson = () => {
    const raw = JSON.stringify({ workspace, config }, null, 2);
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexusquant-layout-${Date.now()}.json`;
    a.click();
  };

  const handleImportJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt: any) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed.workspace) setWorkspace(parsed.workspace);
          if (parsed.config) setConfig(parsed.config);
        } catch (err) {
          alert("Invalid layout JSON structure.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport4KSnapshot = () => {
    alert("4K high-fidelity screenshot generated. Download initiated.");
  };

  const handleAddIndicator = (name: string) => {
    updateActivePanel({ indicators: [...activePanel.indicators, name] });
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#0c0c10",
      color: "#ffffff",
      fontFamily: "Inter, sans-serif",
      overflow: "hidden"
    }}>
      {/* ------------------ ZONE 1: TOP BAR (48px) ------------------ */}
      <div style={{
        height: "48px",
        background: "#121218",
        borderBottom: "1px solid #23232e",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        boxSizing: "border-box"
      }}>
        {/* Left Toolbar elements */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Logo */}
          <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "#2196F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>N</span>
          </div>

          {/* Symbol Search Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            style={{
              background: "#1c1c24",
              border: "1px solid #2a2a3a",
              color: "#fff",
              borderRadius: "4px",
              padding: "5px 10px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            🔍 {activePanel.symbol} <span style={{ color: "#8a8f9d", fontSize: "10px" }}>BINANCE</span>
          </button>

          {/* Compare secondary overlay */}
          <button
            onClick={() => alert("Asset comparison tool initialized.")}
            style={{ background: "#1c1c24", border: "1px solid #2a2a3a", color: "#fff", borderRadius: "4px", padding: "5px", cursor: "pointer" }}
            title="Compare or Add Symbol"
          >
            ➕ Secondary
          </button>

          {/* Timeframe selector favorites */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#16161c", padding: "2px", borderRadius: "4px" }}>
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => updateActivePanel({ timeframe: tf })}
                style={{
                  background: activePanel.timeframe === tf ? "#2196F3" : "transparent",
                  border: "none",
                  borderRadius: "3px",
                  color: "#fff",
                  fontSize: "11px",
                  padding: "4px 8px",
                  cursor: "pointer"
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart visual types dropdown */}
          <select
            value={activePanel.chartType}
            onChange={(e) => updateActivePanel({ chartType: e.target.value })}
            style={{ background: "#1c1c24", color: "#fff", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "4px 8px", fontSize: "12px" }}
          >
            <option value="Standard Candlesticks">🕯 Candlesticks</option>
            <option value="Heikin-Ashi">📊 Heikin-Ashi</option>
            <option value="Renko">🧱 Renko Bricks</option>
            <option value="Kagi">📈 Kagi Lines</option>
            <option value="Volume Footprint">🐾 Volume Footprint</option>
          </select>

          {/* Indicators Library fx */}
          <button
            onClick={() => setIndicatorModalOpen(true)}
            style={{
              background: "#1c1c24",
              border: "1px solid #2a2a3a",
              color: "#fff",
              borderRadius: "4px",
              padding: "5px 10px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <i>fx</i> Indicators
          </button>

          {/* Alert trigger creator button */}
          <button
            onClick={() => setAlertModalOpen(true)}
            style={{
              background: "rgba(255, 152, 0, 0.15)",
              border: "1px solid #FF9800",
              color: "#FF9800",
              borderRadius: "4px",
              padding: "5px 10px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            ⏰ Create Alert
          </button>

          {/* Bar Replay Toggle */}
          <button
            onClick={() => {
              setReplayMode(!replayMode);
              if (!replayMode) {
                setReplayIndex(Math.floor(bars.length * 0.7));
              }
            }}
            style={{
              background: replayMode ? "#FF9800" : "#1c1c24",
              border: "1px solid #2a2a3a",
              color: "#fff",
              borderRadius: "4px",
              padding: "5px 10px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            ⏪ Bar Replay
          </button>
        </div>

        {/* Right section elements */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Multi chart pane selector splitter */}
          <select
            value={multiSplitLevel}
            onChange={(e) => {
              const val = parseInt(e.target.value) as any;
              setMultiSplitLevel(val);
              // Set panels accordingly
              const panelsArr = Array.from({ length: val }).map((_, idx) => ({
                id: `p${idx + 1}`,
                type: "chart" as const,
                title: `${activePanel.symbol} Splitted ${idx + 1}`,
                w: 100,
                h: 100,
                x: 0,
                y: 0,
                symbol: activePanel.symbol,
                timeframe: activePanel.timeframe,
                chartType: activePanel.chartType,
                drawings: [],
                indicators: [],
                zoomLevel: 100
              }));
              setWorkspace({ ...workspace, panels: panelsArr });
            }}
            style={{ background: "#1c1c24", color: "#fff", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "4px 8px", fontSize: "12px" }}
          >
            <option value="1">🖥 1 Chart Grid</option>
            <option value="2">🖥 2 Charts Split</option>
            <option value="4">🖥 4 Sync Matrix</option>
          </select>

          {/* Settings gear */}
          <button
            onClick={() => setSettingsOpen(true)}
            style={{ background: "#1c1c24", border: "1px solid #2a2a3a", color: "#fff", borderRadius: "4px", padding: "5px 10px", cursor: "pointer", fontSize: "12px" }}
          >
            ⚙ Settings
          </button>

          {/* One-click Order Execute blocks */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => alert(`Submitted Direct Limit BUY order at $${lastBar.close}`)}
              style={{ background: "#2196F3", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 10px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
            >
              BUY ${lastBar.close.toFixed(1)}
            </button>
            <button
              onClick={() => alert(`Submitted Direct Limit SELL order at $${lastBar.close}`)}
              style={{ background: "#F44336", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 10px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
            >
              SELL ${lastBar.close.toFixed(1)}
            </button>
          </div>
        </div>
      </div>

      {/* Main Core Layout: zones 2, 3, 4, 5 */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>

        {/* ------------------ ZONE 2: LEFT DRAWING TOOLBAR (52px) ------------------ */}
        <div style={{
          width: "52px",
          background: "#121218",
          borderRight: "1px solid #23232e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 0",
          boxSizing: "border-box",
          gap: "8px",
          overflowY: "auto"
        }}>
          {["Cursor", "Trendline", "Fibonacci Retracement", "Rectangle", "Text Box / Callout Box"].map((tool) => {
            const isActive = selectedTool === tool;
            return (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  background: isActive ? "rgba(33, 150, 243, 0.25)" : "transparent",
                  border: isActive ? "1px solid #2196F3" : "none",
                  color: isActive ? "#2196F3" : "#8a8f9d",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px"
                }}
                title={tool}
              >
                {tool === "Cursor" ? "🖱" : tool === "Trendline" ? "📏" : tool === "Fibonacci Retracement" ? "🧬" : tool === "Rectangle" ? "⬜" : "✍"}
              </button>
            );
          })}
          <div style={{ width: "20px", height: "1px", background: "#23232e" }} />
          <button
            onClick={() => setDrawings([])}
            style={{ background: "transparent", border: "none", color: "#F44336", fontSize: "14px", cursor: "pointer" }}
            title="Clear all drawing overlays"
          >
            🗑
          </button>
        </div>

        {/* Center Container comprising central main viewport & bottom drawer */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

          {/* ------------------ ZONE 3: MAIN CHART CANVAS VIEWPORT ------------------ */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {/* Playback Replay Controls Overlay block if active */}
            {replayMode && (
              <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 100 }}>
                <ReplayControls
                  isPlaying={replayMode}
                  onPlayToggle={() => setReplayMode(!replayMode)}
                  onStepForward={() => setReplayIndex(prev => Math.min(bars.length - 1, prev + 1))}
                  speed={replaySpeed}
                  onSpeedChange={setReplaySpeed}
                  onExit={() => setReplayMode(false)}
                />
              </div>
            )}

            <ChartContainer
              bars={visibleBars}
              activeIndicators={activePanel.indicators}
              theme={themeColors}
              selectedTool={selectedTool}
              drawings={drawings}
              onDrawingsChange={setDrawings}
              symbol={activePanel.symbol}
              timeframe={activePanel.timeframe}
            />
          </div>

          {/* ------------------ ZONE 5: BOTTOM PANEL DRAWER (Collapsible/Resizable) ------------------ */}
          <div style={{
            height: bottomDrawerCollapsed ? "36px" : "300px",
            borderTop: "1px solid #23232e",
            background: "#121218",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            {/* Tab header bar */}
            <div style={{
              height: "36px",
              background: "#16161c",
              borderBottom: "1px solid #23232e",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px"
            }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => { setBottomDrawerCollapsed(false); setBottomTab("screener"); }}
                  style={{ background: "transparent", border: "none", borderBottom: bottomTab === "screener" && !bottomDrawerCollapsed ? "2px solid #2196F3" : "none", color: bottomTab === "screener" ? "#fff" : "#8a8f9d", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}
                >
                  📈 Asset Screener
                </button>
                <button
                  onClick={() => { setBottomDrawerCollapsed(false); setBottomTab("ide"); }}
                  style={{ background: "transparent", border: "none", borderBottom: bottomTab === "ide" && !bottomDrawerCollapsed ? "2px solid #2196F3" : "none", color: bottomTab === "ide" ? "#fff" : "#8a8f9d", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}
                >
                  💻 Pine Script IDE
                </button>
                <button
                  onClick={() => { setBottomDrawerCollapsed(false); setBottomTab("backtester"); }}
                  style={{ background: "transparent", border: "none", borderBottom: bottomTab === "backtester" && !bottomDrawerCollapsed ? "2px solid #2196F3" : "none", color: bottomTab === "backtester" ? "#fff" : "#8a8f9d", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}
                >
                  📊 Backtester
                </button>
                <button
                  onClick={() => { setBottomDrawerCollapsed(false); setBottomTab("trading"); }}
                  style={{ background: "transparent", border: "none", borderBottom: bottomTab === "trading" && !bottomDrawerCollapsed ? "2px solid #2196F3" : "none", color: bottomTab === "trading" ? "#fff" : "#8a8f9d", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}
                >
                  💼 Trading Panel
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setBottomDrawerCollapsed(!bottomDrawerCollapsed)}
                  style={{ background: "transparent", border: "none", color: "#8a8f9d", cursor: "pointer", fontSize: "12px" }}
                >
                  {bottomDrawerCollapsed ? "▲ Expand" : "▼ Collapse"}
                </button>
              </div>
            </div>

            {/* Inner bottom content renders if not collapsed */}
            {!bottomDrawerCollapsed && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {bottomTab === "screener" && (
                  <div style={{ padding: "16px", fontSize: "12px", fontFamily: "monospace" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ color: "#8a8f9d", borderBottom: "1px solid #23232e" }}>
                          <th style={{ padding: "8px" }}>Ticker</th>
                          <th style={{ padding: "8px" }}>Price</th>
                          <th style={{ padding: "8px" }}>Change</th>
                          <th style={{ padding: "8px" }}>RSI (14)</th>
                          <th style={{ padding: "8px" }}>Market Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #1c1c24" }}>
                          <td style={{ padding: "8px", fontWeight: "bold" }}>BTC/USDT</td>
                          <td style={{ padding: "8px" }}>$64,410.00</td>
                          <td style={{ padding: "8px", color: "#4CAF50" }}>+2.45%</td>
                          <td style={{ padding: "8px" }}>62.15</td>
                          <td style={{ padding: "8px" }}>$1.26T</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #1c1c24" }}>
                          <td style={{ padding: "8px", fontWeight: "bold" }}>ETH/USDT</td>
                          <td style={{ padding: "8px" }}>$3,440.00</td>
                          <td style={{ padding: "8px", color: "#F44336" }}>-0.85%</td>
                          <td style={{ padding: "8px" }}>45.80</td>
                          <td style={{ padding: "8px" }}>$412B</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {bottomTab === "ide" && (
                  <ScriptRunner onAddIndicatorToChart={handleAddIndicator} />
                )}

                {bottomTab === "backtester" && (
                  <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", fontSize: "12px", fontFamily: "monospace" }}>
                    <div style={{ background: "#16161c", padding: "12px", borderRadius: "4px" }}>
                      <span style={{ color: "#2196F3", fontWeight: "bold" }}>Backtest Summary Matrix</span>
                      <p>• Net Profit: $4,520.15</p>
                      <p>• Sharpe Ratio: 2.15</p>
                      <p>• Profit Factor: 1.82</p>
                      <p>• Max Drawdown: 4.5%</p>
                      <p>• Total Trades: 142</p>
                    </div>
                    <div style={{ background: "#16161c", padding: "12px", borderRadius: "4px" }}>
                      <span style={{ color: "#4CAF50", fontWeight: "bold" }}>Execution Trades List</span>
                      <p>• [10:14:15] BUY Entry LIMIT filled at $64,010.50</p>
                      <p>• [10:35:02] SELL Exit STOP LOSS triggered at $63,800.00</p>
                    </div>
                  </div>
                )}

                {bottomTab === "trading" && (
                  <div style={{ padding: "16px", fontSize: "12px", fontFamily: "monospace" }}>
                    <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
                      <span>Broker Status: <span style={{ color: "#4CAF50" }}>● Connected (Paper Trading Account)</span></span>
                      <span>Balance: $100,000.00</span>
                      <span>Equity: $100,240.50</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ color: "#8a8f9d", borderBottom: "1px solid #23232e" }}>
                          <th style={{ padding: "8px" }}>Symbol</th>
                          <th style={{ padding: "8px" }}>Size</th>
                          <th style={{ padding: "8px" }}>Entry Price</th>
                          <th style={{ padding: "8px" }}>Mark Price</th>
                          <th style={{ padding: "8px" }}>Unrealized PnL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: "8px", fontWeight: "bold" }}>BTC/USDT</td>
                          <td style={{ padding: "8px", color: "#4CAF50" }}>+1.50 BTC</td>
                          <td style={{ padding: "8px" }}>$64,020.00</td>
                          <td style={{ padding: "8px" }}>$64,410.00</td>
                          <td style={{ padding: "8px", color: "#4CAF50" }}>+$585.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ------------------ ZONE 4: RIGHT WIDGET DOCK (Collapsible 320px-380px) ------------------ */}
        <div style={{ display: "flex" }}>
          {/* Vertical Collapsible Icon column strip (40px) */}
          <div style={{
            width: "40px",
            background: "#121218",
            borderLeft: "1px solid #23232e",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px 0",
            gap: "12px",
            boxSizing: "border-box"
          }}>
            {[
              { id: "watchlist", label: "📋 Watchlist" },
              { id: "alerts", label: "⏰ Alerts" },
              { id: "objectTree", label: "🌳 Tree" },
              { id: "hotlists", label: "🔥 Hotlists" }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setRightPanel(rightPanel === item.id ? null : item.id as any)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "4px",
                  background: rightPanel === item.id ? "rgba(33, 150, 243, 0.25)" : "transparent",
                  border: "none",
                  color: rightPanel === item.id ? "#2196F3" : "#8a8f9d",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "0"
                }}
                title={item.label}
              >
                {item.id === "watchlist" ? "📋" : item.id === "alerts" ? "⏰" : item.id === "objectTree" ? "🌳" : "🔥"}
              </button>
            ))}
          </div>

          {/* Expandable panel Drawer */}
          {rightPanel && (
            <div style={{
              width: "320px",
              background: "#121218",
              borderLeft: "1px solid #23232e",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              {rightPanel === "watchlist" && (
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", height: "100%", overflowY: "auto" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#2196F3" }}>Crypto / Forex Watchlist</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {Object.entries(assets).map(([cat, list]) => (
                      <div key={cat}>
                        <div style={{ fontSize: "10px", color: "#8a8f9d", fontWeight: "bold", textTransform: "uppercase" }}>{cat}</div>
                        {list.map(sym => (
                          <div
                            key={sym}
                            onClick={() => updateActivePanel({ symbol: sym })}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "6px 8px",
                              cursor: "pointer",
                              borderRadius: "4px",
                              background: activePanel.symbol === sym ? "rgba(33, 150, 243, 0.1)" : "transparent"
                            }}
                          >
                            <span style={{ fontSize: "12px", color: "#fff" }}>{sym}</span>
                            <span style={{ fontSize: "11px", color: "#4CAF50" }}>$64,410.00</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rightPanel === "alerts" && (
                <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
                  <TriggerList
                    alerts={alerts}
                    onToggleAlert={(id) => setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a))}
                    onDeleteAlert={(id) => setAlerts(alerts.filter(a => a.id !== id))}
                    logs={alertLogs}
                    onClearLogs={() => setAlertLogs([])}
                  />
                </div>
              )}

              {rightPanel === "objectTree" && (
                <div style={{ padding: "16px", fontSize: "12px", fontFamily: "monospace" }}>
                  <span style={{ fontWeight: "bold", color: "#2196F3" }}>Object Tree Hierarchy</span>
                  <p style={{ margin: "10px 0 0 0" }}>🌲 Main Pane Drawings List:</p>
                  {drawings.map(d => (
                    <div key={d.id} style={{ padding: "4px 8px", background: "#1c1c24", borderRadius: "3px", marginTop: "4px" }}>
                      📏 {d.type} ({d.id.slice(0, 10)})
                    </div>
                  ))}
                </div>
              )}

              {rightPanel === "hotlists" && (
                <div style={{ padding: "16px", fontSize: "12px", fontFamily: "monospace" }}>
                  <span style={{ fontWeight: "bold", color: "#FF9800" }}>🔥 Institutional Volume Hotlists</span>
                  <p style={{ marginTop: "10px" }}>Gainers:</p>
                  <p style={{ color: "#4CAF50" }}>• BTC/USDT +2.45%</p>
                  <p style={{ color: "#4CAF50" }}>• SOL/USDT +8.15%</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ------------------ MODALS & DIALOGS ------------------ */}

      {/* Ticker Search Modal */}
      {searchModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSearchModalOpen(false)}>
          <div style={{ width: "400px", background: "#121218", border: "1px solid #32324a", borderRadius: "8px", padding: "16px" }} onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>Search Symbol Market Tickers</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
              {Object.entries(assets).map(([cat, list]) => (
                <div key={cat}>
                  <div style={{ fontSize: "10px", color: "#8a8f9d" }}>{cat}</div>
                  {list.map(sym => (
                    <button
                      key={sym}
                      onClick={() => {
                        updateActivePanel({ symbol: sym });
                        setSearchModalOpen(false);
                      }}
                      style={{ width: "100%", background: "#1c1c24", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", marginTop: "4px", textAlign: "left", cursor: "pointer" }}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicators Library Modal */}
      {indicatorModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setIndicatorModalOpen(false)}>
          <div style={{ width: "400px", background: "#121218", border: "1px solid #32324a", borderRadius: "8px", padding: "16px" }} onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>Overlaid indicators library</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px", maxHeight: "300px", overflowY: "auto" }}>
              {["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Bollinger Bands (BB)", "Relative Strength Index (RSI)"].map(ind => (
                <button
                  key={ind}
                  onClick={() => {
                    handleAddIndicator(ind);
                    setIndicatorModalOpen(false);
                  }}
                  style={{ width: "100%", background: "#1c1c24", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", textAlign: "left", cursor: "pointer" }}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alert Creation Dialog Modal */}
      {alertModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setAlertModalOpen(false)}>
          <div style={{ width: "350px", background: "#121218", border: "1px solid #32324a", borderRadius: "8px", padding: "16px" }} onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>Create price boundary alert</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
              <label style={{ fontSize: "11px", color: "#8a8f9d" }}>Target Price Threshold</label>
              <input
                type="number"
                defaultValue={lastBar.close.toFixed(1)}
                id="alertValInput"
                style={{ background: "#1c1c24", border: "1px solid #2a2a3a", padding: "6px", color: "#fff", borderRadius: "4px" }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById("alertValInput") as HTMLInputElement;
                  const priceVal = parseFloat(input?.value) || lastBar.close;
                  const newAlert: AlertRule = {
                    id: `alert-${Date.now()}`,
                    symbol: activePanel.symbol,
                    conditionType: "crossing_up",
                    value: priceVal,
                    message: `Price alert crossing at ${priceVal}`,
                    active: true,
                    createdAt: new Date().toISOString()
                  };
                  setAlerts([...alerts, newAlert]);
                  setAlertModalOpen(false);
                }}
                style={{ background: "#2196F3", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
              >
                Activate Trigger Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parameter Settings Gear Modal */}
      {settingsOpen && (
        <SettingsModal
          config={config}
          onConfigChange={setConfig}
          theme={themeColors}
          onThemeChange={setThemeColors}
          onClose={() => setSettingsOpen(false)}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onExport4KSnapshot={handleExport4KSnapshot}
        />
      )}

    </div>
  );
}

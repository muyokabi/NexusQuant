import { useState, useEffect, useCallback } from "react";
import { DrawingFactory, DrawingTool, Point } from "./components/chart/tools/drawing_manager";
import { DockLayout } from "./components/workspace/DockLayout";
import { CommandPalette } from "./components/workspace/Toolbar";
import { SettingsModal } from "./components/alerts/AlertModal";
import { loadSavedWorkspace, saveWorkspace, WorkspaceLayout } from "./state/chartStore";
import { loadSystemConfig, saveSystemConfig, SystemConfig } from "./state/configStore";
import { generateSyntheticBars, MarketBar } from "./utils/math";
import { drawChart21Types, ChartTheme } from "./components/chart/renderers/CandlestickRenderer";

export default function App() {
  // Command Palette & Global Keys state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Settings Modal state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Workspace & Persistence State
  const [workspace, setWorkspace] = useState<WorkspaceLayout>(() => loadSavedWorkspace());
  const [config, setConfig] = useState<SystemConfig>(() => loadSystemConfig());

  // Current selected workspace panel ID (to sync selection panels)
  const [selectedPanelId, setSelectedPanelId] = useState<string>("p1");

  // Chart rendering properties (synced for current active panel)
  const activePanel = workspace.panels.find(p => p.id === selectedPanelId) || workspace.panels[0];

  const [drawings, setDrawings] = useState<DrawingTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("Trendline");
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [draggedDrawing, setDraggedDrawing] = useState<{ id: string; nodeIndex: number } | null>(null);

  // Indicators list & query
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");

  // Canvas Reference with state trigger to ensure instant rendering updates
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (node !== null) {
      setCanvasNode(node);
    }
  }, []);

  // Execution stop loss / take profit lines
  const orderLines = [
    { id: "sl", price: 63800, type: "Stop Loss" as const },
    { id: "tp", price: 64900, type: "Take Profit" as const }
  ];

  // Notification status
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: "info" | "success" | "warn" }>>([
    { id: "init", msg: "NexusQuant Pro v1.0.0 Online", type: "success" }
  ]);

  // Synthetic Bars buffer
  const [bars, setBars] = useState<MarketBar[]>([]);

  // Selected theme colors matrix
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
    "1 Tick", "10 Ticks", "100 Ticks",
    "1s", "5s", "10s", "15s", "30s",
    "1m", "5m", "15m", "30m", "1h", "4h",
    "1D", "3D", "1W", "1M", "1Y",
    "10 Range", "100 Volume"
  ];

  // Deduplicated unique indicators
  const indicators_list = Array.from(new Set([
    "Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Weighted Moving Average (WMA)",
    "Double Exponential Moving Average (DEMA)", "Triple Exponential Moving Average (TEMA)",
    "Hull Moving Average (HMA)", "Volume Weighted Moving Average (VWMA)", "Volume Weighted Average Price (VWAP)",
    "Anchored VWAP", "Kaufman Adaptive Moving Average (KAMA)", "Arnaud Legoux Moving Average (ALMA)",
    "Zero Lag Exponential Moving Average (ZLEMA)", "Triangular Moving Average (TMA)", "Fractal Adaptive Moving Average (FRAMA)",
    "Variable Index Dynamic Average (VIDYA)", "Tillson Moving Average (T3)", "Guppy Multiple Moving Average (GMMA)",
    "Rainbow Moving Average", "Least Squares Moving Average (LSMA)", "Elastic Volume Weighted Moving Average (eVWMA)",
    "Displaced Moving Average (DMA)", "Sine Weighted Moving Average", "McGinley Dynamic Average",
    "Modular Filtered Moving Average", "Jurik Moving Average (JMA)", "Moving Average Ribbon",
    "Exponential Ribbon", "Weighted Ribbon", "Envelope Channel (SMA)", "Envelope Channel (EMA)",
    "Bollinger Bands (BB)", "Bollinger Bands Width", "Bollinger %B", "Keltner Channels", "Donchian Channels",
    "Keltner Channel Width", "Donchian Channel Width", "Fibonacci Bollinger Bands", "High Low Bands",
    "Moving Average Channel", "Regression Envelope", "Parabolic SAR (PSAR)", "Ichimoku Kinko Hyo",
    "Supertrend Indicator", "HalfTrend", "Range Filter", "Chande Kroll Stop", "Volatility Stop",
    "ATR Trailing Stop", "Swing High/Low Channel", "Relative Strength Index (RSI)", "Stochastic Oscillator (Fast)",
    "Stochastic Oscillator (Slow)", "Stochastic RSI (StochRSI)", "Moving Average Convergence Divergence (MACD)",
    "MACD Histogram", "Impulse MACD", "Percentage Price Oscillator (PPO)", "Absolute Price Oscillator (APO)",
    "Commodity Channel Index (CCI)", "Williams %R", "Awesome Oscillator (AO)", "Accelerator Oscillator (AC)",
    "Ultimate Oscillator", "Rate of Change (ROC)", "Momentum Indicator (MOM)", "Balance of Power (BOP)",
    "Center of Gravity (COG)", "Chande Momentum Oscillator (CMO)", "Detrended Price Oscillator (DPO)",
    "Fisher Transform", "Inverse Fisher Transform of RSI", "Inverse Fisher Transform of MFI",
    "Know Sure Thing (KST)", "Coppock Curve", "True Strength Index (TSI)", "Vortex Indicator (VI+ / VI-)",
    "Woodies CCI", "SMI Ergodic Indicator", "Elder Ray Index (Bull Power / Bear Power)", "Relative Vigor Index (RVI)",
    "Relative Volatility Index (RVI2)", "Dynamic Momentum Index (DMI)", "Connors RSI", "Laguerre RSI",
    "Pretty Good Oscillator (PGO)", "Psychological Line (PSY)", "QStick Indicator", "Schaff Trend Cycle (STC)",
    "Trend Trigger Factor (TTF)", "TSI Oscillator", "Ulcer Index", "Volatility Ratio", "Williams Accumulation/Distribution",
    "Z-Score Price Oscillator", "Directional Movement Index (DMI/ADX)", "Average Directional Index (ADX)",
    "Average Directional Movement Index Rating (ADXR)", "Quantitative Qualitative Estimation (QQE)",
    "QQE Mod", "QQE Signal", "Trend Intensity Index (TII)", "Squeeze Momentum Indicator (LazyBear)",
    "WaveTrend Oscillator (LazyBear)", "Cipher A / Cipher B Oscillator", "Correlation Coefficient Indicator",
    "Detrended Synthetic Price", "Empirical Mode Decomposition", "Hilbert Transform - Dominant Cycle Period",
    "Hilbert Transform - Dominant Cycle Phase", "Hilbert Transform - Phasor Components", "Hilbert Transform - Sine Wave",
    "Hilbert Transform - Trend vs Cycle Mode", "Mesa Adaptive Moving Average (MAMA/FAMA)", "Gaussian Filter Oscillator",
    "Smoothed Rate of Change", "Spearman Rank Correlation", "Stochastic Momentum Index (SMI)", "TRIX Oscillator",
    "Volatility Oscillator", "Chande Forecast Oscillator", "Polarized Fractal Efficiency (PFE)",
    "Regularized EMA Oscillator", "Vertical Horizontal Filter (VHF)", "Aroon Oscillator", "Aroon Up/Down",
    "Mass Index", "Choppiness Index (CHOP)", "Relative Momentum Index (RMI)", "Trend Continuation Factor (TCF)",
    "On-Balance Volume (OBV)", "Volume Accumulation/Distribution Line (A/D)", "Chaikin Money Flow (CMF)",
    "Chaikin Oscillator", "Money Flow Index (MFI)", "Volume Price Trend (VPT)", "Ease of Movement (EOM)",
    "Volume Oscillator", "Klinger Volume Oscillator (KVO)", "Volume Rate of Change (VROC)", "Force Index",
    "Negative Volume Index (NVI)", "Positive Volume Index (PVI)", "Volume Profile - Visible Range (VPVR)",
    "Volume Profile - Fixed Range (FRVP)", "Volume Profile - Session Volume (SVAP)", "Point of Control (POC) Line",
    "Value Area High (VAH) Line", "Value Area Low (VAL) Line", "Developing VWAP", "Cumulative Volume Delta (CVD)",
    "Delta Volume Histogram", "Volume Buy/Sell Pressure", "Net Volume", "Volume Weighted MACD",
    "Volume Weighted RSI", "Trade Count Indicator", "Average Trade Size", "Volume Spike Detector",
    "Anchored Volume Profile", "Session Volume Profile High/Low", "Market Facilitation Index (BW MFI)",
    "Volume Zone Oscillator (VZO)", "Intraday Intensity Index", "Price Volume Trend", "Trend Volume Index",
    "Weis Wave Volume", "Order Book Imbalance Ratio", "Bid-Ask Spread Indicator", "Large Orders Detector (Whale Tracker)",
    "Liquidation Heatmap Overlay", "Volume Climax Indicator", "Volume Spread Analysis (VSA) Bars", "Relative Volume (RVOL)",
    "RVOL Standard Deviation", "Time-Price Opportunity (TPO) Profile / Market Profile", "TPO Value Area",
    "Initial Balance Range (IB)", "Single Prints Detector", "Poor High / Poor Low Detector", "Open Interest (OI) Line",
    "Open Interest Delta", "Funding Rate Line", "Long/Short Ratio Indicator", "Taker Buy/Sell Volume Ratio",
    "Liquidations Delta", "Cumulative Delta Divergence", "Volume Momentum Indicator", "Volume Flow Indicator (VFI)",
    "Psychological Volume Index", "Average True Range (ATR)", "Normalized ATR (NATR)", "ATR Percentage",
    "Standard Deviation (StdDev)", "Variance", "Historical Volatility (HV)", "Chaikin Volatility",
    "Relative Volatility Index", "Volatility Ratio", "Donchian Volatility", "Ulcer Index", "Mass Index",
    "Choppiness Index", "Efficiency Ratio (Kaufman)", "Fractal Dimension Index (FDI)", "Hurst Exponent",
    "Parkinson Volatility", "Garman-Klass Volatility", "Yang-Zhang Volatility", "Rogers-Satchell Volatility",
    "Advance-Decline Line (ADL)", "Advance-Decline Ratio", "Advance-Decline Spread", "Arms Index (TRIN)",
    "McClellan Oscillator", "McClellan Summation Index", "New Highs-New Lows Index", "Percent Above Moving Average (20/50/200 SMA)",
    "High-Low Index", "Bullish Percent Index (BPI)", "Market Momentum Breadth", "VIX Volatility Index Overlay",
    "SKEW Index", "Put/Call Ratio Oscillator", "Gamma Exposure (GEX) Profile", "Delta Exposure (DEX) Profile",
    "Volatility Smile Curve", "Implied Volatility (IV) Rank", "IV Percentile", "IV vs HV Differential",
    "ATR Envelope", "Volatility Bands", "Standard Error Channels", "Standard Error Bands", "Linear Regression Slope",
    "Linear Regression Intercept", "Linear Regression R-Squared", "Pearson Correlation Coefficient",
    "Beta Indicator (vs SPX/BTC)", "Alpha Indicator", "Sharpe Ratio Rolling", "Sortino Ratio Rolling",
    "Maximum Drawdown Rolling", "Volatility Contraction Pattern (VCP) Detector", "Squeeze Indicator (TTM Squeeze)",
    "Squeeze Breakout Histogram", "Volatility Expansion Indicator", "Volatility Quality Index (VQI)",
    "Relative Volatility Preserving Filter", "Noise Ratio Indicator", "Order Block Detector (Bullish/Bearish)",
    "Breaker Block Detector", "Mitigation Block Detector", "Fair Value Gap (FVG) / Imbalance Detector",
    "Inversion Fair Value Gap (IFVG)", "BPR (Balanced Price Range)", "Liquidity Pool / Equal Highs & Lows (EQH/EQL)",
    "Buy Side Liquidity (BSL) Sweep Detector", "Sell Side Liquidity (SSL) Sweep Detector",
    "Market Structure Break (MSB) / Change of Character (ChoCh)", "Break of Structure (BOS)",
    "Strong/Weak Highs and Lows Marker", "Premium / Discount Zone Lines (0.5 Equilibrium)", "Optimal Trade Entry (OTE) Fib Retracement",
    "Dealing Range Detector", "Silver Bullet Time Windows Marker", "Killzones (London, New York, Asian Session Boxes)",
    "Daily Open Line", "Weekly Open Line", "Monthly Open Line", "Monday High / Low Lines", "Previous Day High / Low (PDH/PDL)",
    "Previous Week High / Low (PWH/PWL)", "Previous Month High / Low (PMH/PML)", "Midnight Open Line (00:00 EST)",
    "08:30 EST Open Line", "Judas Swing Detector", "Power of 3 (AMD: Accumulation, Manipulation, Distribution)",
    "Supply & Demand Zones (Auto-S&D)", "Supply & Demand Zone Strength Rating", "Supply & Demand Freshness Indicator",
    "Order Flow Imbalance Delta Boxes", "Institutional Climax Candle Marker", "Displacement Candle Highlighter",
    "Rejection Block Detector", "Vacuum Block Detector", "Propulsion Block Detector", "NWOG (New Week Opening Gap)",
    "NDOG (New Day Opening Gap)", "Macro Window Highlights", "Daily Bias Predictor", "Session Volume Delta Boxes",
    "IPDA Data Ranges (20/40/60 Lookback Lines)", "Standard Deviation Projections (Fib Extensions)",
    "Turtle Soup Sweep Indicator", "Stop Hunt Highlighter", "Institutional Order Flow Entry Drill (IOFED)",
    "Benchmark Ratio Index", "Liquidity Void Box", "Volume Imbalance Highlighter", "Opening Range Breakout (ORB 5m/15m/30m)",
    "Initial Balance Extension Levels", "Central Pivot Range (CPR)", "Standard Floor Pivots (P, R1-R5, S1-S5)",
    "Fibonacci Pivots", "Woodie Pivots", "Camarilla Pivots (H1-H6, L1-L6)", "Tom DeMark Pivots",
    "Auto Trendline Detector", "Trendline Breakout Alerts Indicator", "Auto ZigZag Pattern",
    "ZigZag High/Low Labels", "Gartley Pattern Detector", "Butterfly Pattern Detector", "Bat Pattern Detector",
    "Crab Pattern Detector", "Shark Pattern Detector", "Cypher Pattern Detector", "AB=CD Pattern Detector",
    "Three Drives Pattern", "Head and Shoulders / Inverse Head & Shoulders", "Double Top / Double Bottom Detector",
    "Triple Top / Bottom", "Rising Wedge / Falling Wedge Detector", "Bull Flag / Bear Flag Detector",
    "Pennant Pattern Detector", "Ascending / Descending Triangle Detector", "Symmetrical Triangle Detector",
    "Cup and Handle / Inverse Cup & Handle", "Rectangle Consolidation Pattern", "Candlestick Pattern - Doji",
    "Candlestick Pattern - Dragonfly Doji / Gravestone Doji", "Candlestick Pattern - Engulfing (Bullish/Bearish)",
    "Candlestick Pattern - Hammer / Inverted Hammer", "Candlestick Pattern - Hanging Man", "Candlestick Pattern - Shooting Star",
    "Candlestick Pattern - Morning Star / Evening Star", "Candlestick Pattern - Three White Soldiers / Three Black Crows",
    "Candlestick Pattern - Piercing Line / Dark Cloud Cover", "Candlestick Pattern - Harami (Bullish/Bearish)",
    "Candlestick Pattern - Tweezer Tops / Tweezer Bottoms", "Candlestick Pattern - Marubozu", "Candlestick Pattern - Spinner Top",
    "Candlestick Pattern - Three Inside Up/Down", "Candlestick Pattern - Three Outside Up/Down", "Candlestick Pattern - Kicker",
    "Candlestick Pattern - Belt Hold", "Candlestick Pattern - Abandoned Baby", "Elliott Wave Auto Count (Waves 1-5, A-C)",
    "Wolfe Waves Pattern Detector", "Wyckoff Accumulation Schematic Overlay", "Wyckoff Distribution Schematic Overlay",
    "Spring / Upthrust Detector (Wyckoff)", "Sine Wave Cycle Indicator", "Ehlers Fisher Transform Pattern",
    "Dominant Cycle Frequency Indicator", "Trend Channel Pattern", "Andrews Pitchfork Auto Detector",
    "Schiff Pitchfork Auto Detector", "Modified Schiff Pitchfork Auto Detector", "Hurst Cycle Exponent",
    "Fast Fourier Transform (FFT) Spectral Density", "Autocorrelation Function Oscillator", "Kalman Filter Price Predictor",
    "Particle Filter Trend Predictor", "Markov Switching Regime Detector", "Hidden Markov Model Volatility State",
    "Machine Learning K-Means Price Clustering", "Support Vector Machine (SVM) Trend Classifier", "Decision Tree Pattern Detector",
    "Neural Network Price Projection", "Fractional Brownian Motion Model", "Monte Carlo Price Path Simulator",
    "Kernel Density Estimation (KDE) Price Nodes", "Entropy Indicator (Shannon Entropy)", "Cross-Entropy Trend Oscillator",
    "Algorithmic Liquidity Density Map", "Order Book Depth Delta", "Trade Size Distribution Histogram",
    "High-Frequency Quote Momentum", "Market Impact Estimator", "Price Slippage Forecast", "Spread Expansion Oscillator",
    "Order Flow Toxicity Index (VPIN)", "Information Share Index", "Lead-Lag Cross Correlation", "Coinintegration Vector Indicator (Pairs Trading)",
    "Half-Life Mean Reversion Indicator", "Augmented Dickey-Fuller Test Statistic", "Johansen Test Rank Indicator",
    "Z-Score Spread Line", "Optimal Hedge Ratio Indicator", "Kalman Filter Spread Tracker", "Dynamic Time Warping Pattern Matcher",
    "Wavelet Transform Noise Reduction Line", "Singular Spectrum Analysis (SSA) Trend Line", "Principal Component Analysis (PCA) Market Factor",
    "Copula Dependence Indicator", "Value at Risk (VaR) Rolling Exposure", "Expected Shortfall (CVaR) Line",
    "Tail Risk Indicator", "Systemic Risk Beta", "Market Microstructure Noise Estimator", "Tick Rule Buy/Sell Classifier",
    "Lee-Ready Trade Classifier"
  ]));

  const drawing_tools = [
    "Trendline", "Ray", "Info Line", "Extended Line", "Trend Angle", "Horizontal Line", "Horizontal Ray", "Vertical Line", "Cross Line", "Parallel Channel", "Disjoint Channel", "Flat Top/Bottom Channel",
    "Fibonacci Retracement", "Trend-Based Fibonacci Extension", "Fibonacci Channel", "Fibonacci Time Zones", "Fibonacci Speed Resistance Fan", "Fibonacci Circles", "Fibonacci Spiral", "Fibonacci Wedge", "Gann Box", "Gann Fan", "Gann Square Fixed", "Pitchfan",
    "Rectangle", "Rotated Rectangle", "Circle / Ellipse", "Triangle", "Polyline / Polygon", "Path Tool", "Curve", "Arc", "Text Box / Callout Box", "Anchored Note",
    "Andrews' Pitchfork", "Schiff Pitchfork", "Modified Schiff Pitchfork", "Inside Pitchfork", "XABCD Pattern", "ABCD Pattern", "Cypher Pattern Tool", "Head and Shoulders Pattern Tool",
    "Long Position", "Short Position", "Forecast", "Date and Price Range", "Price Range", "Date Range", "Bars Pattern Tool", "Fixed Range Volume Profile Box"
  ];

  // Sync state modifications & local persistence updates
  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  useEffect(() => {
    saveSystemConfig(config);
  }, [config]);

  // Handle auto-updates indicator
  const handleHotUpdate = () => {
    setConfig({ ...config, updateStatus: "applied" });
    const toastId = `upd-${Date.now()}`;
    setToasts([...toasts, { id: toastId, msg: "Silent hot-update successfully finalized. Session retained.", type: "success" }]);
  };

  // Keyboard navigation & Quick hotkeys
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, []);

  // Hotkey navigation helper mapping command palette results
  const handleSelectAction = (type: "asset" | "timeframe" | "indicator" | "setting", value: string) => {
    if (type === "asset") {
      updateActivePanel({ symbol: value, title: `${value} Focus` });
    } else if (type === "timeframe") {
      updateActivePanel({ timeframe: value });
    } else if (type === "indicator") {
      setSelectedIndicator(value);
    } else if (type === "setting") {
      if (value.startsWith("theme-")) {
        const selectedTheme = value.replace("theme-", "") as any;
        setConfig(prev => ({ ...prev, theme: selectedTheme }));
      } else if (value.startsWith("fps-")) {
        const val = value.replace("fps-", "");
        const fpsVal = val === "unlimited" ? "unlimited" : parseInt(val);
        setConfig(prev => ({ ...prev, fpsCap: fpsVal as any }));
      } else if (value === "export-json") {
        handleExportJson();
      } else if (value === "import-json") {
        handleImportJson();
      }
    }
  };

  // Update a single field inside active panel
  const updateActivePanel = (updates: Partial<WorkspaceLayout["panels"][0]>) => {
    const updatedPanels = workspace.panels.map((p) => {
      if (p.id === selectedPanelId) {
        return { ...p, ...updates };
      }
      return p;
    });
    setWorkspace({ ...workspace, panels: updatedPanels });
  };

  // Populate dynamic synthetic bars
  useEffect(() => {
    const synthetic = generateSyntheticBars(activePanel.symbol, activePanel.timeframe, 120);
    setBars(synthetic);
  }, [activePanel.symbol, activePanel.timeframe]);

  // Re-render chart onto main viewport canvas (proper dependencies tracking)
  useEffect(() => {
    if (!canvasNode || bars.length === 0) return;
    const ctx = canvasNode.getContext("2d");
    if (!ctx) return;

    // Direct draw
    drawChart21Types(
      ctx,
      activePanel.chartType,
      bars,
      themeColors,
      canvasNode.width,
      canvasNode.height,
      activePanel.zoomLevel || 100,
      orderLines,
      142.50
    );

    // Draw active drawing overlays
    drawings.forEach((drawing) => {
      drawing.render(ctx);
    });

    // Drawing preview line
    if (currentPoints.length > 0) {
      ctx.strokeStyle = "rgba(33, 150, 243, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [canvasNode, bars, activePanel.chartType, activePanel.zoomLevel, themeColors, drawings, currentPoints, orderLines]);

  // Canvas Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasNode) return;
    const rect = canvasNode.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickPoint = { x, y };

    // 1. Check if clicking on an existing drawing handle node to drag
    for (let d of drawings) {
      for (let i = 0; i < d.points.length; i++) {
        if (Math.abs(d.points[i].x - x) < 8 && Math.abs(d.points[i].y - y) < 8) {
          setDraggedDrawing({ id: d.id, nodeIndex: i });
          return;
        }
      }
    }

    // 2. Select / Deselect drawing on hit-testing
    const ctx = canvasNode.getContext("2d");
    if (ctx) {
      let hit = false;
      const updated = drawings.map((d) => {
        const contains = d.containsPoint(clickPoint, ctx);
        if (contains) hit = true;
        return { ...d, selected: contains };
      });
      if (hit) {
        setDrawings(updated);
        return;
      }
    }

    // 3. Otherwise, initiate new drawing points placement
    const nextPoints = [...currentPoints, clickPoint];
    const requiredPoints = ["triangle", "polyline / polygon", "andrews' pitchfork", "schiff pitchfork", "modified schiff pitchfork", "inside pitchfork", "xabcd pattern", "abcd pattern", "cypher pattern tool", "head and shoulders pattern tool"].includes(selectedTool.toLowerCase()) ? 3 : 2;

    if (nextPoints.length >= requiredPoints) {
      const newId = `${selectedTool}-${Date.now()}`;
      const newDrawing = DrawingFactory.create(newId, selectedTool, nextPoints);
      setDrawings([...drawings, newDrawing]);
      setCurrentPoints([]);
    } else {
      setCurrentPoints(nextPoints);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedDrawing) {
      if (!canvasNode) return;
      const rect = canvasNode.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const updated = drawings.map((d) => {
        if (d.id === draggedDrawing.id) {
          const cloned = d.clone();
          cloned.dragNode(draggedDrawing.nodeIndex, { x, y });
          return cloned;
        }
        return d;
      });
      setDrawings(updated);
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedDrawing(null);
  };

  const clearAllDrawings = () => {
    setDrawings([]);
    setCurrentPoints([]);
  };

  const deleteSelected = () => {
    setDrawings(drawings.filter(d => !d.selected));
  };

  // Export templates raw JSON
  const handleExportJson = () => {
    const raw = JSON.stringify({ workspace, config }, null, 2);
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexusquant-layout-${Date.now()}.json`;
    a.click();
    setToasts([...toasts, { id: `exp-${Date.now()}`, msg: "Workspace JSON template successfully exported.", type: "success" }]);
  };

  // Import templates raw JSON
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
          setToasts([...toasts, { id: `imp-${Date.now()}`, msg: "Workspace configuration successfully imported.", type: "success" }]);
        } catch (err) {
          setToasts([...toasts, { id: `imp-err-${Date.now()}`, msg: "Invalid JSON configuration structure.", type: "warn" }]);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 4K Ultra Screenshot Generator
  const handleExport4KSnapshot = () => {
    if (!canvasNode) return;

    // Create offscreen high resolution 4K canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = 3840;
    offscreen.height = 2160;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    // Draw high definition output
    drawChart21Types(
      offCtx,
      activePanel.chartType,
      bars,
      themeColors,
      3840,
      2160,
      activePanel.zoomLevel || 100,
      orderLines,
      142.50
    );

    // Save and download PNG
    const url = offscreen.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexusquant-pro-4k-${Date.now()}.png`;
    a.click();
    setToasts([...toasts, { id: `snap-${Date.now()}`, msg: "4K ultra snapshot exported to downloads folder.", type: "success" }]);
  };

  const filteredIndicators = indicators_list.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render content of workspace sub-panes
  const renderPanelContent = (panel: WorkspaceLayout["panels"][0]) => {
    const isMainChart = panel.id === selectedPanelId;

    if (panel.type === "watchlist") {
      return (
        <div style={{ padding: "16px", background: "#121218", height: "100%", overflowY: "auto" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#d1d4dc", fontSize: "12px", borderBottom: "1px solid #23232e", paddingBottom: "6px" }}>Institutional Tracker</h4>
          {Object.entries(assets).map(([cat, list]) => (
            <div key={cat} style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "10px", color: "#8a8f9d", fontWeight: "bold", textTransform: "uppercase" }}>{cat}</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                {list.map(sym => (
                  <button
                    key={sym}
                    onClick={() => updateActivePanel({ symbol: sym })}
                    style={{
                      background: activePanel.symbol === sym ? "#2196F3" : "#1c1c24",
                      color: "#fff",
                      border: "1px solid #23232e",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (panel.type === "news") {
      return (
        <div style={{ padding: "16px", background: "#121218", height: "100%", overflowY: "auto", fontFamily: "monospace", fontSize: "11px", color: "#aaa" }}>
          <div style={{ color: "#FF9800", fontWeight: "bold", marginBottom: "10px" }}>⚡ REALTIME MARKET SQUAWK FEED</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p>• [10:14:02 UTC] FED BOSTIC SAYS INFLATION CONTINUES STEADY DECREASE</p>
            <p>• [10:11:45 UTC] LARGE BTC OPTION MATURITY DETECTED AT $65,000 BLOCK</p>
            <p>• [10:07:11 UTC] ECB LAGARDE HINTS AT MACRO RATES STABILITY FORECAST</p>
          </div>
        </div>
      );
    }

    if (panel.type === "orderbook" || panel.type === "scanner") {
      return (
        <div style={{ padding: "16px", background: "#121218", height: "100%", overflowY: "auto", fontFamily: "monospace", fontSize: "11px", color: "#aaa" }}>
          <div style={{ color: "#4CAF50", fontWeight: "bold", marginBottom: "10px" }}>📋 LEVEL-3 DEPTH ENGINE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div>
              <div style={{ color: "#F44336", fontWeight: "bold" }}>ASKS (SELLS)</div>
              <p>$64,980.50 - 42.15 BTC</p>
              <p>$64,950.00 - 15.80 BTC</p>
              <p>$64,910.00 - 122.3 BTC</p>
            </div>
            <div>
              <div style={{ color: "#4CAF50", fontWeight: "bold" }}>BIDS (BUYS)</div>
              <p>$63,850.50 - 18.25 BTC</p>
              <p>$63,800.00 - 95.10 BTC</p>
              <p>$63,720.00 - 201.4 BTC</p>
            </div>
          </div>
        </div>
      );
    }

    // Default main charting workspace
    return (
      <div
        style={{ display: "flex", height: "100%", overflow: "hidden" }}
        onClick={() => setSelectedPanelId(panel.id)}
      >
        {/* Main Chart Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#121218", position: "relative" }}>
          {/* Controls toolbar bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 12px",
            background: "#16161c",
            borderBottom: "1px solid #23232e"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Asset Selection */}
              <select
                value={panel.symbol}
                onChange={(e) => updateActivePanel({ symbol: e.target.value })}
                style={{ background: "#1c1c24", color: "#fff", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "4px 8px", fontSize: "12px" }}
              >
                {Object.entries(assets).map(([cat, list]) => (
                  <optgroup label={cat} key={cat}>
                    {list.map(sym => <option value={sym} key={sym}>{sym}</option>)}
                  </optgroup>
                ))}
              </select>

              {/* Chart Visualizer Type dropdown */}
              <select
                value={panel.chartType}
                onChange={(e) => updateActivePanel({ chartType: e.target.value })}
                style={{ background: "#1c1c24", color: "#fff", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "4px 8px", fontSize: "12px" }}
              >
                {[
                  "Standard Candlesticks", "Hollow Candlesticks", "Volume Candlesticks", "Heikin-Ashi", "Renko", "Kagi", "Point & Figure", "Line Break",
                  "Classic Line", "Line with Markers", "Step Line", "Standard Area", "HLC Area", "Baseline", "Bar Chart", "High-Low Bars",
                  "Range Bars", "Columns Chart", "Volume Footprint", "Time Price Opportunity", "Session Volume Profile"
                ].map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>

              {/* Dynamic Zoom level control */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  onClick={() => updateActivePanel({ zoomLevel: Math.max(30, (panel.zoomLevel || 100) - 10) })}
                  style={{ background: "#1c1c24", border: "1px solid #23232e", borderRadius: "4px", color: "#fff", padding: "2px 8px", cursor: "pointer" }}
                >
                  -
                </button>
                <span style={{ fontSize: "11px", color: "#8a8f9d" }}>Zoom: {panel.zoomLevel || 100}%</span>
                <button
                  onClick={() => updateActivePanel({ zoomLevel: Math.min(200, (panel.zoomLevel || 100) + 10) })}
                  style={{ background: "#1c1c24", border: "1px solid #23232e", borderRadius: "4px", color: "#fff", padding: "2px 8px", cursor: "pointer" }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={clearAllDrawings}
                style={{ background: "#f44336", border: "none", borderRadius: "4px", color: "#fff", padding: "4px 10px", fontSize: "11px", cursor: "pointer" }}
              >
                Clear Vector Overlays
              </button>
              <button
                onClick={deleteSelected}
                style={{ background: "#ff9800", border: "none", borderRadius: "4px", color: "#fff", padding: "4px 10px", fontSize: "11px", cursor: "pointer" }}
              >
                Delete Selected
              </button>
            </div>
          </div>

          {/* Actual Canvas */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <canvas
              ref={isMainChart ? canvasRef : null}
              width={750}
              height={450}
              onMouseDown={isMainChart ? handleCanvasMouseDown : undefined}
              onMouseMove={isMainChart ? handleCanvasMouseMove : undefined}
              onMouseUp={isMainChart ? handleCanvasMouseUp : undefined}
              style={{
                border: "1px solid #23232e",
                borderRadius: "6px",
                cursor: "crosshair",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
              }}
            />
          </div>
        </div>

        {/* Sidebar Controls (Renders if Main viewport selection is active) */}
        {isMainChart && (
          <div style={{ width: "240px", borderLeft: "1px solid #23232e", background: "#16161c", display: "flex", flexDirection: "column" }}>
            {/* Dynamic Interactive Drawing vectors lists */}
            <div style={{ padding: "10px", borderBottom: "1px solid #23232e" }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "#2196F3" }}>Vector suite ({drawing_tools.length})</span>
              <div style={{ maxHeight: "150px", overflowY: "auto", marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {drawing_tools.map((dt) => (
                  <button
                    key={dt}
                    onClick={() => setSelectedTool(dt)}
                    style={{
                      textAlign: "left",
                      background: selectedTool === dt ? "rgba(33, 150, 243, 0.15)" : "transparent",
                      color: selectedTool === dt ? "#2196F3" : "#d1d4dc",
                      border: "none",
                      borderRadius: "3px",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "11px"
                    }}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicator Select and Search Panel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "10px", borderBottom: "1px solid #23232e" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>Modular Indicator Overlay</span>
                <input
                  type="text"
                  placeholder="Search 405 indicators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "90%",
                    marginTop: "6px",
                    background: "#0c0c10",
                    border: "1px solid #2a2a3a",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    color: "#fff",
                    fontSize: "11px"
                  }}
                />
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {filteredIndicators.map((ind) => (
                  <div
                    key={ind}
                    onClick={() => setSelectedIndicator(ind)}
                    style={{
                      padding: "6px 8px",
                      cursor: "pointer",
                      borderRadius: "3px",
                      background: selectedIndicator === ind ? "rgba(224, 64, 251, 0.15)" : "transparent",
                      color: selectedIndicator === ind ? "#E040FB" : "#8a8f9d",
                      fontSize: "11px"
                    }}
                  >
                    {ind}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#0c0c10",
      color: "#ffffff",
      fontFamily: "Inter, sans-serif"
    }}>
      {/* Top Application header strip */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px",
        background: "#121218",
        borderBottom: "1px solid #23232e"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "#2196F3", letterSpacing: "1.5px" }}>
            NEXUSQUANT PRO
          </span>

          <span style={{ fontSize: "11px", color: "#8a8f9d" }}>
            CMD PALETTE: <kbd style={{ background: "#1c1c24", padding: "2px 4px", borderRadius: "3px" }}>Cmd+K</kbd> or <kbd style={{ background: "#1c1c24", padding: "2px 4px", borderRadius: "3px" }}>Ctrl+K</kbd>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Integrated Update toast block */}
          {config.updateStatus === "ready" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(76, 175, 80, 0.15)", padding: "4px 10px", borderRadius: "4px", border: "1px solid #4CAF50" }}>
              <span style={{ fontSize: "11px", color: "#4CAF50" }}>Silent Auto-Update ready.</span>
              <button
                onClick={handleHotUpdate}
                style={{ background: "#4CAF50", color: "#fff", border: "none", borderRadius: "3px", padding: "2px 6px", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }}
              >
                Hot Reload
              </button>
            </div>
          )}

          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              background: "#1c1c24",
              border: "1px solid #2a2a3a",
              borderRadius: "4px",
              color: "#d1d4dc",
              padding: "5px 12px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            ⚙ Terminal Parameters
          </button>
        </div>
      </header>

      {/* Main Docking Layout skeleton workspace */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <DockLayout
          layout={workspace}
          onLayoutChange={setWorkspace}
          renderPanelContent={renderPanelContent}
        />
      </div>

      {/* Global Command Palette search dialog */}
      {commandPaletteOpen && (
        <CommandPalette
          onSelectAction={handleSelectAction}
          onClose={() => setCommandPaletteOpen(false)}
          assets={assets}
          timeframes={timeframes}
          indicators={indicators_list}
        />
      )}

      {/* Settings management modal */}
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

      {/* Notifications system toasts bar overlay */}
      <div style={{ position: "fixed", bottom: "15px", right: "15px", display: "flex", flexDirection: "column", gap: "6px", zIndex: 10005 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#12121a",
              borderLeft: t.type === "success" ? "4px solid #4CAF50" : t.type === "warn" ? "4px solid #FF9800" : "4px solid #2196F3",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "4px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px"
            }}
          >
            <span>{t.msg}</span>
            <span
              onClick={() => setToasts(toasts.filter(x => x.id !== t.id))}
              style={{ cursor: "pointer", color: "#8a8f9d", fontWeight: "bold" }}
            >
              ×
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { DrawingFactory, DrawingTool, Point } from "./components/chart/tools/drawing_manager";

export default function App() {
  const [selectedTool, setSelectedTool] = useState<string>("trendline");
  const [activeTimeframe, setActiveTimeframe] = useState<string>("1D");
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC/USDT");
  const [drawings, setDrawings] = useState<DrawingTool[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [draggedDrawing, setDraggedDragged] = useState<{ id: string; nodeIndex: number } | null>(null);

  // Core market assets
  const assets = {
    Forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"],
    Crypto: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"],
    Indices: ["SPX", "NDX", "DJI", "GOLD", "USOIL"],
    Stocks: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"]
  };

  // Timeframes list
  const timeframes = [
    "1 Tick", "10 Ticks", "100 Ticks",
    "1s", "5s", "10s", "15s", "30s",
    "1m", "5m", "15m", "30m", "1h", "4h",
    "1D", "3D", "1W", "1M", "1Y",
    "10 Range", "100 Volume"
  ];

  // 405 indicator titles for selection modal/search
  const indicators_list = [
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
    "Triple Top / Triple Bottom", "Rising Wedge / Falling Wedge Detector", "Bull Flag / Bear Flag Detector",
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
  ];

  // 50 drawing tools categorized list
  const drawing_tools = [
    // Lines & Rays
    "Trendline", "Ray", "Info Line", "Extended Line", "Trend Angle", "Horizontal Line", "Horizontal Ray", "Vertical Line", "Cross Line", "Parallel Channel", "Disjoint Channel", "Flat Top/Bottom Channel",
    // Fibonacci & Gann
    "Fibonacci Retracement", "Trend-Based Fibonacci Extension", "Fibonacci Channel", "Fibonacci Time Zones", "Fibonacci Speed Resistance Fan", "Fibonacci Circles", "Fibonacci Spiral", "Fibonacci Wedge", "Gann Box", "Gann Fan", "Gann Square Fixed", "Pitchfan",
    // Geometric Shapes
    "Rectangle", "Rotated Rectangle", "Circle / Ellipse", "Triangle", "Polyline / Polygon", "Path Tool", "Curve", "Arc", "Text Box / Callout Box", "Anchored Note",
    // Pitchforks
    "Andrews' Pitchfork", "Schiff Pitchfork", "Modified Schiff Pitchfork", "Inside Pitchfork", "XABCD Pattern", "ABCD Pattern", "Cypher Pattern Tool", "Head and Shoulders Pattern Tool",
    // Projections
    "Long Position", "Short Position", "Forecast", "Date and Price Range", "Price Range", "Date Range", "Bars Pattern Tool", "Fixed Range Volume Profile Box"
  ];

  // Render the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render grid lines
    ctx.strokeStyle = "#2d2d2d";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw Mock Candlestick Chart (TradingView style)
    const mockCloses = [300, 310, 280, 295, 340, 360, 320, 350, 380, 410, 390, 420];
    mockCloses.forEach((close, index) => {
      const x = 50 + index * 60;
      const open = mockCloses[index - 1] || 310;
      const high = Math.max(open, close) + 20;
      const low = Math.min(open, close) - 15;
      const green = close >= open;

      ctx.strokeStyle = green ? "#4CAF50" : "#F44336";
      ctx.fillStyle = green ? "#4CAF50" : "#F44336";
      ctx.lineWidth = 2;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x + 15, high);
      ctx.lineTo(x + 15, low);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.rect(x, Math.min(open, close), 30, Math.abs(close - open) || 4);
      ctx.fill();
    });

    // Render selected indicator line
    if (selectedIndicator) {
      ctx.strokeStyle = "#E040FB";
      ctx.lineWidth = 3;
      ctx.beginPath();
      mockCloses.forEach((val, idx) => {
        const x = 50 + idx * 60 + 15;
        const y = val - 40; // Simulate shifted moving average overlay
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Indicator: ${selectedIndicator} Active`, 20, 30);
    }

    // Render active drawing tools
    drawings.forEach((drawing) => {
      drawing.render(ctx);
    });

    // Render preview points of current drawing
    if (currentPoints.length > 0) {
      ctx.strokeStyle = "rgba(33, 150, 243, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [drawings, currentPoints, selectedIndicator]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickPoint = { x, y };

    // 1. Check if clicking on an existing drawing handle node to drag
    for (let d of drawings) {
      for (let i = 0; i < d.points.length; i++) {
        if (Math.abs(d.points[i].x - x) < 8 && Math.abs(d.points[i].y - y) < 8) {
          setDraggedDragged({ id: d.id, nodeIndex: i });
          return;
        }
      }
    }

    // 2. Select / Deselect drawing on hit-testing
    const ctx = canvas.getContext("2d");
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

    // Check if tool is complete (mostly 2 points is sufficient for lines/rectangles/circles)
    const requiredPoints = ["triangle", "polyline / polygon", "andrews' pitchfork", "schiff pitchfork", "modified schiff pitchfork", "inside pitchfork", "xabcd pattern", "cypher pattern tool", "head and shoulders pattern tool"].includes(selectedTool.toLowerCase()) ? 3 : 2;

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
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const updated = drawings.map((d) => {
        if (d.id === draggedDrawing.id) {
          d.dragNode(draggedDrawing.nodeIndex, { x, y });
        }
        return d;
      });
      setDrawings(updated);
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedDragged(null);
  };

  const clearAllDrawings = () => {
    setDrawings([]);
    setCurrentPoints([]);
  };

  const deleteSelected = () => {
    setDrawings(drawings.filter(d => !d.selected));
  };

  const filteredIndicators = indicators_list.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#121212", color: "#ffffff" }}>
      {/* Top Header bar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #2d2d2d", background: "#1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2196F3" }}>NexusQuant Pro</span>

          {/* Asset Class dropdown */}
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            style={{ background: "#2a2a2a", color: "#ffffff", border: "1px solid #444", borderRadius: "4px", padding: "4px 8px" }}
          >
            {Object.entries(assets).map(([cat, list]) => (
              <optgroup label={cat} key={cat}>
                {list.map(sym => <option value={sym} key={sym}>{sym}</option>)}
              </optgroup>
            ))}
          </select>

          {/* Timeframes bar */}
          <div style={{ display: "flex", gap: "5px" }}>
            {timeframes.slice(0, 10).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                style={{
                  background: activeTimeframe === tf ? "#2196F3" : "#2a2a2a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={clearAllDrawings}
            style={{ marginRight: "10px", background: "#f44336", border: "none", borderRadius: "4px", color: "#fff", padding: "6px 12px", cursor: "pointer" }}
          >
            Clear Canvas
          </button>
          <button
            onClick={deleteSelected}
            style={{ background: "#ff9800", border: "none", borderRadius: "4px", color: "#fff", padding: "6px 12px", cursor: "pointer" }}
          >
            Delete Selected
          </button>
        </div>
      </header>

      {/* Main Workspace section */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Toolbar - 50 Canvas Drawing Tools selector */}
        <aside style={{ width: "240px", borderRight: "1px solid #2d2d2d", background: "#1a1a1a", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px", fontSize: "14px", fontWeight: "bold", borderBottom: "1px solid #2d2d2d" }}>
            Drawing Tools ({drawing_tools.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {drawing_tools.map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                style={{
                  textAlign: "left",
                  background: selectedTool === tool ? "rgba(33, 150, 243, 0.2)" : "transparent",
                  color: selectedTool === tool ? "#2196F3" : "#ccc",
                  border: selectedTool === tool ? "1px solid #2196F3" : "none",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                {tool}
              </button>
            ))}
          </div>
        </aside>

        {/* Center Main Charting Panel */}
        <main style={{ flex: 1, position: "relative", background: "#121212", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <canvas
            ref={canvasRef}
            width={850}
            height={550}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{ border: "1px solid #2d2d2d", borderRadius: "8px", cursor: "crosshair", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          />
        </main>

        {/* Right Sidebar - 405 Indicators selector & search */}
        <aside style={{ width: "280px", borderLeft: "1px solid #2d2d2d", background: "#1a1a1a", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px", borderBottom: "1px solid #2d2d2d" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>Search Indicators (405 total)</span>
            <input
              type="text"
              placeholder="Search e.g. SMA, BB, RSI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "90%",
                marginTop: "8px",
                background: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "4px",
                padding: "6px 10px",
                color: "#ffffff"
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {filteredIndicators.map((ind) => (
              <div
                key={ind}
                onClick={() => setSelectedIndicator(ind)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  background: selectedIndicator === ind ? "rgba(224, 64, 251, 0.15)" : "transparent",
                  color: selectedIndicator === ind ? "#E040FB" : "#ccc",
                  fontSize: "13px"
                }}
              >
                {ind}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

import { Point } from "../components/chart/tools/drawing_manager";

export interface DrawingItem {
  id: string;
  type: string;
  points: Point[];
  selected: boolean;
  style: {
    color: string;
    lineWidth: number;
    fillColor?: string;
    font?: string;
  };
}

export interface WorkspaceLayout {
  id: string;
  name: string;
  panels: Array<{
    id: string;
    type: "chart" | "orderbook" | "news" | "watchlist" | "browser" | "scanner";
    title: string;
    w: number; // grid percentage width
    h: number; // grid percentage height
    x: number;
    y: number;
    symbol: string;
    timeframe: string;
    chartType: string;
    drawings: DrawingItem[];
    indicators: string[];
    zoomLevel: number;
  }>;
}

export const WORKSPACE_PRESETS: Record<string, WorkspaceLayout> = {
  "Macro Overview": {
    id: "macro-overview",
    name: "Macro Overview",
    panels: [
      {
        id: "p1",
        type: "chart",
        title: "BTC/USDT Main Macro",
        w: 60,
        h: 100,
        x: 0,
        y: 0,
        symbol: "BTC/USDT",
        timeframe: "1D",
        chartType: "Standard Candlesticks",
        drawings: [],
        indicators: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)"],
        zoomLevel: 100,
      },
      {
        id: "p2",
        type: "watchlist",
        title: "Global Watchlist",
        w: 40,
        h: 40,
        x: 60,
        y: 0,
        symbol: "BTC/USDT",
        timeframe: "1D",
        chartType: "Line",
        drawings: [],
        indicators: [],
        zoomLevel: 100,
      },
      {
        id: "p3",
        type: "news",
        title: "Real-time Squawk & News",
        w: 40,
        h: 60,
        x: 60,
        y: 40,
        symbol: "BTC/USDT",
        timeframe: "1D",
        chartType: "Line",
        drawings: [],
        indicators: [],
        zoomLevel: 100,
      }
    ]
  },
  "Scalper Terminal": {
    id: "scalper-terminal",
    name: "Scalper Terminal",
    panels: [
      {
        id: "p1",
        type: "chart",
        title: "SOL/USDT Tick Flow",
        w: 50,
        h: 60,
        x: 0,
        y: 0,
        symbol: "SOL/USDT",
        timeframe: "1 Tick",
        chartType: "Heikin-Ashi",
        drawings: [],
        indicators: ["Volume Weighted Average Price (VWAP)"],
        zoomLevel: 120,
      },
      {
        id: "p2",
        type: "orderbook",
        title: "Ultra L3 Depth Book",
        w: 50,
        h: 60,
        x: 50,
        y: 0,
        symbol: "SOL/USDT",
        timeframe: "1m",
        chartType: "Candlestick",
        drawings: [],
        indicators: [],
        zoomLevel: 100,
      },
      {
        id: "p3",
        type: "chart",
        title: "Footprint Aggregator",
        w: 100,
        h: 40,
        x: 0,
        y: 60,
        symbol: "SOL/USDT",
        timeframe: "5m",
        chartType: "Volume Footprint",
        drawings: [],
        indicators: ["Cumulative Volume Delta (CVD)"],
        zoomLevel: 90,
      }
    ]
  },
  "Orderflow & Footprint": {
    id: "orderflow-footprint",
    name: "Orderflow & Footprint",
    panels: [
      {
        id: "p1",
        type: "chart",
        title: "BTC Orderflow Tape",
        w: 70,
        h: 100,
        x: 0,
        y: 0,
        symbol: "BTC/USDT",
        timeframe: "100 Volume",
        chartType: "Volume Footprint",
        drawings: [],
        indicators: ["Session Volume Profile High/Low", "Point of Control (POC) Line"],
        zoomLevel: 110,
      },
      {
        id: "p2",
        type: "scanner",
        title: "Large Order Block Sweeps",
        w: 30,
        h: 100,
        x: 70,
        y: 0,
        symbol: "BTC/USDT",
        timeframe: "1h",
        chartType: "Line",
        drawings: [],
        indicators: [],
        zoomLevel: 100,
      }
    ]
  },
  "Multi-Timeframe Matrix": {
    id: "mtf-matrix",
    name: "Multi-Timeframe Matrix",
    panels: [
      {
        id: "p1",
        type: "chart",
        title: "BTC Weekly (Macro Direction)",
        w: 50,
        h: 50,
        x: 0,
        y: 0,
        symbol: "BTC/USDT",
        timeframe: "1W",
        chartType: "HLC Area",
        drawings: [],
        indicators: ["Bollinger Bands (BB)"],
        zoomLevel: 100,
      },
      {
        id: "p2",
        type: "chart",
        title: "BTC Daily (Trend Structure)",
        w: 50,
        h: 50,
        x: 50,
        y: 0,
        symbol: "BTC/USDT",
        timeframe: "1D",
        chartType: "Renko",
        drawings: [],
        indicators: ["Arnaud Legoux Moving Average (ALMA)"],
        zoomLevel: 100,
      },
      {
        id: "p3",
        type: "chart",
        title: "BTC 4-Hour (Tactical Execution)",
        w: 50,
        h: 50,
        x: 0,
        y: 50,
        symbol: "BTC/USDT",
        timeframe: "4h",
        chartType: "Standard Candlesticks",
        drawings: [],
        indicators: ["Supertrend Indicator"],
        zoomLevel: 100,
      },
      {
        id: "p4",
        type: "chart",
        title: "BTC 15-Min (Trigger Entries)",
        w: 50,
        h: 50,
        x: 50,
        y: 50,
        symbol: "BTC/USDT",
        timeframe: "15m",
        chartType: "Baseline",
        drawings: [],
        indicators: ["Volume Weighted Average Price (VWAP)"],
        zoomLevel: 100,
      }
    ]
  }
};

export function loadSavedWorkspace(): WorkspaceLayout {
  try {
    const saved = localStorage.getItem("nq_pro_workspace_v1");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load workspace layout", e);
  }
  return WORKSPACE_PRESETS["Macro Overview"];
}

export function saveWorkspace(workspace: WorkspaceLayout): void {
  try {
    localStorage.setItem("nq_pro_workspace_v1", JSON.stringify(workspace));
  } catch (e) {
    console.error("Failed to save workspace layout", e);
  }
}

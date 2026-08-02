import { CanvasStage } from "./CanvasStage";
import { DrawingTool } from "./tools/drawing_manager";
import { MarketBar } from "../../utils/math";
import { ChartTheme } from "./renderers/CandlestickRenderer";
import { formatPrice, formatPercent } from "../../utils/formatters";

interface ChartContainerProps {
  bars: MarketBar[];
  activeIndicators: string[];
  theme: ChartTheme;
  selectedTool: string;
  drawings: DrawingTool[];
  onDrawingsChange: (drawings: DrawingTool[]) => void;
  symbol: string;
  timeframe: string;
}

export function ChartContainer({
  bars,
  activeIndicators,
  theme,
  selectedTool,
  drawings,
  onDrawingsChange,
  symbol,
  timeframe
}: ChartContainerProps) {
  const lastBar = bars[bars.length - 1];
  const ohlc = lastBar
    ? {
        o: lastBar.open,
        h: lastBar.high,
        l: lastBar.low,
        c: lastBar.close,
        chg: lastBar.close - lastBar.open,
        pct: ((lastBar.close - lastBar.open) / lastBar.open) * 100
      }
    : { o: 0, h: 0, l: 0, c: 0, chg: 0, pct: 0 };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      position: "relative",
      background: "#0c0c10",
      overflow: "hidden"
    }}>
      {/* Top Left Status Legend (OHLC Overlays) */}
      <div style={{
        position: "absolute",
        top: "12px",
        left: "16px",
        zIndex: 10,
        pointerEvents: "none",
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#d1d4dc",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: "bold", color: "#fff" }}>{symbol}</span>
          <span style={{ background: "#2196F3", padding: "1px 4px", borderRadius: "2px", fontSize: "10px", color: "#fff" }}>{timeframe}</span>
          <span style={{ color: "#8a8f9d" }}>BINANCE</span>
          <span style={{ color: "#4CAF50" }}>● LIVE</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "11px", color: "#8a8f9d" }}>
          <span>O: <span style={{ color: "#fff" }}>{formatPrice(ohlc.o, 2, "None")}</span></span>
          <span>H: <span style={{ color: "#fff" }}>{formatPrice(ohlc.h, 2, "None")}</span></span>
          <span>L: <span style={{ color: "#fff" }}>{formatPrice(ohlc.l, 2, "None")}</span></span>
          <span>C: <span style={{ color: "#fff" }}>{formatPrice(ohlc.c, 2, "None")}</span></span>
          <span style={{ color: ohlc.chg >= 0 ? "#4CAF50" : "#F44336" }}>
            {ohlc.chg >= 0 ? "+" : ""}{ohlc.chg.toFixed(2)} ({formatPercent(ohlc.pct)})
          </span>
        </div>

        {/* Indicators labels */}
        {activeIndicators.map((ind, i) => (
          <div key={`${ind}-${i}`} style={{ fontSize: "10px", color: "#8a8f9d", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>{ind}</span>
            <span style={{ color: "#E040FB" }}>close 9 20</span>
          </div>
        ))}
      </div>

      {/* Main Canvas Viewport Area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Semi-transparent watermark in background center */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "5rem",
          fontWeight: "bold",
          color: "#fff",
          opacity: 0.04,
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "4px",
          fontFamily: "Inter, sans-serif"
        }}>
          NEXUSQUANT
        </div>

        <CanvasStage
          bars={bars}
          activeIndicators={activeIndicators}
          theme={theme}
          selectedTool={selectedTool}
          drawings={drawings}
          onDrawingsChange={onDrawingsChange}
          zoomLevel={100}
        />
      </div>
    </div>
  );
}

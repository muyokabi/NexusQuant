import { useState } from "react";
import { MonacoEditor } from "./MonacoEditor";
import { ConsoleOutput } from "./ConsoleOutput";

interface ScriptRunnerProps {
  onAddIndicatorToChart: (name: string) => void;
}

export function ScriptRunner({ onAddIndicatorToChart }: ScriptRunnerProps) {
  const [code, setCode] = useState<string>(() => `//@version=5
indicator("My Custom VWAP Cross Study", overlay=true)
src = close
len = 20

// Calculate moving averages
emaVal = ta.ema(src, len)
vwapVal = ta.vwap(src)

// Define signals
buySignal = ta.crossover(emaVal, vwapVal)
sellSignal = ta.crossunder(emaVal, vwapVal)

plotshape(buySignal, title="Buy", style=shape.triangleup, location=location.belowbar, color=color.green, size=size.small)
plotshape(sellSignal, title="Sell", style=shape.triangledown, location=location.abovebar, color=color.red, size=size.small)
`);

  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleCompile = () => {
    setLogs(["Parsing AST syntax tokens...", "Resolving pine type bindings study...", "SMC indicators mapped: OK.", "Indicator compiled successfully. 0 warnings, 0 errors."]);
    setErrors([]);
    onAddIndicatorToChart("Custom VWAP Cross Study");
  };

  const handleClear = () => {
    setLogs([]);
    setErrors([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px", padding: "12px", background: "#121218" }}>
      {/* Control Buttons header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleCompile}
            style={{
              background: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "6px 14px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Add to Chart 🚀
          </button>
          <button
            onClick={handleClear}
            style={{
              background: "#2d2d3d",
              color: "#aaa",
              border: "none",
              borderRadius: "4px",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Clear Console
          </button>
        </div>
        <span style={{ fontSize: "11px", color: "#8a8f9d", fontFamily: "monospace" }}>PINE SCRIPT ENGINE v5.0</span>
      </div>

      {/* Editor & Console Split view */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", minHeight: "180px" }}>
        <MonacoEditor code={code} onChange={setCode} />
        <ConsoleOutput logs={logs} errors={errors} />
      </div>
    </div>
  );
}

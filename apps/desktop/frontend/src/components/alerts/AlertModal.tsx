import { SystemConfig } from "../../state/configStore";
import { ChartTheme } from "../chart/renderers/CandlestickRenderer";

interface SettingsModalProps {
  config: SystemConfig;
  onConfigChange: (newConfig: SystemConfig) => void;
  theme: ChartTheme;
  onThemeChange: (newTheme: ChartTheme) => void;
  onClose: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onExport4KSnapshot: () => void;
}

export function SettingsModal({
  config,
  onConfigChange,
  theme,
  onThemeChange,
  onClose,
  onExportJson,
  onImportJson,
  onExport4KSnapshot
}: SettingsModalProps) {
  const themesList = [
    { value: "institutional-slate", label: "Institutional Slate" },
    { value: "ultra-dark", label: "Ultra-Dark Charcoal" },
    { value: "high-contrast", label: "High Contrast Black" },
    { value: "matrix", label: "Matrix Digital Green" }
  ];

  const timezones = ["UTC", "Exchange", "User"];
  const currencies = ["USD", "EUR", "GBP", "BTC", "None"];
  const fpsOptions = [30, 60, 120, "unlimited"];

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(6, 6, 8, 0.9)",
      backdropFilter: "blur(6px)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }} onClick={onClose}>
      <div style={{
        width: "650px",
        maxHeight: "85vh",
        background: "#121218",
        border: "1px solid #32324d",
        borderRadius: "10px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        {/* Title */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "#161622",
          borderBottom: "1px solid #23232e"
        }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "1px", color: "#2196F3" }}>
            TERMINAL PARAMETERS &amp; PERFORMANCE ENGINE
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#8a8f9d",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>

        {/* Content Tabs */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Chart & Canvas Settings */}
          <section style={{ borderBottom: "1px solid #23232e", paddingBottom: "16px" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#fff", fontSize: "13px" }}>1. CHART &amp; CANVAS RENDERER</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#8a8f9d", marginBottom: "4px" }}>Visual Theme</label>
                <select
                  value={config.theme}
                  onChange={e => onConfigChange({ ...config, theme: e.target.value as any })}
                  style={{ width: "100%", background: "#1c1c24", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "6px", color: "#fff" }}
                >
                  {themesList.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#8a8f9d", marginBottom: "4px" }}>Timezone Adjustment</label>
                <select
                  value={config.timezone}
                  onChange={e => onConfigChange({ ...config, timezone: e.target.value as any })}
                  style={{ width: "100%", background: "#1c1c24", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "6px", color: "#fff" }}
                >
                  {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#8a8f9d", marginBottom: "4px" }}>Currency Unit Overrides</label>
                <select
                  value={config.currencyUnit}
                  onChange={e => onConfigChange({ ...config, currencyUnit: e.target.value as any })}
                  style={{ width: "100%", background: "#1c1c24", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "6px", color: "#fff" }}
                >
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#8a8f9d", marginBottom: "4px" }}>Decimal Precision</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={config.decimalPrecision}
                  onChange={e => onConfigChange({ ...config, decimalPrecision: parseInt(e.target.value) || 2 })}
                  style={{ width: "95%", background: "#1c1c24", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "6px", color: "#fff" }}
                />
              </div>
            </div>
          </section>

          {/* Color Pickers Matrix */}
          <section style={{ borderBottom: "1px solid #23232e", paddingBottom: "16px" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#fff", fontSize: "13px" }}>2. COLOR CUSTOMIZATION MATRIX</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "10px", color: "#8a8f9d", marginBottom: "2px" }}>Bull Body</label>
                <input type="color" value={theme.bullBody} onChange={e => onThemeChange({ ...theme, bullBody: e.target.value })} style={{ width: "100%", height: "25px", border: "none", background: "none", cursor: "pointer" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "10px", color: "#8a8f9d", marginBottom: "2px" }}>Bull Border</label>
                <input type="color" value={theme.bullBorder} onChange={e => onThemeChange({ ...theme, bullBorder: e.target.value })} style={{ width: "100%", height: "25px", border: "none", background: "none", cursor: "pointer" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "10px", color: "#8a8f9d", marginBottom: "2px" }}>Bull Wick</label>
                <input type="color" value={theme.bullWick} onChange={e => onThemeChange({ ...theme, bullWick: e.target.value })} style={{ width: "100%", height: "25px", border: "none", background: "none", cursor: "pointer" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "10px", color: "#8a8f9d", marginBottom: "2px" }}>Bear Body</label>
                <input type="color" value={theme.bearBody} onChange={e => onThemeChange({ ...theme, bearBody: e.target.value })} style={{ width: "100%", height: "25px", border: "none", background: "none", cursor: "pointer" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "10px", color: "#8a8f9d", marginBottom: "2px" }}>Bear Border</label>
                <input type="color" value={theme.bearBorder} onChange={e => onThemeChange({ ...theme, bearBorder: e.target.value })} style={{ width: "100%", height: "25px", border: "none", background: "none", cursor: "pointer" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "10px", color: "#8a8f9d", marginBottom: "2px" }}>Bear Wick</label>
                <input type="color" value={theme.bearWick} onChange={e => onThemeChange({ ...theme, bearWick: e.target.value })} style={{ width: "100%", height: "25px", border: "none", background: "none", cursor: "pointer" }} />
              </div>
            </div>
          </section>

          {/* Performance & Throttling */}
          <section style={{ borderBottom: "1px solid #23232e", paddingBottom: "16px" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#fff", fontSize: "13px" }}>3. PERFORMANCE &amp; HARDWARE THROTTLING</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#8a8f9d", marginBottom: "4px" }}>Dynamic Frame-Rate Cap</label>
                <select
                  value={config.fpsCap}
                  onChange={e => onConfigChange({ ...config, fpsCap: e.target.value === "unlimited" ? "unlimited" : parseInt(e.target.value) as any })}
                  style={{ width: "100%", background: "#1c1c24", border: "1px solid #2a2a3a", borderRadius: "4px", padding: "6px", color: "#fff" }}
                >
                  {fpsOptions.map(o => <option key={o} value={o}>{o} FPS</option>)}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="tickBatch"
                    checked={config.tickBatching}
                    onChange={e => onConfigChange({ ...config, tickBatching: e.target.checked })}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="tickBatch" style={{ fontSize: "12px", color: "#d1d4dc", cursor: "pointer" }}>
                    Enable Tick Batching (Low-Latency)
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                  <input
                    type="checkbox"
                    id="renderThrot"
                    checked={config.renderingThrottling}
                    onChange={e => onConfigChange({ ...config, renderingThrottling: e.target.checked })}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="renderThrot" style={{ fontSize: "12px", color: "#d1d4dc", cursor: "pointer" }}>
                    Dynamic Rendering Throttling
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Exports & Snapshots */}
          <section>
            <h4 style={{ margin: "0 0 12px 0", color: "#fff", fontSize: "13px" }}>4. DATA EXPORT &amp; SNAPSHOT SUITE</h4>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={onExportJson}
                style={{
                  flex: 1,
                  background: "#1c1c24",
                  border: "1px solid #2a2a3a",
                  color: "#d1d4dc",
                  borderRadius: "4px",
                  padding: "8px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Export Workspace JSON
              </button>

              <button
                onClick={onImportJson}
                style={{
                  flex: 1,
                  background: "#1c1c24",
                  border: "1px solid #2a2a3a",
                  color: "#d1d4dc",
                  borderRadius: "4px",
                  padding: "8px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Import Workspace JSON
              </button>

              <button
                onClick={onExport4KSnapshot}
                style={{
                  flex: 1,
                  background: "#2196F3",
                  border: "none",
                  color: "#fff",
                  borderRadius: "4px",
                  padding: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                4K Ultra Screenshot
              </button>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px",
          background: "#161622",
          borderTop: "1px solid #23232e",
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <button
            onClick={onClose}
            style={{
              background: "#2196F3",
              border: "none",
              color: "#fff",
              borderRadius: "4px",
              padding: "6px 16px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Save Parameters
          </button>
        </div>
      </div>
    </div>
  );
}

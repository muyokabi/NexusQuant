import { AlertRule, AlertLogEntry } from "../../state/alertStore";
import { formatDateTime } from "../../utils/formatters";

interface TriggerListProps {
  alerts: AlertRule[];
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  logs: AlertLogEntry[];
  onClearLogs: () => void;
}

export function TriggerList({
  alerts,
  onToggleAlert,
  onDeleteAlert,
  logs,
  onClearLogs
}: TriggerListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", color: "#d1d4dc", fontSize: "12px", fontFamily: "monospace" }}>
      {/* Active Rules Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#121218", borderRadius: "6px", border: "1px solid #23232e", overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", background: "#1c1c24", borderBottom: "1px solid #23232e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "bold", color: "#FF9800" }}>⏰ ACTIVE TRIGGER SCHEME RULES ({alerts.length})</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {alerts.length === 0 ? (
            <p style={{ color: "#8a8f9d", textAlign: "center", margin: "20px" }}>No alert rules established.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#8a8f9d", borderBottom: "1px solid #23232e" }}>
                  <th style={{ padding: "6px" }}>Asset</th>
                  <th style={{ padding: "6px" }}>Condition</th>
                  <th style={{ padding: "6px" }}>Value</th>
                  <th style={{ padding: "6px" }}>Status</th>
                  <th style={{ padding: "6px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((rule) => (
                  <tr key={rule.id} style={{ borderBottom: "1px solid #161622" }}>
                    <td style={{ padding: "6px", color: "#fff", fontWeight: "bold" }}>{rule.symbol}</td>
                    <td style={{ padding: "6px", textTransform: "uppercase" }}>{rule.conditionType.replace("_", " ")}</td>
                    <td style={{ padding: "6px", color: "#4CAF50" }}>{rule.value.toLocaleString()}</td>
                    <td style={{ padding: "6px" }}>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: "3px",
                        background: rule.active ? "rgba(76, 175, 80, 0.15)" : "rgba(138, 143, 157, 0.15)",
                        color: rule.active ? "#4CAF50" : "#8a8f9d"
                      }}>
                        {rule.active ? "ACTIVE" : "PAUSED"}
                      </span>
                    </td>
                    <td style={{ padding: "6px", textAlign: "right" }}>
                      <button
                        onClick={() => onToggleAlert(rule.id)}
                        style={{ background: "#1c1c24", border: "1px solid #32324a", color: "#fff", padding: "2px 6px", borderRadius: "3px", marginRight: "4px", cursor: "pointer" }}
                      >
                        {rule.active ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => onDeleteAlert(rule.id)}
                        style={{ background: "rgba(244, 67, 54, 0.15)", border: "none", color: "#F44336", padding: "2px 6px", borderRadius: "3px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Logs Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#121218", borderRadius: "6px", border: "1px solid #23232e", overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", background: "#1c1c24", borderBottom: "1px solid #23232e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "bold", color: "#2196F3" }}>📜 TRIGGER HISTORICAL EVENTS LOG</span>
          <button
            onClick={onClearLogs}
            style={{ background: "transparent", border: "none", color: "#f44336", cursor: "pointer", fontSize: "11px" }}
          >
            Clear Log
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {logs.length === 0 ? (
            <p style={{ color: "#8a8f9d", textAlign: "center", margin: "20px" }}>No historical alert triggers logged.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} style={{ padding: "6px 0", borderBottom: "1px solid #161622", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ color: "#4CAF50", fontWeight: "bold" }}>[{log.symbol}]</span> {log.message} at <span style={{ color: "#fff" }}>${log.triggeredValue}</span>
                </div>
                <div style={{ color: "#8a8f9d" }}>{formatDateTime(log.timestamp)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

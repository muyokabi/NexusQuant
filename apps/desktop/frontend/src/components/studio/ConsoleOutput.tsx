interface ConsoleOutputProps {
  logs: string[];
  errors: string[];
}

export function ConsoleOutput({ logs, errors }: ConsoleOutputProps) {
  return (
    <div style={{
      background: "#08080c",
      border: "1px solid #23232e",
      borderRadius: "4px",
      padding: "12px",
      fontFamily: "monospace",
      fontSize: "12px",
      height: "100%",
      overflowY: "auto",
      color: "#aaa"
    }}>
      <div style={{ color: "#8a8f9d", borderBottom: "1px solid #1c1c24", paddingBottom: "6px", marginBottom: "8px", fontWeight: "bold" }}>
        💻 COMPILATION CONSOLE &amp; STRATEGY ENGINE LOGS
      </div>

      {errors.length > 0 && (
        <div style={{ color: "#F44336", marginBottom: "12px", whiteSpace: "pre-wrap" }}>
          {errors.map((err, idx) => (
            <div key={idx}>❌ [ERROR] {err}</div>
          ))}
        </div>
      )}

      {logs.length === 0 && errors.length === 0 ? (
        <div style={{ color: "#4a4a5a" }}>Console idle. Execute compilation to observe output streams.</div>
      ) : (
        <div style={{ color: "#4CAF50", whiteSpace: "pre-wrap" }}>
          {logs.map((log, idx) => (
            <div key={idx}>✓ [INFO] {log}</div>
          ))}
        </div>
      )}
    </div>
  );
}

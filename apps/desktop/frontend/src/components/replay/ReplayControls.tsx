interface ReplayControlsProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStepForward: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onExit: () => void;
}

export function ReplayControls({
  isPlaying,
  onPlayToggle,
  onStepForward,
  speed,
  onSpeedChange,
  onExit
}: ReplayControlsProps) {
  const speedOptions = [
    { label: "0.5s", val: 500 },
    { label: "1s", val: 1000 },
    { label: "2s", val: 2000 },
    { label: "5s", val: 5000 }
  ];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 16px",
      background: "#1c1c28",
      border: "1px solid #ff9800",
      borderRadius: "6px",
      fontFamily: "monospace",
      color: "#fff",
      fontSize: "12px",
      gap: "16px",
      boxShadow: "0 4px 15px rgba(255, 152, 0, 0.15)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#FF9800", fontWeight: "bold" }}>⏪ HISTORICAL BAR REPLAY MODE ON</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={onPlayToggle}
          style={{
            background: isPlaying ? "#F44336" : "#4CAF50",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            padding: "5px 12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "11px"
          }}
        >
          {isPlaying ? "PAUSE ⏸" : "PLAY PLAYBACK ▶"}
        </button>

        <button
          onClick={onStepForward}
          style={{
            background: "#2d2d3d",
            border: "1px solid #4a4a5a",
            borderRadius: "4px",
            color: "#fff",
            padding: "5px 12px",
            cursor: "pointer",
            fontSize: "11px"
          }}
        >
          STEP FORWARD ➡️
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Interval speed:</span>
          {speedOptions.map(opt => (
            <button
              key={opt.val}
              onClick={() => onSpeedChange(opt.val)}
              style={{
                background: speed === opt.val ? "#FF9800" : "#2d2d3d",
                border: "none",
                borderRadius: "3px",
                color: "#fff",
                padding: "3px 6px",
                cursor: "pointer",
                fontSize: "10px"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onExit}
        style={{
          background: "transparent",
          border: "1px solid #F44336",
          borderRadius: "4px",
          color: "#F44336",
          padding: "4px 10px",
          cursor: "pointer",
          fontSize: "11px"
        }}
      >
        Exit Replay ❌
      </button>
    </div>
  );
}

import { useState, useEffect } from "react";

interface CommandPaletteProps {
  onSelectAction: (actionType: "asset" | "timeframe" | "indicator" | "setting", value: string) => void;
  onClose: () => void;
  assets: Record<string, string[]>;
  timeframes: string[];
  indicators: string[];
}

export function CommandPalette({ onSelectAction, onClose, assets, timeframes, indicators }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const flatAssets = Object.entries(assets).flatMap(([cat, list]) =>
    list.map(sym => ({ type: "asset" as const, value: sym, category: cat, label: `Jump to Symbol: ${sym} (${cat})` }))
  );
  const flatTimeframes = timeframes.map(tf => ({
    type: "timeframe" as const,
    value: tf,
    category: "Timeframes",
    label: `Switch Timeframe to: ${tf}`
  }));
  const flatIndicators = indicators.map(ind => ({
    type: "indicator" as const,
    value: ind,
    category: "Indicators",
    label: `Apply Indicator: ${ind}`
  }));
  const staticActions = [
    { type: "setting" as const, value: "theme-institutional-slate", category: "Settings", label: "Theme: Institutional Slate" },
    { type: "setting" as const, value: "theme-ultra-dark", category: "Settings", label: "Theme: Ultra-Dark Charcoal" },
    { type: "setting" as const, value: "theme-high-contrast", category: "Settings", label: "Theme: High Contrast" },
    { type: "setting" as const, value: "theme-matrix", category: "Settings", label: "Theme: Matrix Green" },
    { type: "setting" as const, value: "fps-30", category: "Settings", label: "Performance: Cap at 30 FPS" },
    { type: "setting" as const, value: "fps-60", category: "Settings", label: "Performance: Cap at 60 FPS" },
    { type: "setting" as const, value: "fps-120", category: "Settings", label: "Performance: Cap at 120 FPS" },
    { type: "setting" as const, value: "fps-unlimited", category: "Settings", label: "Performance: Unlimited Frame Rates" },
    { type: "setting" as const, value: "export-json", category: "Settings", label: "Workspace: Export Raw JSON" },
    { type: "setting" as const, value: "import-json", category: "Settings", label: "Workspace: Import Raw JSON" },
  ];

  const allItems = [...flatAssets, ...flatTimeframes, ...flatIndicators, ...staticActions];

  const filtered = allItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.value.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          const item = filtered[selectedIndex];
          onSelectAction(item.type, item.value);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filtered, selectedIndex, onSelectAction, onClose]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(6, 6, 8, 0.85)",
      backdropFilter: "blur(6px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "15vh"
    }} onClick={onClose}>
      <div style={{
        width: "600px",
        background: "#121218",
        border: "1px solid #32324d",
        borderRadius: "8px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #23232e", padding: "12px 16px" }}>
          <span style={{ color: "#2196F3", marginRight: "12px", fontSize: "16px", fontWeight: "bold" }}>&gt;</span>
          <input
            type="text"
            placeholder="Type a command, asset name, timeframe, or indicator..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "15px",
              outline: "none",
              fontFamily: "monospace"
            }}
          />
        </div>

        {/* List of items */}
        <div style={{ maxHeight: "350px", overflowY: "auto", padding: "8px 0" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 16px", color: "#8a8f9d", fontSize: "13px" }}>No matching terminal actions found.</div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.value}-${idx}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    onSelectAction(item.type, item.value);
                    onClose();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: isSelected ? "rgba(33, 150, 243, 0.15)" : "transparent",
                    color: isSelected ? "#2196F3" : "#d1d4dc",
                    cursor: "pointer",
                    transition: "all 0.1s ease",
                    borderLeft: isSelected ? "3px solid #2196F3" : "3px solid transparent"
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: isSelected ? 600 : 400 }}>{item.label}</span>
                  <span style={{
                    fontSize: "11px",
                    background: "#1e1e2d",
                    color: "#8a8f9d",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    textTransform: "uppercase"
                  }}>{item.category}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 16px",
          background: "#0d0d12",
          borderTop: "1px solid #23232e",
          fontSize: "11px",
          color: "#8a8f9d"
        }}>
          <span>↑↓ to navigate • Enter to select • Esc to close</span>
          <span style={{ color: "#2196F3" }}>Command Palette</span>
        </div>
      </div>
    </div>
  );
}

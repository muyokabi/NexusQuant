import React from "react";
import { WorkspaceLayout } from "../../state/chartStore";

interface MultiChartGridProps {
  layout: WorkspaceLayout;
  onSelectPanel: (panelId: string) => void;
  selectedPanelId: string;
  renderPanelContent: (panel: WorkspaceLayout["panels"][0]) => React.ReactNode;
}

export function MultiChartGrid({
  layout,
  onSelectPanel,
  selectedPanelId,
  renderPanelContent
}: MultiChartGridProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: layout.panels.length > 2 ? "repeat(2, 1fr)" : "1fr",
      gridTemplateRows: layout.panels.length > 1 ? "repeat(2, 1fr)" : "1fr",
      gap: "6px",
      width: "100%",
      height: "100%",
      background: "#0c0c10",
      padding: "6px",
      boxSizing: "border-box"
    }}>
      {layout.panels.map((panel) => {
        const isSelected = panel.id === selectedPanelId;
        return (
          <div
            key={panel.id}
            onClick={() => onSelectPanel(panel.id)}
            style={{
              position: "relative",
              background: "#121218",
              border: isSelected ? "1.5px solid #2196F3" : "1.5px solid #23232e",
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "border-color 0.1s ease"
            }}
          >
            {/* Sync Status Overlay Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 8px",
              background: isSelected ? "rgba(33, 150, 243, 0.15)" : "#16161c",
              borderBottom: "1px solid #23232e",
              fontSize: "11px",
              fontFamily: "monospace",
              color: isSelected ? "#2196F3" : "#8a8f9d"
            }}>
              <span style={{ fontWeight: "bold" }}>{panel.title}</span>
              <span>{panel.symbol} · {panel.timeframe}</span>
            </div>

            {/* Inner Panel Content */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              {renderPanelContent(panel)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

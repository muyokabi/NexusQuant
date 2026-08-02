import React from "react";
import { WorkspaceLayout } from "../../state/chartStore";

interface DockLayoutProps {
  layout: WorkspaceLayout;
  onLayoutChange: (layout: WorkspaceLayout) => void;
  renderPanelContent: (panel: WorkspaceLayout["panels"][0]) => React.ReactNode;
}

export function DockLayout({ layout, renderPanelContent }: DockLayoutProps) {
  return (
    <div className="dock-layout-container" style={{ display: "flex", flex: 1, overflow: "hidden", background: "#0e0e12" }}>
      {/* Primary Tiled Viewport Grid */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gridTemplateRows: "repeat(12, 1fr)",
        gap: "6px",
        padding: "6px",
        height: "100%",
        boxSizing: "border-box"
      }}>
        {layout.panels.map((panel) => {
          const colSpan = Math.max(1, Math.round((panel.w / 100) * 12));
          const rowSpan = Math.max(1, Math.round((panel.h / 100) * 12));

          return (
            <div
              key={panel.id}
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                background: "#16161c",
                border: "1px solid #23232e",
                borderRadius: "4px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Panel Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px",
                background: "#1c1c24",
                borderBottom: "1px solid #23232e",
                fontSize: "11px",
                fontWeight: 600,
                color: "#d1d4dc",
                userSelect: "none"
              }}>
                <span>{panel.title} [{panel.symbol} • {panel.timeframe}]</span>
              </div>

              {/* Inner content */}
              <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                {renderPanelContent(panel)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

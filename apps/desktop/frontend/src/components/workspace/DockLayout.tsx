import React, { useState } from "react";
import { WorkspaceLayout, WORKSPACE_PRESETS } from "../../state/chartStore";

interface DockLayoutProps {
  layout: WorkspaceLayout;
  onLayoutChange: (layout: WorkspaceLayout) => void;
  renderPanelContent: (panel: WorkspaceLayout["panels"][0]) => React.ReactNode;
}

export function DockLayout({ layout, onLayoutChange, renderPanelContent }: DockLayoutProps) {
  const [floatingPanels, setFloatingPanels] = useState<string[]>([]);
  const [internalBrowserTabs, setInternalBrowserTabs] = useState<Array<{ id: string; url: string; title: string }>>([
    { id: "tab-doc", url: "https://docs.nexusquant.com", title: "NexusQuant DevDocs" },
    { id: "tab-calc", url: "https://calculator.nexusquant.com", title: "Margin Calculator" },
  ]);
  const [activeBrowserTab, setActiveBrowserTab] = useState<string>("tab-doc");
  const [newTabUrl, setNewTabUrl] = useState("");

  const handlePresetSwitch = (presetName: string) => {
    const preset = WORKSPACE_PRESETS[presetName];
    if (preset) {
      onLayoutChange(preset);
    }
  };

  const toggleFloat = (panelId: string) => {
    if (floatingPanels.includes(panelId)) {
      setFloatingPanels(floatingPanels.filter(id => id !== panelId));
    } else {
      setFloatingPanels([...floatingPanels, panelId]);
    }
  };

  const addBrowserTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabUrl) return;
    const cleanUrl = newTabUrl.startsWith("http") ? newTabUrl : `https://${newTabUrl}`;
    const newId = `tab-${Date.now()}`;
    setInternalBrowserTabs([
      ...internalBrowserTabs,
      { id: newId, url: cleanUrl, title: newTabUrl.replace(/https?:\/\//, "").slice(0, 15) }
    ]);
    setActiveBrowserTab(newId);
    setNewTabUrl("");
  };

  const removeBrowserTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = internalBrowserTabs.filter(t => t.id !== id);
    setInternalBrowserTabs(updated);
    if (activeBrowserTab === id && updated.length > 0) {
      setActiveBrowserTab(updated[0].id);
    }
  };

  return (
    <div className="dock-layout-container" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Workspace Controls header & Presets */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        background: "#16161c",
        borderBottom: "1px solid #23232e",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#8a8f9d" }}>Workspace Presets:</span>
          {Object.keys(WORKSPACE_PRESETS).map((presetKey) => {
            const preset = WORKSPACE_PRESETS[presetKey];
            const isSelected = layout.id === preset.id;
            return (
              <button
                key={presetKey}
                onClick={() => handlePresetSwitch(presetKey)}
                style={{
                  background: isSelected ? "rgba(33, 150, 243, 0.15)" : "#1c1c24",
                  color: isSelected ? "#2196F3" : "#d1d4dc",
                  border: isSelected ? "1px solid #2196F3" : "1px solid #2d2d3d",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontWeight: isSelected ? 600 : 400
                }}
              >
                {presetKey}
              </button>
            );
          })}
        </div>

        {/* Browser-within-app workspace controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "#8a8f9d" }}>Internal Web overlays:</span>
          <form onSubmit={addBrowserTab} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="text"
              placeholder="e.g. google.com"
              value={newTabUrl}
              onChange={(e) => setNewTabUrl(e.target.value)}
              style={{
                background: "#0e0e12",
                border: "1px solid #2a2a35",
                borderRadius: "3px",
                padding: "3px 8px",
                color: "#fff",
                fontSize: "12px"
              }}
            />
            <button
              type="submit"
              style={{
                background: "#2196F3",
                color: "#fff",
                border: "none",
                borderRadius: "3px",
                padding: "3px 8px",
                cursor: "pointer",
                fontSize: "11px"
              }}
            >
              Open Tab
            </button>
          </form>
        </div>
      </div>

      {/* Internal Browser tabs strip (if active or overlay toggle) */}
      {internalBrowserTabs.length > 0 && (
        <div style={{
          display: "flex",
          background: "#0f0f14",
          borderBottom: "1px solid #23232e",
          padding: "2px 8px",
          gap: "4px"
        }}>
          {internalBrowserTabs.map(tab => {
            const isActive = activeBrowserTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveBrowserTab(tab.id)}
                style={{
                  background: isActive ? "#1a1a24" : "#111116",
                  color: isActive ? "#2196F3" : "#8a8f9d",
                  border: "1px solid #23232e",
                  borderBottom: isActive ? "2px solid #2196F3" : "1px solid #23232e",
                  padding: "4px 10px",
                  borderRadius: "4px 4px 0 0",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>{tab.title}</span>
                <span
                  onClick={(e) => removeBrowserTab(tab.id, e)}
                  style={{
                    color: "#f44336",
                    fontWeight: "bold",
                    marginLeft: "4px",
                    cursor: "pointer"
                  }}
                >
                  ×
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Workspace container - Tiled split screens with float layer */}
      <div style={{ flex: 1, position: "relative", display: "flex", background: "#0e0e12" }}>
        {/* If internal Browser Tab is active and we want to render the browser viewport alongside */}
        {internalBrowserTabs.length > 0 && (
          <div style={{
            width: "25%",
            borderRight: "1px solid #23232e",
            background: "#121218",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{ padding: "6px 12px", background: "#171722", borderBottom: "1px solid #23232e", fontSize: "11px", color: "#8a8f9d" }}>
              Browser Viewport ({internalBrowserTabs.find(t => t.id === activeBrowserTab)?.title || "Docs"})
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              {/* Simulated professional internal browser inside Sandbox */}
              <div style={{
                padding: "20px",
                color: "#aaa",
                fontSize: "12px",
                lineHeight: "1.6",
                fontFamily: "monospace"
              }}>
                <div style={{ color: "#2196F3", fontWeight: "bold", marginBottom: "8px" }}>
                  🌐 {internalBrowserTabs.find(t => t.id === activeBrowserTab)?.url}
                </div>
                <div style={{ background: "#08080c", padding: "10px", borderRadius: "4px", border: "1px solid #23232e" }}>
                  <p>&gt; Loaded internal iframe overlay simulation...</p>
                  <p>• Liquidity zones: active.</p>
                  <p>• Terminal cross-origin policies: bypassed.</p>
                  <p>• API Connection: Localhost:3000 online.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tiled Views area */}
        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(12, 1fr)",
          gap: "8px",
          padding: "8px",
          height: "100%",
          boxSizing: "border-box"
        }}>
          {layout.panels.map((panel) => {
            const isFloating = floatingPanels.includes(panel.id);
            if (isFloating) return null;

            // Convert width/height percentages to 12-column grid spans
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
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                }}
              >
                {/* Panel Titlebar */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 12px",
                  background: "#1c1c24",
                  borderBottom: "1px solid #23232e",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#d1d4dc",
                  userSelect: "none"
                }}>
                  <span>{panel.title} [{panel.symbol} • {panel.timeframe}]</span>
                  <button
                    onClick={() => toggleFloat(panel.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#8a8f9d",
                      cursor: "pointer",
                      fontSize: "11px"
                    }}
                    title="Popout panel to floating window"
                  >
                    ⧉ Popout
                  </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                  {renderPanelContent(panel)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Viewports popouts list */}
        {layout.panels.map((panel) => {
          const isFloating = floatingPanels.includes(panel.id);
          if (!isFloating) return null;

          return (
            <div
              key={panel.id}
              style={{
                position: "absolute",
                top: `${40 + layout.panels.indexOf(panel) * 40}px`,
                left: `${150 + layout.panels.indexOf(panel) * 50}px`,
                width: "600px",
                height: "450px",
                background: "#16161c",
                border: "2px solid #2196F3",
                borderRadius: "8px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
              }}
            >
              {/* Floating Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "#1c1c24",
                borderBottom: "1px solid #23232e",
                cursor: "move"
              }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#2196F3" }}>
                  [DETACHED POP-OUT] {panel.title}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => toggleFloat(panel.id)}
                    style={{
                      background: "#2196F3",
                      border: "none",
                      color: "#fff",
                      borderRadius: "3px",
                      padding: "2px 8px",
                      cursor: "pointer",
                      fontSize: "11px"
                    }}
                  >
                    Dock Back
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                {renderPanelContent(panel)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

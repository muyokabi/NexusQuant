import React, { useRef, useEffect, useState } from "react";
import { Point, DrawingTool, DrawingFactory } from "./tools/drawing_manager";
import { GridLayer } from "./layers/GridLayer";
import { SeriesLayer } from "./layers/SeriesLayer";
import { IndicatorLayer } from "./layers/IndicatorLayer";
import { CrosshairLayer } from "./layers/CrosshairLayer";
import { MarketBar } from "../../utils/math";
import { ChartTheme } from "./renderers/CandlestickRenderer";
import { useChartEngine } from "../../hooks/useChartEngine";
import { useIndicatorEngine } from "../../hooks/useIndicatorEngine";
import { formatPrice, formatTimeOnly } from "../../utils/formatters";

interface CanvasStageProps {
  bars: MarketBar[];
  activeIndicators: string[];
  theme: ChartTheme;
  selectedTool: string;
  drawings: DrawingTool[];
  onDrawingsChange: (drawings: DrawingTool[]) => void;
  zoomLevel: number;
}

export function CanvasStage({
  bars,
  activeIndicators,
  theme,
  selectedTool,
  drawings,
  onDrawingsChange,
  zoomLevel
}: CanvasStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crosshair, setCrosshair] = useState<Point | null>(null);

  const { range, getX, getY, getPrice, dragOffset, setDragOffset } = useChartEngine(bars, zoomLevel);
  const indicatorsResult = useIndicatorEngine(bars, activeIndicators);

  const isDraggingRef = useRef(false);
  const startDragX = useRef(0);
  const startDragOffset = useRef(0);

  // Resize canvas to container dimensions
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawAll();
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [bars, activeIndicators, theme, drawings, zoomLevel, dragOffset, crosshair]);

  const drawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas || bars.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Grid Lines Layer
    GridLayer.draw(ctx, canvas.width, canvas.height, theme);

    // 2. Series / Candles Layer
    SeriesLayer.draw(
      ctx,
      "Standard Candlesticks",
      bars,
      theme,
      canvas.width,
      canvas.height,
      zoomLevel,
      [],
      bars[bars.length - 1].close
    );

    // 3. Technical Indicators Layer
    const wrappedGetX = (idx: number) => getX(idx, canvas.width);
    const wrappedGetY = (price: number) => getY(price, canvas.height);
    IndicatorLayer.draw(ctx, indicatorsResult, wrappedGetX, wrappedGetY, range.startIndex, range.endIndex);

    // 4. Drawing Overlays
    drawings.forEach((drawing) => {
      drawing.render(ctx);
    });

    // 5. Intersecting Crosshairs Layer
    if (crosshair) {
      const priceVal = formatPrice(getPrice(crosshair.y, canvas.height), 2, "USD");
      const barIdx = Math.round((crosshair.x / canvas.width) * (range.endIndex - range.startIndex) + range.startIndex);
      const timeVal = bars[barIdx] ? formatTimeOnly(bars[barIdx].time) : "";
      CrosshairLayer.draw(ctx, crosshair, canvas.width, canvas.height, priceVal, timeVal, theme.crosshairColor);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDraggingRef.current = true;
    startDragX.current = e.clientX;
    startDragOffset.current = dragOffset;

    // Check hit tests on drawings
    const clickPoint = { x, y };
    const ctx = canvas.getContext("2d");
    if (ctx) {
      let hit = false;
      const updated = drawings.map((d) => {
        const contains = d.containsPoint(clickPoint, ctx);
        if (contains) hit = true;
        return { ...d, selected: contains };
      });
      if (hit) {
        onDrawingsChange(updated);
        return;
      }
    }

    // Placing drawing points
    if (selectedTool !== "Cursor") {
      const point = { x, y };
      const newId = `${selectedTool}-${Date.now()}`;
      const newDrawing = DrawingFactory.create(newId, selectedTool, [point, { x: point.x + 40, y: point.y - 40 }]);
      onDrawingsChange([...drawings, newDrawing]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCrosshair({ x, y });

    if (isDraggingRef.current && selectedTool === "Cursor") {
      const dx = e.clientX - startDragX.current;
      setDragOffset(Math.max(0, startDragOffset.current + dx / 15));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: selectedTool === "Cursor" ? "grab" : "crosshair", display: "block" }}
      />
    </div>
  );
}

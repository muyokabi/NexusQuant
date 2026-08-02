import { ChartTheme } from "../renderers/CandlestickRenderer";

export class GridLayer {
  static draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: ChartTheme,
    gridSize: number = 50
  ) {
    ctx.save();
    ctx.strokeStyle = theme.gridColor || "#2a2a35";
    ctx.globalAlpha = theme.gridOpacity || 0.35;
    ctx.lineWidth = 1;

    if (theme.crosshairStyle === "dashed") {
      ctx.setLineDash([4, 4]);
    }

    // Vertical grid lines
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }
}

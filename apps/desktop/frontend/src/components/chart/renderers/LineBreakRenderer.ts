import { MarketBar } from "../../../utils/math";

export class LineBreakRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    bars: MarketBar[],
    getX: (idx: number) => number,
    getY: (price: number) => number,
    totalVisible: number,
    width: number,
    theme: any
  ) {
    if (bars.length === 0) return;

    const barWidth = Math.max(2, (width / totalVisible) * 0.7);

    ctx.save();
    bars.forEach((bar, idx) => {
      const x = getX(idx);
      const isUp = bar.close >= bar.open;

      ctx.fillStyle = isUp ? theme.bullBody || "#4CAF50" : theme.bearBody || "#F44336";
      ctx.strokeStyle = isUp ? theme.bullBorder || "#4CAF50" : theme.bearBorder || "#F44336";
      ctx.lineWidth = 1;

      const y_open = getY(bar.open);
      const y_close = getY(bar.close);

      const y = Math.min(y_open, y_close);
      const h = Math.abs(y_close - y_open) || 2;

      ctx.beginPath();
      ctx.rect(x - barWidth / 2, y, barWidth, h);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }
}

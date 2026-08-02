import { MarketBar } from "../../../utils/math";

export class HeikinAshiRenderer {
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

    const barWidth = Math.max(2, (width / totalVisible) * 0.75);

    ctx.save();
    let prevOpen = bars[0].open;
    let prevClose = bars[0].close;

    bars.forEach((bar, idx) => {
      // Heikin-Ashi formula calculations
      const haClose = (bar.open + bar.high + bar.low + bar.close) / 4;
      const haOpen = (prevOpen + prevClose) / 2;
      const haHigh = Math.max(bar.high, haOpen, haClose);
      const haLow = Math.min(bar.low, haOpen, haClose);

      // Save for next step iteration
      prevOpen = haOpen;
      prevClose = haClose;

      const x = getX(idx);
      const isUp = haClose >= haOpen;

      ctx.fillStyle = isUp ? theme.bullBody || "#4CAF50" : theme.bearBody || "#F44336";
      ctx.strokeStyle = isUp ? theme.bullBorder || "#4CAF50" : theme.bearBorder || "#F44336";
      ctx.lineWidth = 1;

      // Draw Wick
      ctx.beginPath();
      ctx.moveTo(x, getY(haHigh));
      ctx.lineTo(x, getY(haLow));
      ctx.stroke();

      // Draw Body
      const yOpen = getY(haOpen);
      const yClose = getY(haClose);
      const y = Math.min(yOpen, yClose);
      const h = Math.abs(yClose - yOpen) || 1;

      ctx.beginPath();
      ctx.rect(x - barWidth / 2, y, barWidth, h);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }
}

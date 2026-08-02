import { MarketBar } from "../../../utils/math";

export class KagiRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    bars: MarketBar[],
    getX: (idx: number) => number,
    getY: (price: number) => number,
    theme: any
  ) {
    if (bars.length < 2) return;

    ctx.save();
    ctx.lineWidth = 2.5;

    ctx.strokeStyle = theme.bullBody || "#4CAF50";

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(bars[0].close));

    for (let i = 1; i < bars.length; i++) {
      const prevY = getY(bars[i - 1].close);
      const currY = getY(bars[i].close);
      const currX = getX(i);

      // Simple Kagi logic: toggle Yang/Yin thick/thin on directional thresholds
      const direction = bars[i].close > bars[i - 1].close;
      if (direction) {
        ctx.strokeStyle = theme.bullBody || "#4CAF50";
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = theme.bearBody || "#F44336";
        ctx.lineWidth = 1.5;
      }

      ctx.lineTo(currX, prevY);
      ctx.lineTo(currX, currY);
    }
    ctx.stroke();
    ctx.restore();
  }
}

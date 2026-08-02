import { IndicatorResult } from "../../../hooks/useIndicatorEngine";

export class IndicatorLayer {
  static draw(
    ctx: CanvasRenderingContext2D,
    indicators: IndicatorResult[],
    getX: (idx: number) => number,
    getY: (price: number) => number,
    startIndex: number,
    endIndex: number
  ) {
    ctx.save();
    ctx.lineWidth = 1.5;

    indicators.forEach((ind) => {
      ctx.strokeStyle = ind.color;
      ctx.beginPath();
      let first = true;

      for (let i = startIndex; i <= endIndex; i++) {
        const val = ind.values[i];
        if (val === undefined || isNaN(val)) continue;

        const x = getX(i);
        const y = getY(val);

        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    ctx.restore();
  }
}

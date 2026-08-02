import { MarketBar } from "../../../utils/math";

export class VolumeProfileRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    bars: MarketBar[],
    _getX: (idx: number) => number,
    getY: (price: number) => number,
    width: number,
    _theme: any
  ) {
    if (bars.length === 0) return;

    // Aggregate volume by price levels
    const priceBins: Record<number, number> = {};
    const binSize = 10; // group by $10 buckets

    bars.forEach((bar) => {
      const avgPrice = Math.round((bar.high + bar.low) / 2 / binSize) * binSize;
      priceBins[avgPrice] = (priceBins[avgPrice] || 0) + bar.volume;
    });

    const entries = Object.entries(priceBins);
    if (entries.length === 0) return;

    const maxVolume = Math.max(...entries.map(([, vol]) => vol)) || 1;

    ctx.save();
    ctx.fillStyle = "rgba(33, 150, 243, 0.18)";
    ctx.strokeStyle = "rgba(33, 150, 243, 0.35)";
    ctx.lineWidth = 1;

    entries.forEach(([priceStr, vol]) => {
      const price = parseFloat(priceStr);
      const y = getY(price);
      const barLen = (vol / maxVolume) * (width * 0.3); // max 30% width

      // Draw horizontal volume profiles
      ctx.beginPath();
      ctx.rect(width - barLen, y - 4, barLen, 8);
      ctx.fill();
      ctx.stroke();
    });

    // Draw POC (Point of Control) line in Red
    let pocPrice = 0;
    let maxVol = 0;
    entries.forEach(([priceStr, vol]) => {
      if (vol > maxVol) {
        maxVol = vol;
        pocPrice = parseFloat(priceStr);
      }
    });

    if (pocPrice > 0) {
      const pocY = getY(pocPrice);
      ctx.strokeStyle = "#F44336";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.5, pocY);
      ctx.lineTo(width, pocY);
      ctx.stroke();

      ctx.fillStyle = "#F44336";
      ctx.font = "9px monospace";
      ctx.fillText("POC", width - 25, pocY - 3);
    }

    ctx.restore();
  }
}

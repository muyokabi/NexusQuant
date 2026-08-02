import { Point } from "../tools/drawing_manager";

export class CrosshairLayer {
  static draw(
    ctx: CanvasRenderingContext2D,
    point: Point | null,
    width: number,
    height: number,
    priceStr: string,
    timeStr: string,
    color: string = "rgba(138, 143, 157, 0.4)"
  ) {
    if (!point) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, point.y);
    ctx.lineTo(width, point.y);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(point.x, 0);
    ctx.lineTo(point.x, height);
    ctx.stroke();

    // Price badge background rect
    ctx.setLineDash([]);
    ctx.fillStyle = "#1c1c24";
    ctx.strokeStyle = "#8a8f9d";
    ctx.font = "10px sans-serif";
    const pWidth = ctx.measureText(priceStr).width + 12;

    ctx.fillRect(width - pWidth, point.y - 10, pWidth, 20);
    ctx.strokeRect(width - pWidth, point.y - 10, pWidth, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(priceStr, width - pWidth + 6, point.y + 3);

    // Time badge background rect
    const tWidth = ctx.measureText(timeStr).width + 12;
    ctx.fillStyle = "#1c1c24";
    ctx.fillRect(point.x - tWidth / 2, height - 20, tWidth, 20);
    ctx.strokeRect(point.x - tWidth / 2, height - 20, tWidth, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(timeStr, point.x - tWidth / 2 + 6, height - 7);

    ctx.restore();
  }
}

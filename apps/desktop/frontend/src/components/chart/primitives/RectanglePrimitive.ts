import { Point } from "../tools/drawing_manager";

export class RectanglePrimitive {
  static render(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, style: any, selected: boolean) {
    ctx.save();
    ctx.strokeStyle = style.color || "#4CAF50";
    ctx.fillStyle = style.fillColor || "rgba(76, 175, 80, 0.15)";
    ctx.lineWidth = style.lineWidth || 2;

    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const w = Math.abs(p2.x - p1.x);
    const h = Math.abs(p2.y - p1.y);

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();

    if (selected) {
      [p1, p2].forEach(p => {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = style.color || "#4CAF50";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
    ctx.restore();
  }
}

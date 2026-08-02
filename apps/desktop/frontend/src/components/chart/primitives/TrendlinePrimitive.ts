import { Point, distToSegment } from "../tools/drawing_manager";

export class TrendlinePrimitive {
  static render(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, style: any, selected: boolean) {
    ctx.save();
    ctx.strokeStyle = style.color || "#2196F3";
    ctx.lineWidth = style.lineWidth || 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    if (selected) {
      this.drawHandles(ctx, p1, p2);
    }
    ctx.restore();
  }

  static drawHandles(ctx: CanvasRenderingContext2D, p1: Point, p2: Point) {
    [p1, p2].forEach(p => {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#2196F3";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  static contains(p: Point, p1: Point, p2: Point): boolean {
    return distToSegment(p, p1, p2) < 8;
  }
}

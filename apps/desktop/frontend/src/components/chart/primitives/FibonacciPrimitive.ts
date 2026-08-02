import { Point } from "../tools/drawing_manager";

export class FibonacciPrimitive {
  static render(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, style: any, selected: boolean) {
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.618, 2.618];
    const dy = p2.y - p1.y;

    ctx.save();
    ctx.lineWidth = style.lineWidth || 1.5;
    ctx.font = "10px sans-serif";

    levels.forEach((lvl) => {
      const y = p1.y + dy * lvl;
      ctx.strokeStyle = style.color || "#2196F3";
      ctx.beginPath();
      ctx.moveTo(Math.min(p1.x, p2.x), y);
      ctx.lineTo(Math.max(p1.x, p2.x), y);
      ctx.stroke();

      ctx.fillStyle = "#8a8f9d";
      ctx.fillText(`Fib ${(lvl * 100).toFixed(1)}%`, Math.min(p1.x, p2.x) + 5, y - 3);
    });

    if (selected) {
      this.drawHandles(ctx, p1, p2);
    }
    ctx.restore();
  }

  static drawHandles(ctx: CanvasRenderingContext2D, p1: Point, p2: Point) {
    [p1, p2].forEach(p => {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#E040FB";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
}

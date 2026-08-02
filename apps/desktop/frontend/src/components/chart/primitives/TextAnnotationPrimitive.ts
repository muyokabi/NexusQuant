import { Point } from "../tools/drawing_manager";

export class TextAnnotationPrimitive {
  static render(ctx: CanvasRenderingContext2D, p1: Point, text: string, style: any, selected: boolean) {
    ctx.save();
    ctx.fillStyle = style.color || "#ffffff";
    ctx.font = style.font || "12px sans-serif";
    ctx.fillText(text, p1.x + 8, p1.y + 4);

    // Draw a small dot marker at the anchor point
    ctx.fillStyle = style.color || "#2196F3";
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
    ctx.fill();

    if (selected) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 7, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

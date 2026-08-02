import { Point } from "../tools/drawing_manager";

export class OrderBlockPrimitive {
  static render(
    ctx: CanvasRenderingContext2D,
    p1: Point,
    p2: Point,
    type: "Bullish" | "Bearish",
    mitigated: boolean,
    selected: boolean
  ) {
    ctx.save();
    const isBull = type === "Bullish";
    const baseColor = isBull ? "#4CAF50" : "#F44336";

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(mitigated ? [4, 4] : []);

    ctx.fillStyle = isBull ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)";

    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const w = Math.abs(p2.x - p1.x);
    const h = Math.abs(p2.y - p1.y);

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();

    // Draw OB Tag
    ctx.fillStyle = baseColor;
    ctx.font = "bold 9px monospace";
    const label = `${type} OB (${mitigated ? "Mitigated" : "Active"})`;
    ctx.fillText(label, x + 5, y + 12);

    if (selected) {
      [p1, p2].forEach(p => {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }
}

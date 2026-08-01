export interface Point {
  x: number;
  y: number;
}

export interface DrawingTool {
  id: string;
  type: string;
  points: Point[];
  selected: boolean;
  style: {
    color: string;
    lineWidth: number;
    fillColor?: string;
    font?: string;
  };
  containsPoint(p: Point, _ctx: CanvasRenderingContext2D): boolean;
  render(ctx: CanvasRenderingContext2D): void;
  dragNode(nodeIndex: number, newPoint: Point): void;
  clone(): DrawingTool;
}

// Vector math helpers
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

export function distToSegment(p: Point, v: Point, w: Point): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return distance(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

export function distToLine(p: Point, p1: Point, p2: Point): number {
  const num = Math.abs((p2.y - p1.y) * p.x - (p2.x - p1.x) * p.y + p2.x * p1.y - p2.y * p1.x);
  const den = distance(p1, p2);
  return den === 0 ? distance(p, p1) : num / den;
}

// Draw a handle for selected drawings
export function drawNodeHandle(ctx: CanvasRenderingContext2D, p: Point) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#2196F3";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export class DrawingFactory {
  static create(id: string, type: string, points: Point[]): DrawingTool {
    const style = { color: "#2196F3", lineWidth: 2, fillColor: "rgba(33, 150, 243, 0.15)", font: "12px sans-serif" };

    const t_lower = type.toLowerCase();

    return {
      id,
      type,
      points: [...points],
      selected: false,
      style,
      clone() {
        const cloned = DrawingFactory.create(this.id, this.type, this.points.map(p => ({ ...p })));
        cloned.selected = this.selected;
        cloned.style = { ...this.style };
        return cloned;
      },
      dragNode(nodeIndex: number, newPoint: Point) {
        if (nodeIndex >= 0 && nodeIndex < this.points.length) {
          this.points[nodeIndex] = { ...newPoint };
        }
      },
      containsPoint(p: Point, _ctx: CanvasRenderingContext2D): boolean {
        if (this.points.length === 0) return false;

        // Handle Line-like tools
        if (["trendline", "ray", "info line", "extended line", "trend angle", "horizontal line", "horizontal ray", "vertical line", "cross line"].includes(t_lower)) {
          if (this.points.length < 2) return false;
          const p1 = this.points[0];
          const p2 = this.points[1];
          if (t_lower === "trendline" || t_lower === "info line" || t_lower === "trend angle") {
            return distToSegment(p, p1, p2) < 8;
          }
          return distToLine(p, p1, p2) < 8;
        }

        // Handle Box-like tools
        if (["rectangle", "rotated rectangle", "gann box", "long position", "short position", "forecast", "date and price range", "price range", "date range", "fixed range volume profile box"].includes(t_lower)) {
          if (this.points.length < 2) return false;
          const x_min = Math.min(this.points[0].x, this.points[1].x);
          const x_max = Math.max(this.points[0].x, this.points[1].x);
          const y_min = Math.min(this.points[0].y, this.points[1].y);
          const y_max = Math.max(this.points[0].y, this.points[1].y);
          return p.x >= x_min && p.x <= x_max && p.y >= y_min && p.y <= y_max;
        }

        // Channels
        if (["parallel channel", "disjoint channel", "flat top/bottom channel", "fibonacci channel"].includes(t_lower)) {
          if (this.points.length < 2) return false;
          return distToLine(p, this.points[0], this.points[1]) < 20;
        }

        // Circles & Curves
        if (["circle / ellipse", "fibonacci circles", "arc", "curve"].includes(t_lower)) {
          const center = this.points[0];
          const edge = this.points[1] || p;
          const r = distance(center, edge);
          return Math.abs(distance(center, p) - r) < 10;
        }

        // Polygon / Pitchforks / Harmonics / Patterns
        if (["triangle", "polyline / polygon", "andrews' pitchfork", "schiff pitchfork", "modified schiff pitchfork", "inside pitchfork", "xabcd pattern", "abcd pattern", "cypher pattern tool", "head and shoulders pattern tool"].includes(t_lower)) {
          for (let i = 0; i < this.points.length; i++) {
            if (distance(p, this.points[i]) < 10) return true;
          }
          return false;
        }

        return distance(p, this.points[0]) < 10;
      },
      render(ctx: CanvasRenderingContext2D) {
        if (this.points.length === 0) return;
        ctx.save();
        ctx.strokeStyle = this.style.color;
        ctx.lineWidth = this.style.lineWidth;
        ctx.fillStyle = this.style.fillColor || "transparent";

        const p1 = this.points[0];
        const p2 = this.points[1] || p1;

        // Render logic customized per tool type
        switch (t_lower) {
          case "trendline": {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            break;
          }
          case "ray": {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p1.x + dx * 100, p1.y + dy * 100);
            ctx.stroke();
            break;
          }
          case "info line": {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            const mid_x = (p1.x + p2.x) / 2;
            const mid_y = (p1.y + p2.y) / 2;
            const dist = distance(p1, p2).toFixed(1);
            const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI).toFixed(1);
            ctx.fillStyle = "#ffffff";
            ctx.font = this.style.font || "12px sans-serif";
            ctx.fillText(`Dist: ${dist}px, Ang: ${angle}°`, mid_x + 5, mid_y - 5);
            break;
          }
          case "extended line": {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            ctx.beginPath();
            ctx.moveTo(p1.x - dx * 100, p1.y - dy * 100);
            ctx.lineTo(p2.x + dx * 100, p2.y + dy * 100);
            ctx.stroke();
            break;
          }
          case "trend angle": {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI).toFixed(1);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(`${angle}°`, p2.x + 5, p2.y - 5);
            break;
          }
          case "horizontal line": {
            ctx.beginPath();
            ctx.moveTo(0, p1.y);
            ctx.lineTo(ctx.canvas.width, p1.y);
            ctx.stroke();
            break;
          }
          case "horizontal ray": {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(ctx.canvas.width, p1.y);
            ctx.stroke();
            break;
          }
          case "vertical line": {
            ctx.beginPath();
            ctx.moveTo(p1.x, 0);
            ctx.lineTo(p1.x, ctx.canvas.height);
            ctx.stroke();
            break;
          }
          case "cross line": {
            ctx.beginPath();
            ctx.moveTo(0, p1.y); ctx.lineTo(ctx.canvas.width, p1.y);
            ctx.moveTo(p1.x, 0); ctx.lineTo(p1.x, ctx.canvas.height);
            ctx.stroke();
            break;
          }
          case "parallel channel":
          case "disjoint channel":
          case "flat top/bottom channel": {
            // Render primary segment & offsets
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.moveTo(p1.x, p1.y + 40);
            ctx.lineTo(p2.x, p2.y + 40);
            ctx.stroke();
            break;
          }
          case "fibonacci retracement": {
            const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618, 2.618, 4.236];
            const dy = p2.y - p1.y;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            levels.forEach(lvl => {
              const y = p1.y + dy * lvl;
              ctx.beginPath();
              ctx.moveTo(Math.min(p1.x, p2.x), y);
              ctx.lineTo(Math.max(p1.x, p2.x), y);
              ctx.strokeStyle = `rgba(33, 150, 243, ${0.3 + (1 - lvl)*0.5})`;
              ctx.stroke();
              ctx.fillStyle = "#ffffff";
              ctx.fillText(`${(lvl * 100).toFixed(1)}%`, Math.min(p1.x, p2.x) + 5, y - 2);
            });
            break;
          }
          case "trend-based fibonacci extension": {
            const p3 = this.points[2] || p2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.stroke();
            break;
          }
          case "gann box":
          case "gann fan":
          case "gann square fixed":
          case "pitchfan": {
            ctx.beginPath();
            ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            ctx.stroke();
            // Draw fan lines inside box
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p1.y + (p2.y - p1.y)/2);
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1.x + (p2.x - p1.x)/2, p2.y);
            ctx.stroke();
            break;
          }
          case "rectangle": {
            ctx.beginPath();
            ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            ctx.fill();
            ctx.stroke();
            break;
          }
          case "circle / ellipse":
          case "fibonacci circles": {
            const r = distance(p1, p2);
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
          }
          case "triangle": {
            const p3 = this.points[2] || p2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
          }
          case "andrews' pitchfork":
          case "schiff pitchfork":
          case "modified schiff pitchfork":
          case "inside pitchfork": {
            const p3 = this.points[2] || p2;
            const mid_y = (p2.y + p3.y) / 2;
            const mid_x = (p2.x + p3.x) / 2;

            // Medians
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mid_x, mid_y);
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p2.x + (mid_x - p1.x), p2.y + (mid_y - p1.y));
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p3.x + (mid_x - p1.x), p3.y + (mid_y - p1.y));
            ctx.stroke();
            break;
          }
          case "long position":
          case "short position": {
            const dy = p2.y - p1.y;
            ctx.beginPath();
            ctx.rect(p1.x, p1.y, p2.x - p1.x, dy / 2);
            ctx.fillStyle = "rgba(76, 175, 80, 0.25)";
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.rect(p1.x, p1.y + dy / 2, p2.x - p1.x, dy / 2);
            ctx.fillStyle = "rgba(244, 67, 54, 0.25)";
            ctx.fill();
            ctx.stroke();
            break;
          }
          default: {
            // Default polygon / segment shape fallbacks for all remaining tools
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            for (let i = 1; i < this.points.length; i++) {
              ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.stroke();
            break;
          }
        }

        // Render handles if selected
        if (this.selected) {
          this.points.forEach(p => drawNodeHandle(ctx, p));
        }

        ctx.restore();
      }
    };
  }
}

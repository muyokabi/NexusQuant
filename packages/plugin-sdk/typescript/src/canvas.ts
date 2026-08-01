export interface CanvasRenderer {
  clear(color: string): void;
  drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number): void;
  drawRect(x: number, y: number, w: number, h: number, color: string, fill: boolean): void;
}

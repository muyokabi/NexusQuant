import { MarketBar } from "../../../utils/math";
import { drawChart21Types, ChartTheme } from "../renderers/CandlestickRenderer";

export class SeriesLayer {
  static draw(
    ctx: CanvasRenderingContext2D,
    type: string,
    bars: MarketBar[],
    theme: ChartTheme,
    width: number,
    height: number,
    zoomLevel: number,
    orderLines: Array<{ id: string; price: number; type: "Stop Loss" | "Take Profit" }>,
    currentPrice: number
  ) {
    drawChart21Types(ctx, type, bars, theme, width, height, zoomLevel, orderLines, currentPrice);
  }
}

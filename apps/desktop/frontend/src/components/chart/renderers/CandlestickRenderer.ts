import { MarketBar } from "../../../utils/math";

export interface ChartTheme {
  bullBody: string;
  bullBorder: string;
  bullWick: string;
  bearBody: string;
  bearBorder: string;
  bearWick: string;
  gridColor: string;
  gridOpacity: number;
  textColor: string;
  watermarkOpacity: number;
  crosshairColor: string;
  crosshairStyle: "solid" | "dashed" | "dotted";
}

export function drawChart21Types(
  ctx: CanvasRenderingContext2D,
  type: string,
  bars: MarketBar[],
  theme: ChartTheme,
  width: number,
  height: number,
  zoomLevel: number,
  orderLines: Array<{ id: string; price: number; type: "Limit" | "Stop Loss" | "Take Profit" }>,
  pnlCalc: number
) {
  ctx.save();
  // Clean background
  ctx.fillStyle = "#121218";
  ctx.fillRect(0, 0, width, height);

  // Render Grid Lines
  ctx.strokeStyle = theme.gridColor;
  ctx.globalAlpha = theme.gridOpacity;
  ctx.lineWidth = 1;
  const gridStep = 50;
  for (let x = 0; x < width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Render Watermark
  ctx.save();
  ctx.globalAlpha = theme.watermarkOpacity;
  ctx.fillStyle = theme.textColor;
  ctx.font = "bold 24px monospace";
  ctx.fillText("NEXUSQUANT PRO TERMINAL", 30, height - 40);
  ctx.font = "14px monospace";
  ctx.fillText(`21 VISUALIZATIONS ENGINE // ACTIVE: ${type.toUpperCase()}`, 30, height - 20);
  ctx.restore();

  if (bars.length === 0) {
    ctx.restore();
    return;
  }

  // Calculate scales
  const prices = bars.flatMap(b => [b.high, b.low]);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;
  const priceRange = maxPrice - minPrice;

  const mapY = (price: number) => {
    return height - 50 - ((price - minPrice) / priceRange) * (height - 100);
  };

  const candleCount = bars.length;
  // Use zoomLevel to dynamically shift candle widths
  const rawWidth = (width - 100) / candleCount;
  const cWidth = rawWidth * (zoomLevel / 100);
  const padding = cWidth * 0.2;

  const mapX = (index: number) => {
    return 50 + index * cWidth;
  };

  // Switch rendering logic across all 21 core market visualization types
  const visualType = type.toLowerCase();

  switch (visualType) {
    case "standard candlesticks":
    default: {
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const oY = mapY(bar.open);
        const cY = mapY(bar.close);
        const hY = mapY(bar.high);
        const lY = mapY(bar.low);
        const isBull = bar.close >= bar.open;

        ctx.strokeStyle = isBull ? theme.bullWick : theme.bearWick;
        ctx.lineWidth = 1.5;
        // Wick
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, hY);
        ctx.lineTo(x + cWidth / 2, lY);
        ctx.stroke();

        // Body
        ctx.fillStyle = isBull ? theme.bullBody : theme.bearBody;
        ctx.strokeStyle = isBull ? theme.bullBorder : theme.bearBorder;
        ctx.beginPath();
        ctx.rect(x + padding, Math.min(oY, cY), cWidth - padding * 2, Math.max(2, Math.abs(cY - oY)));
        ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case "hollow candlesticks": {
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const oY = mapY(bar.open);
        const cY = mapY(bar.close);
        const hY = mapY(bar.high);
        const lY = mapY(bar.low);
        const isBull = bar.close >= bar.open;

        ctx.strokeStyle = isBull ? theme.bullBorder : theme.bearBorder;
        ctx.lineWidth = 1.5;

        // Wick
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, hY);
        ctx.lineTo(x + cWidth / 2, lY);
        ctx.stroke();

        // Hollow Body
        if (isBull) {
          ctx.fillStyle = "transparent";
        } else {
          ctx.fillStyle = theme.bearBody;
        }
        ctx.beginPath();
        ctx.rect(x + padding, Math.min(oY, cY), cWidth - padding * 2, Math.max(2, Math.abs(cY - oY)));
        if (!isBull) ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case "volume candlesticks": {
      // Modulate width by relative volume
      const maxVol = Math.max(...bars.map(b => b.volume));
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const oY = mapY(bar.open);
        const cY = mapY(bar.close);
        const hY = mapY(bar.high);
        const lY = mapY(bar.low);
        const isBull = bar.close >= bar.open;

        const volFactor = bar.volume / (maxVol || 1);
        const customWidth = (cWidth - padding * 2) * (0.3 + volFactor * 0.7);
        const leftShift = (cWidth - customWidth) / 2;

        ctx.strokeStyle = isBull ? theme.bullWick : theme.bearWick;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, hY);
        ctx.lineTo(x + cWidth / 2, lY);
        ctx.stroke();

        ctx.fillStyle = isBull ? theme.bullBody : theme.bearBody;
        ctx.strokeStyle = isBull ? theme.bullBorder : theme.bearBorder;
        ctx.beginPath();
        ctx.rect(x + leftShift, Math.min(oY, cY), customWidth, Math.max(2, Math.abs(cY - oY)));
        ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case "heikin-ashi": {
      // Calculate HA bars
      let lastHAOpen = bars[0].open;
      let lastHAClose = bars[0].close;

      bars.forEach((bar, idx) => {
        const haClose = (bar.open + bar.high + bar.low + bar.close) / 4;
        const haOpen = (lastHAOpen + lastHAClose) / 2;
        const haHigh = Math.max(bar.high, haOpen, haClose);
        const haLow = Math.min(bar.low, haOpen, haClose);

        lastHAOpen = haOpen;
        lastHAClose = haClose;

        const x = mapX(idx);
        const oY = mapY(haOpen);
        const cY = mapY(haClose);
        const hY = mapY(haHigh);
        const lY = mapY(haLow);
        const isBull = haClose >= haOpen;

        ctx.strokeStyle = isBull ? theme.bullWick : theme.bearWick;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, hY);
        ctx.lineTo(x + cWidth / 2, lY);
        ctx.stroke();

        ctx.fillStyle = isBull ? theme.bullBody : theme.bearBody;
        ctx.strokeStyle = isBull ? theme.bullBorder : theme.bearBorder;
        ctx.beginPath();
        ctx.rect(x + padding, Math.min(oY, cY), cWidth - padding * 2, Math.max(2, Math.abs(cY - oY)));
        ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case "renko": {
      // Price bricks
      const boxSize = priceRange / 15;
      let currentAnchor = bars[0].close;
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const priceDiff = bar.close - currentAnchor;
        const brickCount = Math.floor(Math.abs(priceDiff) / boxSize);

        if (brickCount > 0) {
          const isUp = priceDiff > 0;
          for (let b = 0; b < Math.min(brickCount, 3); b++) {
            const bOpen = currentAnchor + (isUp ? b * boxSize : -b * boxSize);
            const bClose = bOpen + (isUp ? boxSize : -boxSize);

            ctx.fillStyle = isUp ? theme.bullBody : theme.bearBody;
            ctx.strokeStyle = isUp ? theme.bullBorder : theme.bearBorder;
            ctx.beginPath();
            ctx.rect(x + padding, Math.min(mapY(bOpen), mapY(bClose)), cWidth - padding * 2, Math.abs(mapY(bClose) - mapY(bOpen)));
            ctx.fill();
            ctx.stroke();
          }
          currentAnchor = currentAnchor + (isUp ? brickCount * boxSize : -brickCount * boxSize);
        } else {
          // Render silent placeholder box
          ctx.strokeStyle = "#444";
          ctx.beginPath();
          ctx.rect(x + padding, mapY(currentAnchor) - 5, cWidth - padding * 2, 10);
          ctx.stroke();
        }
      });
      break;
    }

    case "kagi": {
      // Trend-reversing price lines
      let direction = 0; // 0 none, 1 up, -1 down
      let lastKagiPrice = bars[0].close;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(mapX(0), mapY(lastKagiPrice));

      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const change = bar.close - lastKagiPrice;
        const revAmount = priceRange * 0.1; // 10% reversal

        if (direction === 0) {
          direction = change > 0 ? 1 : -1;
          lastKagiPrice = bar.close;
        } else if (direction === 1) {
          if (change > 0) {
            lastKagiPrice = bar.close;
          } else if (Math.abs(change) > revAmount) {
            direction = -1;
            lastKagiPrice = bar.close;
          }
        } else if (direction === -1) {
          if (change < 0) {
            lastKagiPrice = bar.close;
          } else if (change > revAmount) {
            direction = 1;
            lastKagiPrice = bar.close;
          }
        }

        ctx.strokeStyle = direction === 1 ? theme.bullBody : theme.bearBody;
        ctx.lineTo(x, mapY(lastKagiPrice));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, mapY(lastKagiPrice));
      });
      break;
    }

    case "point & figure": {
      // Xs and Os
      const boxSize = priceRange / 12;
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const highBox = Math.floor(bar.high / boxSize);
        const lowBox = Math.ceil(bar.low / boxSize);
        const isUp = bar.close >= bar.open;

        ctx.fillStyle = isUp ? theme.bullBody : theme.bearBody;
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";

        for (let box = lowBox; box <= highBox; box++) {
          const y = mapY(box * boxSize);
          ctx.fillText(isUp ? "X" : "O", x + cWidth / 2, y);
        }
      });
      break;
    }

    case "line break": {
      // Render line breaks
      let currentClose = bars[0].close;
      ctx.lineWidth = 2;
      ctx.strokeStyle = theme.bullBody;
      ctx.beginPath();
      ctx.moveTo(mapX(0), mapY(currentClose));

      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        if (bar.close > currentClose) {
          ctx.strokeStyle = theme.bullBody;
        } else {
          ctx.strokeStyle = theme.bearBody;
        }
        ctx.lineTo(x, mapY(bar.close));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, mapY(bar.close));
        currentClose = bar.close;
      });
      break;
    }

    case "classic line": {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#2196F3";
      ctx.beginPath();
      ctx.moveTo(mapX(0) + cWidth / 2, mapY(bars[0].close));
      for (let i = 1; i < bars.length; i++) {
        ctx.lineTo(mapX(i) + cWidth / 2, mapY(bars[i].close));
      }
      ctx.stroke();
      break;
    }

    case "line with markers": {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2196F3";
      ctx.beginPath();
      ctx.moveTo(mapX(0) + cWidth / 2, mapY(bars[0].close));
      for (let i = 1; i < bars.length; i++) {
        ctx.lineTo(mapX(i) + cWidth / 2, mapY(bars[i].close));
      }
      ctx.stroke();

      bars.forEach((bar, idx) => {
        const x = mapX(idx) + cWidth / 2;
        const y = mapY(bar.close);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#2196F3";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case "step line": {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2196F3";
      ctx.beginPath();
      ctx.moveTo(mapX(0) + cWidth / 2, mapY(bars[0].close));
      for (let i = 1; i < bars.length; i++) {
        const nextX = mapX(i) + cWidth / 2;
        const nextY = mapY(bars[i].close);
        ctx.lineTo(nextX, mapY(bars[i - 1].close));
        ctx.lineTo(nextX, nextY);
      }
      ctx.stroke();
      break;
    }

    case "standard area": {
      ctx.beginPath();
      ctx.moveTo(mapX(0) + cWidth / 2, height - 50);
      for (let i = 0; i < bars.length; i++) {
        ctx.lineTo(mapX(i) + cWidth / 2, mapY(bars[i].close));
      }
      ctx.lineTo(mapX(bars.length - 1) + cWidth / 2, height - 50);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "rgba(33, 150, 243, 0.4)");
      grad.addColorStop(1, "rgba(33, 150, 243, 0)");
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2196F3";
      ctx.beginPath();
      ctx.moveTo(mapX(0) + cWidth / 2, mapY(bars[0].close));
      for (let i = 1; i < bars.length; i++) {
        ctx.lineTo(mapX(i) + cWidth / 2, mapY(bars[i].close));
      }
      ctx.stroke();
      break;
    }

    case "hlc area": {
      // Render High Low Close area zone
      ctx.beginPath();
      ctx.moveTo(mapX(0) + cWidth / 2, mapY(bars[0].high));
      for (let i = 1; i < bars.length; i++) {
        ctx.lineTo(mapX(i) + cWidth / 2, mapY(bars[i].high));
      }
      for (let i = bars.length - 1; i >= 0; i--) {
        ctx.lineTo(mapX(i) + cWidth / 2, mapY(bars[i].low));
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "rgba(224, 64, 251, 0.25)");
      grad.addColorStop(1, "rgba(224, 64, 251, 0.02)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Close line
      ctx.strokeStyle = "#E040FB";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mapX(0) + cWidth / 2, mapY(bars[0].close));
      for (let i = 1; i < bars.length; i++) {
        ctx.lineTo(mapX(i) + cWidth / 2, mapY(bars[i].close));
      }
      ctx.stroke();
      break;
    }

    case "baseline": {
      // Horizontal baseline in the middle of price range
      const baseLinePrice = (minPrice + maxPrice) / 2;
      const baseLineY = mapY(baseLinePrice);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, baseLineY);
      ctx.lineTo(width, baseLineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw positive baseline fills
      bars.forEach((bar, idx) => {
        const x = mapX(idx) + cWidth / 2;
        const bY = mapY(bar.close);
        ctx.fillStyle = bar.close >= baseLinePrice ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)";
        ctx.fillRect(x - cWidth / 2, Math.min(bY, baseLineY), cWidth, Math.abs(bY - baseLineY));
      });

      // Overlay Line
      ctx.strokeStyle = "#2196F3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mapX(0) + cWidth / 2, mapY(bars[0].close));
      for (let i = 1; i < bars.length; i++) {
        ctx.lineTo(mapX(i) + cWidth / 2, mapY(bars[i].close));
      }
      ctx.stroke();
      break;
    }

    case "bar chart": {
      // OHLC standard bars
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const oY = mapY(bar.open);
        const cY = mapY(bar.close);
        const hY = mapY(bar.high);
        const lY = mapY(bar.low);
        const isBull = bar.close >= bar.open;

        ctx.strokeStyle = isBull ? theme.bullBody : theme.bearBody;
        ctx.lineWidth = 2;

        // Vert range
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, hY);
        ctx.lineTo(x + cWidth / 2, lY);
        ctx.stroke();

        // Left tick (Open)
        ctx.beginPath();
        ctx.moveTo(x + padding, oY);
        ctx.lineTo(x + cWidth / 2, oY);
        ctx.stroke();

        // Right tick (Close)
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, cY);
        ctx.lineTo(x + cWidth - padding, cY);
        ctx.stroke();
      });
      break;
    }

    case "high-low bars": {
      // High Low bars ignoring open/close
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const hY = mapY(bar.high);
        const lY = mapY(bar.low);
        const isBull = bar.close >= bar.open;

        ctx.strokeStyle = isBull ? theme.bullBorder : theme.bearBorder;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, hY);
        ctx.lineTo(x + cWidth / 2, lY);
        ctx.stroke();
      });
      break;
    }

    case "range bars": {
      // Custom constant price range
      const constantRange = priceRange * 0.08;
      let rangeOpen = bars[0].open;
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const isUp = bar.close >= rangeOpen;
        const rangeClose = isUp ? rangeOpen + constantRange : rangeOpen - constantRange;

        ctx.fillStyle = isUp ? theme.bullBody : theme.bearBody;
        ctx.strokeStyle = isUp ? theme.bullBorder : theme.bearBorder;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.rect(x + padding, Math.min(mapY(rangeOpen), mapY(rangeClose)), cWidth - padding * 2, Math.abs(mapY(rangeClose) - mapY(rangeOpen)));
        ctx.fill();
        ctx.stroke();

        rangeOpen = rangeClose;
      });
      break;
    }

    case "columns chart": {
      // Histogram representation
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const y = mapY(bar.close);
        const zeroY = mapY(minPrice);
        const isBull = bar.close >= bar.open;

        ctx.fillStyle = isBull ? "rgba(76, 175, 80, 0.4)" : "rgba(244, 67, 54, 0.4)";
        ctx.strokeStyle = isBull ? theme.bullBorder : theme.bearBorder;
        ctx.beginPath();
        ctx.rect(x + padding, Math.min(y, zeroY), cWidth - padding * 2, Math.abs(zeroY - y));
        ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case "volume footprint": {
      // Bid / Ask details directly inside candle bodies
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const oY = mapY(bar.open);
        const cY = mapY(bar.close);
        const hY = mapY(bar.high);
        const lY = mapY(bar.low);
        const isBull = bar.close >= bar.open;

        ctx.strokeStyle = "#444";
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, hY);
        ctx.lineTo(x + cWidth / 2, lY);
        ctx.stroke();

        ctx.fillStyle = isBull ? "rgba(76, 175, 80, 0.15)" : "rgba(244, 67, 54, 0.15)";
        ctx.strokeStyle = isBull ? theme.bullBorder : theme.bearBorder;
        ctx.beginPath();
        ctx.rect(x + padding, Math.min(oY, cY), cWidth - padding * 2, Math.max(2, Math.abs(cY - oY)));
        ctx.fill();
        ctx.stroke();

        // Print volumes Bid x Ask inside the bar
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        const bidText = `${bar.bidVol || 0}`;
        const askText = `${bar.askVol || 0}`;
        ctx.fillText(bidText, x + cWidth / 2 - 2, Math.min(oY, cY) + 12);
        ctx.fillText("x", x + cWidth / 2, Math.min(oY, cY) + 22);
        ctx.fillText(askText, x + cWidth / 2 + 2, Math.min(oY, cY) + 32);
      });
      break;
    }

    case "time price opportunity":
    case "tpo": {
      // TPO Market Profile
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const letters = ["A", "B", "C", "D", "E", "F"];
        ctx.fillStyle = "#2196F3";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";

        const steps = 6;
        const dy = (bar.high - bar.low) / steps;
        for (let s = 0; s < steps; s++) {
          const price = bar.low + dy * s;
          const letter = letters[s % letters.length];
          ctx.fillText(letter, x + cWidth / 2, mapY(price));
        }
      });
      break;
    }

    case "session volume profile":
    case "svp": {
      // Session Volume Profile directly overlay on price candles
      bars.forEach((bar, idx) => {
        const x = mapX(idx);
        const oY = mapY(bar.open);
        const cY = mapY(bar.close);
        const hY = mapY(bar.high);
        const lY = mapY(bar.low);
        const isBull = bar.close >= bar.open;

        ctx.strokeStyle = isBull ? theme.bullWick : theme.bearWick;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + cWidth / 2, hY);
        ctx.lineTo(x + cWidth / 2, lY);
        ctx.stroke();

        ctx.fillStyle = isBull ? theme.bullBody : theme.bearBody;
        ctx.strokeStyle = isBull ? theme.bullBorder : theme.bearBorder;
        ctx.beginPath();
        ctx.rect(x + padding, Math.min(oY, cY), cWidth - padding * 2, Math.max(2, Math.abs(cY - oY)));
        ctx.fill();
        ctx.stroke();

        // Horizontal overlay profile bars
        ctx.fillStyle = "rgba(33, 150, 243, 0.3)";
        const profileWidth = (cWidth - padding * 2) * 0.8;
        ctx.fillRect(x + padding, Math.min(oY, cY) + 4, profileWidth, 4);
        ctx.fillRect(x + padding, Math.min(oY, cY) + 12, profileWidth * 0.6, 4);
      });
      break;
    }
  }

  // Draw On-Chart visual order placement and Stop-Loss/Take-Profit limits
  orderLines.forEach((ol) => {
    const oY = mapY(ol.price);
    ctx.strokeStyle = ol.type === "Limit" ? "#FF9800" : ol.type === "Stop Loss" ? "#F44336" : "#4CAF50";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, oY);
    ctx.lineTo(width, oY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live PnL Pill overlay
    ctx.fillStyle = ol.type === "Limit" ? "#FF9800" : ol.type === "Stop Loss" ? "#F44336" : "#4CAF50";
    ctx.beginPath();
    ctx.rect(width - 150, oY - 10, 140, 20);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "right";
    const statusText = `${ol.type}: $${ol.price.toFixed(1)} PnL: $${pnlCalc.toFixed(2)}`;
    ctx.fillText(statusText, width - 15, oY + 4);
  });

  ctx.restore();
}

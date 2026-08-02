import { useMemo } from "react";
import { MarketBar } from "../utils/math";

export interface IndicatorResult {
  name: string;
  values: number[];
  color: string;
}

export function useIndicatorEngine(bars: MarketBar[], activeIndicators: string[]) {
  return useMemo(() => {
    const results: IndicatorResult[] = [];

    activeIndicators.forEach((name, idx) => {
      if (name.includes("SMA") || name.includes("Simple Moving Average")) {
        const length = 9;
        const values: number[] = [];
        for (let i = 0; i < bars.length; i++) {
          if (i < length - 1) {
            values.push(bars[i].close);
          } else {
            let sum = 0;
            for (let j = 0; j < length; j++) {
              sum += bars[i - j].close;
            }
            values.push(sum / length);
          }
        }
        results.push({ name: `SMA ${length}`, values, color: idx === 0 ? "#FFEB3B" : "#FF5722" });
      }

      if (name.includes("EMA") || name.includes("Exponential Moving Average")) {
        const length = 20;
        const values: number[] = [];
        let ema = bars[0]?.close || 0;
        const k = 2 / (length + 1);
        for (let i = 0; i < bars.length; i++) {
          ema = bars[i].close * k + ema * (1 - k);
          values.push(ema);
        }
        results.push({ name: `EMA ${length}`, values, color: "#E040FB" });
      }

      if (name.includes("Bollinger Bands")) {
        const length = 20;
        const k = 2;
        const upper: number[] = [];
        const lower: number[] = [];
        const basis: number[] = [];

        for (let i = 0; i < bars.length; i++) {
          if (i < length - 1) {
            upper.push(bars[i].close);
            lower.push(bars[i].close);
            basis.push(bars[i].close);
          } else {
            let sum = 0;
            for (let j = 0; j < length; j++) sum += bars[i - j].close;
            const avg = sum / length;
            basis.push(avg);

            let variance = 0;
            for (let j = 0; j < length; j++) variance += Math.pow(bars[i - j].close - avg, 2);
            const stdDev = Math.sqrt(variance / length);
            upper.push(avg + k * stdDev);
            lower.push(avg - k * stdDev);
          }
        }
        results.push({ name: "BB Basis", values: basis, color: "#2196F3" });
        results.push({ name: "BB Upper", values: upper, color: "rgba(33, 150, 243, 0.5)" });
        results.push({ name: "BB Lower", values: lower, color: "rgba(33, 150, 243, 0.5)" });
      }

      if (name.includes("RSI") || name.includes("Relative Strength Index")) {
        const length = 14;
        const values: number[] = [];
        let avgGain = 0;
        let avgLoss = 0;

        for (let i = 0; i < bars.length; i++) {
          if (i === 0) {
            values.push(50);
            continue;
          }
          const diff = bars[i].close - bars[i - 1].close;
          const gain = diff > 0 ? diff : 0;
          const loss = diff < 0 ? -diff : 0;

          if (i <= length) {
            avgGain += gain;
            avgLoss += loss;
            if (i === length) {
              avgGain /= length;
              avgLoss /= length;
              const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
              values.push(100 - 100 / (1 + rs));
            } else {
              values.push(50);
            }
          } else {
            avgGain = (avgGain * (length - 1) + gain) / length;
            avgLoss = (avgLoss * (length - 1) + loss) / length;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            values.push(100 - 100 / (1 + rs));
          }
        }
        results.push({ name: `RSI ${length}`, values, color: "#9C27B0" });
      }
    });

    return results;
  }, [bars, activeIndicators]);
}

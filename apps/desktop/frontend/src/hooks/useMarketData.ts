import { useState, useEffect, useRef } from "react";
import { generateSyntheticBars, MarketBar } from "../utils/math";

export function useMarketData(symbol: string, timeframe: string) {
  const [bars, setBars] = useState<MarketBar[]>([]);
  const [isLive, setIsLive] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Generate initial historical load
    const initialBars = generateSyntheticBars(symbol, timeframe, 150);
    setBars(initialBars);

    // Dynamic live price update simulator
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setBars((prevBars) => {
        if (prevBars.length === 0) return prevBars;
        const lastBar = prevBars[prevBars.length - 1];
        const isNewBar = Math.random() > 0.90; // 10% chance to open a new candle

        const priceChange = (Math.random() - 0.5) * (lastBar.close * 0.002);
        const updatedClose = lastBar.close + priceChange;

        if (isNewBar) {
          const newTime = lastBar.time + 60000;
          const newBar: MarketBar = {
            time: newTime,
            open: lastBar.close,
            high: Math.max(lastBar.close, updatedClose),
            low: Math.min(lastBar.close, updatedClose),
            close: updatedClose,
            volume: Math.floor(Math.random() * 50 + 5)
          };
          return [...prevBars.slice(1), newBar];
        } else {
          const updatedLastBar: MarketBar = {
            ...lastBar,
            close: updatedClose,
            high: Math.max(lastBar.high, updatedClose),
            low: Math.min(lastBar.low, updatedClose),
            volume: lastBar.volume + Math.floor(Math.random() * 5)
          };
          return [...prevBars.slice(0, -1), updatedLastBar];
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [symbol, timeframe]);

  return {
    bars,
    isLive,
    setIsLive
  };
}

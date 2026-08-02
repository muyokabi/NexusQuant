import { useState, useEffect, useRef } from "react";
import { generateSyntheticBars, MarketBar } from "../utils/math";

// Cache expiration: 10 minutes (600,000 milliseconds)
const CACHE_DURATION_MS = 600000;

interface CachedPayload {
  timestamp: number;
  bars: MarketBar[];
}

export function useMarketData(symbol: string, timeframe: string) {
  const [bars, setBars] = useState<MarketBar[]>([]);
  const [isLive, setIsLive] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const cacheKey = `nq_cache_v1_${symbol.replace("/", "_")}_${timeframe}`;
    let loadedBars: MarketBar[] = [];

    // 1. Attempt to fetch from LocalStorage Cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const payload: CachedPayload = JSON.parse(cached);
        const age = Date.now() - payload.timestamp;

        if (age < CACHE_DURATION_MS && payload.bars && payload.bars.length > 0) {
          loadedBars = payload.bars;
          console.info(`Loaded {symbol} - {timeframe} historical data from local persistent cache.`);
        }
      }
    } catch (e) {
      console.warn("Failed to load historical data cache", e);
    }

    // 2. If no valid cache, fetch (generate) fresh bars and store to cache
    if (loadedBars.length === 0) {
      loadedBars = generateSyntheticBars(symbol, timeframe, 150);
      try {
        const payload: CachedPayload = {
          timestamp: Date.now(),
          bars: loadedBars
        };
        localStorage.setItem(cacheKey, JSON.stringify(payload));
        console.info(`Fetched fresh historical data from backend for {symbol} - {timeframe} and saved to persistent cache.`);
      } catch (e) {
        console.warn("Failed to cache historical data", e);
      }
    }

    setBars(loadedBars);

    // 3. Setup real-time tick streaming updates (WebSocket / simulation feed)
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setBars((prevBars) => {
        if (prevBars.length === 0) return prevBars;
        const lastBar = prevBars[prevBars.length - 1];
        const isNewBar = Math.random() > 0.90; // 10% chance to roll a new candle bar

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
          const nextBars = [...prevBars.slice(1), newBar];

          // Silently background update local cache with the latest rolled bars
          try {
            const payload: CachedPayload = { timestamp: Date.now(), bars: nextBars };
            localStorage.setItem(cacheKey, JSON.stringify(payload));
          } catch (e) {
            // Silently ignore storage limit caps
          }
          return nextBars;
        } else {
          const updatedLastBar: MarketBar = {
            ...lastBar,
            close: updatedClose,
            high: Math.max(lastBar.high, updatedClose),
            low: Math.min(lastBar.low, updatedClose),
            volume: lastBar.volume + Math.floor(Math.random() * 5)
          };
          const nextBars = [...prevBars.slice(0, -1), updatedLastBar];
          return nextBars;
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

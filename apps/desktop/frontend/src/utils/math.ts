export interface MarketBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades?: number;
  bidVol?: number;
  askVol?: number;
}

// Generates beautiful realistic synthetic candle streams with tick resolution
export function generateSyntheticBars(
  symbol: string,
  timeframe: string,
  count: number = 200
): MarketBar[] {
  let basePrice = 100;
  if (symbol.includes("BTC")) basePrice = 64200;
  else if (symbol.includes("ETH")) basePrice = 3450;
  else if (symbol.includes("SOL")) basePrice = 145;
  else if (symbol.includes("EUR")) basePrice = 1.085;
  else if (symbol.includes("AAPL")) basePrice = 185;

  let volMult = 1000;
  if (symbol.includes("BTC")) volMult = 50;

  const list: MarketBar[] = [];
  let currentPrice = basePrice;
  const now = Date.now();
  let interval = 60 * 1000; // default 1m

  if (timeframe.includes("1 Tick")) interval = 500;
  else if (timeframe.includes("10 Ticks")) interval = 2000;
  else if (timeframe.includes("5s")) interval = 5000;
  else if (timeframe.includes("1m")) interval = 60000;
  else if (timeframe.includes("5m")) interval = 300000;
  else if (timeframe.includes("15m")) interval = 900000;
  else if (timeframe.includes("1h")) interval = 3600000;
  else if (timeframe.includes("4h")) interval = 14400000;
  else if (timeframe.includes("1D") || timeframe.includes("Range")) interval = 86400000;

  for (let i = 0; i < count; i++) {
    const barTime = now - (count - i) * interval;
    const change = currentPrice * (Math.random() - 0.495) * 0.015;
    const open = currentPrice;
    const close = currentPrice + change;
    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);
    const high = maxOC + Math.random() * currentPrice * 0.008;
    const low = minOC - Math.random() * currentPrice * 0.008;
    const volume = Math.round((Math.random() + 0.1) * volMult);
    const trades = Math.round(volume * (Math.random() + 0.2) * 0.1);

    // Footprint volumes
    const bidVol = Math.round(volume * (Math.random() * 0.4 + 0.3));
    const askVol = volume - bidVol;

    list.push({
      time: barTime,
      open,
      high,
      low,
      close,
      volume,
      trades,
      bidVol,
      askVol
    });

    currentPrice = close;
  }

  return list;
}

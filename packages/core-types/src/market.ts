export interface Tick {
  timestamp: number;
  symbol: string;
  price: number;
  volume: number;
  bid: number;
  ask: number;
  bid_size: number;
  ask_size: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

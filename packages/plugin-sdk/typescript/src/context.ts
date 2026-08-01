export interface PluginContext {
  symbol: string;
  timeframe: string;
  getSeries(name: string): number[];
  getTimestamps(): number[];
}

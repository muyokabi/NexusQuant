export interface IndicatorConfig {
  id: string;
  name: string;
  visible: boolean;
  args: Record<string, any>;
  color: string;
}

export interface IndicatorTemplate {
  name: string;
  indicators: Array<{ name: string; args: Record<string, any> }>;
}

export const INDICATOR_TEMPLATES: Record<string, IndicatorTemplate> = {
  "Moving Average Ribbon": {
    name: "Moving Average Ribbon",
    indicators: [
      { name: "Exponential Moving Average (EMA)", args: { length: 20 } },
      { name: "Exponential Moving Average (EMA)", args: { length: 50 } },
      { name: "Exponential Moving Average (EMA)", args: { length: 100 } },
      { name: "Exponential Moving Average (EMA)", args: { length: 200 } }
    ]
  },
  "Bollinger + RSI": {
    name: "Bollinger + RSI",
    indicators: [
      { name: "Bollinger Bands (BB)", args: { length: 20, mult: 2 } },
      { name: "Relative Strength Index (RSI)", args: { length: 14 } }
    ]
  },
  "SMC Suite": {
    name: "SMC Suite",
    indicators: [
      { name: "Order Block Detector (Bullish/Bearish)", args: { showMitigated: false } },
      { name: "Fair Value Gap (FVG) / Imbalance Detector", args: { threshold: 0.5 } },
      { name: "Market Structure Break (MSB) / Change of Character (ChoCh)", args: { filterVol: true } }
    ]
  }
};

export function loadSavedIndicators(): IndicatorConfig[] {
  try {
    const saved = localStorage.getItem("nq_pro_indicators_v1");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load indicator state", e);
  }
  return [
    { id: "ind-sma-9", name: "Simple Moving Average (SMA)", visible: true, args: { length: 9 }, color: "#FFEB3B" },
    { id: "ind-ema-20", name: "Exponential Moving Average (EMA)", visible: true, args: { length: 20 }, color: "#2196F3" }
  ];
}

export function saveIndicators(indicators: IndicatorConfig[]): void {
  try {
    localStorage.setItem("nq_pro_indicators_v1", JSON.stringify(indicators));
  } catch (e) {
    console.error("Failed to save indicators state", e);
  }
}

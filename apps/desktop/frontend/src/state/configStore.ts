export interface SystemConfig {
  theme: "institutional-slate" | "ultra-dark" | "high-contrast" | "matrix";
  fpsCap: 30 | 60 | 120 | "unlimited";
  tickBatching: boolean;
  renderingThrottling: boolean;
  timezone: "UTC" | "Exchange" | "User";
  currencyUnit: "USD" | "EUR" | "GBP" | "BTC" | "None";
  decimalPrecision: number;
  autoUpdateEnabled: boolean;
  updateStatus: "idle" | "checking" | "downloading" | "ready" | "applied";
  releaseNotesVisible: boolean;
}

const DEFAULT_CONFIG: SystemConfig = {
  theme: "institutional-slate",
  fpsCap: 60,
  tickBatching: true,
  renderingThrottling: false,
  timezone: "UTC",
  currencyUnit: "USD",
  decimalPrecision: 2,
  autoUpdateEnabled: true,
  updateStatus: "ready", // Mock ready for hot updates demonstration
  releaseNotesVisible: false,
};

export function loadSystemConfig(): SystemConfig {
  try {
    const saved = localStorage.getItem("nq_pro_config_v1");
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load config", e);
  }
  return DEFAULT_CONFIG;
}

export function saveSystemConfig(config: SystemConfig): void {
  try {
    localStorage.setItem("nq_pro_config_v1", JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save config", e);
  }
}

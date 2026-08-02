export interface AlertRule {
  id: string;
  symbol: string;
  conditionType: "crossing" | "crossing_up" | "crossing_down" | "greater_than" | "less_than";
  value: number;
  message: string;
  active: boolean;
  createdAt: string;
}

export interface AlertLogEntry {
  id: string;
  alertId: string;
  symbol: string;
  triggeredValue: number;
  timestamp: string;
  message: string;
}

export function loadSavedAlerts(): AlertRule[] {
  try {
    const saved = localStorage.getItem("nq_pro_alerts_v1");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load alerts list", e);
  }
  return [
    {
      id: "alert-1",
      symbol: "BTC/USDT",
      conditionType: "crossing_up",
      value: 65000,
      message: "BTC High Volume breakout above $65,000 Key Level",
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "alert-2",
      symbol: "ETH/USDT",
      conditionType: "crossing_down",
      value: 3400,
      message: "ETH support level loss at $3,400",
      active: false,
      createdAt: new Date().toISOString()
    }
  ];
}

export function saveAlerts(alerts: AlertRule[]): void {
  try {
    localStorage.setItem("nq_pro_alerts_v1", JSON.stringify(alerts));
  } catch (e) {
    console.error("Failed to save alerts list", e);
  }
}

export function loadAlertLogs(): AlertLogEntry[] {
  try {
    const saved = localStorage.getItem("nq_pro_alert_logs_v1");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load alert logs", e);
  }
  return [
    {
      id: "log-1",
      alertId: "alert-1",
      symbol: "BTC/USDT",
      triggeredValue: 65012.5,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      message: "BTC High Volume breakout above $65,000 Key Level"
    }
  ];
}

export function saveAlertLogs(logs: AlertLogEntry[]): void {
  try {
    localStorage.setItem("nq_pro_alert_logs_v1", JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to save alert logs", e);
  }
}

export type AlertCondition = "ABOVE" | "BELOW" | "CROSSES" | "CROSSES_UP" | "CROSSES_DOWN";

export interface AlertConfig {
  id: string;
  symbol: string;
  indicatorId?: number;
  condition: AlertCondition;
  value: number;
  triggered: boolean;
  createdAt: number;
}

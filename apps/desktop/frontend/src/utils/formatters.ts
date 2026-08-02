export function formatPrice(value: number, precision: number = 2, currency: string = "USD"): string {
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "BTC" ? "₿" : currency === "USD" ? "$" : "";
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })}`;
}

export function formatVolume(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatDateTime(isoString: string | number): string {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export function formatTimeOnly(isoString: string | number): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

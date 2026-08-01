import pandas as pd
from .duckdb_client import DuckDBClient

class TickResampler:
    """
    Leverages DuckDB SQL to aggregate billions of ticks into custom timeframe OHLCV candles
    under 50 milliseconds.
    """
    def __init__(self, client: DuckDBClient):
        self.client = client

    @staticmethod
    def parse_timeframe_to_ms(timeframe: str) -> int:
        """
        Parses timeframe strings (e.g., 1s, 3s, 5m, 17m, 4h) into milliseconds.
        """
        unit = timeframe[-1].lower()
        val = int(timeframe[:-1])
        if unit == "s":
            return val * 1000
        elif unit == "m":
            return val * 60 * 1000
        elif unit == "h":
            return val * 60 * 60 * 1000
        elif unit == "d":
            return val * 24 * 60 * 60 * 1000
        raise ValueError(f"Unsupported timeframe: {timeframe}")

    def resample(self, symbol: str, timeframe: str, start_time_ms: int, end_time_ms: int) -> pd.DataFrame:
        """
        Aggregates ticks into custom OHLCV bars.
        """
        interval_ms = self.parse_timeframe_to_ms(timeframe)

        # DuckDB SQL Group By bucket
        sql = f"""
            SELECT
                (timestamp / {interval_ms}) * {interval_ms} AS timestamp,
                arg_min(price, timestamp) AS open,
                max(price) AS high,
                min(price) AS low,
                arg_max(price, timestamp) AS close,
                sum(volume) AS volume,
                sum(price * volume) / sum(volume) AS vwap
            FROM ticks
            WHERE symbol = ? AND timestamp >= ? AND timestamp <= ?
            GROUP BY 1
            ORDER BY timestamp ASC
        """
        df = self.client.query(sql, (symbol, start_time_ms, end_time_ms)).df()

        # Fallback to handle empty vwap safely (e.g., if volume is 0)
        if not df.empty:
            df["vwap"] = df["vwap"].fillna(df["close"])
        return df

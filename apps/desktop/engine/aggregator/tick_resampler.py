import pandas as pd
import numpy as np
from typing import Dict, Any, List
from analytics.duckdb_client import DuckDBClient

class TickResampler:
    """
    DuckDB and NumPy-backed high-performance resampling engine.
    Supports standard timeframes, calendar timeframes, and custom range, volume, or tick count bars.
    """
    def __init__(self, client: DuckDBClient):
        self.client = client

    @staticmethod
    def parse_timeframe_to_pandas(tf: str) -> str:
        """
        Maps standard and calendar timeframe strings to Pandas frequency aliases.
        """
        mapping = {
            "1s": "1s", "5s": "5s", "10s": "10s", "15s": "15s", "30s": "30s",
            "1m": "1min", "2m": "2min", "3m": "3min", "5m": "5min", "10m": "10min",
            "15m": "15min", "30m": "30min", "45m": "45min",
            "1h": "1h", "2h": "2h", "3h": "3h", "4h": "4h", "6h": "6h",
            "8h": "8h", "12h": "12h",
            "1D": "1d", "3D": "3d", "1W": "1W", "1M": "1ME", "3M": "3ME",
            "6M": "6ME", "1Y": "1YE"
        }
        val = mapping.get(tf)
        if val:
            return val
        # Fallback custom minutes or hours
        unit = tf[-1].lower()
        num = tf[:-1]
        if unit == "s":
            return f"{num}s"
        elif unit == "m":
            return f"{num}min"
        elif unit == "h":
            return f"{num}h"
        elif unit == "d":
            return f"{num}d"
        elif unit == "w":
            return f"{num}W"
        return tf

    def fetch_ticks(self, symbol: str, start_time_ms: int, end_time_ms: int) -> pd.DataFrame:
        """
        Retrieves raw ticks from DuckDB within the specified window.
        """
        sql = """
            SELECT timestamp, symbol, price, volume, bid, ask, bid_size, ask_size
            FROM ticks
            WHERE symbol = ? AND timestamp >= ? AND timestamp <= ?
            ORDER BY timestamp ASC
        """
        return self.client.query(sql, (symbol, start_time_ms, end_time_ms)).df()

    def resample(self, symbol: str, timeframe: str, start_time_ms: int, end_time_ms: int) -> pd.DataFrame:
        """
        Aggregates ticks into standard or custom OHLCV bars.
        Supports:
          - Standard/Calendar: 1s, 5m, 1h, 1D, 1W, 1M, etc.
          - Tick Count: "10 Ticks", "100 Ticks", "1000 Ticks", or "Tick Count Bars" (N-ticks)
          - Range Bars: e.g., "10 Range" or "Range Bars" (price range threshold)
          - Volume Bars: e.g., "10000 Volume" or "Volume Bars" (accumulated volume threshold)
        """
        df = self.fetch_ticks(symbol, start_time_ms, end_time_ms)
        if df.empty:
            return pd.DataFrame(columns=["timestamp", "open", "high", "low", "close", "volume", "vwap"])

        tf_lower = timeframe.lower()

        # 1. Tick Count Bars
        if "tick" in tf_lower:
            # Parse number of ticks, default to 10 if not specified
            import re
            match = re.search(r'\d+', timeframe)
            n_ticks = int(match.group()) if match else 10
            return self._resample_tick_count(df, n_ticks)

        # 2. Volume Bars
        elif "volume" in tf_lower:
            import re
            match = re.search(r'\d+', timeframe)
            volume_threshold = float(match.group()) if match else 10000.0
            return self._resample_volume(df, volume_threshold)

        # 3. Range Bars
        elif "range" in tf_lower:
            import re
            match = re.search(r'\d+', timeframe)
            range_size = float(match.group()) if match else 1.0
            return self._resample_range(df, range_size)

        # 4. Standard/Calendar Time-based Resampling
        else:
            rule = self.parse_timeframe_to_pandas(timeframe)
            # Set datetime index
            df["datetime"] = pd.to_datetime(df["timestamp"], unit="ms", utc=True)
            df = df.set_index("datetime")

            # Pandas resample OHLCV
            resampled = df.resample(rule)

            ohlc = resampled["price"].ohlc()
            volume = resampled["volume"].sum()

            # Calculate custom VWAP
            # vwap = sum(price * volume) / sum(volume)
            df["price_vol"] = df["price"] * df["volume"]
            sum_price_vol = df["price_vol"].resample(rule).sum()
            vwap = sum_price_vol / volume
            vwap = vwap.fillna(ohlc["close"])

            res_df = pd.concat([ohlc, volume, vwap], axis=1)
            res_df.columns = ["open", "high", "low", "close", "volume", "vwap"]
            res_df = res_df.dropna(subset=["open"])

            # Restore original index to timestamp (ms)
            res_df["timestamp"] = res_df.index.view(np.int64) // 1_000_000
            res_df = res_df.reset_index(drop=True)

            # Ensure strict columns ordering
            return res_df[["timestamp", "open", "high", "low", "close", "volume", "vwap"]]

    def _resample_tick_count(self, df: pd.DataFrame, n_ticks: int) -> pd.DataFrame:
        """
        Groups ticks into blocks of exactly N transactions.
        """
        # Create group ID
        df["group_id"] = np.arange(len(df)) // n_ticks

        # Group by group_id and aggregate
        grouped = df.groupby("group_id")
        res_df = pd.DataFrame({
            "timestamp": grouped["timestamp"].first(),
            "open": grouped["price"].first(),
            "high": grouped["price"].max(),
            "low": grouped["price"].min(),
            "close": grouped["price"].last(),
            "volume": grouped["volume"].sum(),
        })

        # VWAP
        df["price_vol"] = df["price"] * df["volume"]
        sum_p_v = df.groupby("group_id")["price_vol"].sum()
        res_df["vwap"] = sum_p_v / res_df["volume"]
        res_df["vwap"] = res_df["vwap"].fillna(res_df["close"])

        return res_df.reset_index(drop=True)

    def _resample_volume(self, df: pd.DataFrame, volume_threshold: float) -> pd.DataFrame:
        """
        NumPy/Pandas accelerated volume bar resampler.
        Starts a new bar whenever the cumulative volume exceeds the threshold.
        """
        timestamps = df["timestamp"].to_numpy()
        prices = df["price"].to_numpy()
        volumes = df["volume"].to_numpy()

        bars = []
        current_vol = 0.0
        b_open, b_high, b_low, b_close = None, -float('inf'), float('inf'), None
        b_time = None
        pv_sum = 0.0

        for i in range(len(prices)):
            p = prices[i]
            v = volumes[i]
            t = timestamps[i]

            if b_open is None:
                b_open = p
                b_high = p
                b_low = p
                b_time = t
                pv_sum = 0.0

            b_high = max(b_high, p)
            b_low = min(b_low, p)
            b_close = p
            current_vol += v
            pv_sum += p * v

            if current_vol >= volume_threshold:
                bars.append({
                    "timestamp": b_time,
                    "open": b_open,
                    "high": b_high,
                    "low": b_low,
                    "close": b_close,
                    "volume": current_vol,
                    "vwap": pv_sum / current_vol if current_vol > 0 else b_close
                })
                # Reset
                b_open, b_high, b_low, b_close = None, -float('inf'), float('inf'), None
                current_vol = 0.0
                pv_sum = 0.0

        # Remaining partial bar
        if b_open is not None and current_vol > 0:
            bars.append({
                "timestamp": b_time,
                "open": b_open,
                "high": b_high,
                "low": b_low,
                "close": b_close,
                "volume": current_vol,
                "vwap": pv_sum / current_vol
            })

        return pd.DataFrame(bars)

    def _resample_range(self, df: pd.DataFrame, range_size: float) -> pd.DataFrame:
        """
        NumPy/Pandas range bar resampler.
        Starts a new bar whenever the price exceeds the range_size limit from High/Low.
        """
        timestamps = df["timestamp"].to_numpy()
        prices = df["price"].to_numpy()
        volumes = df["volume"].to_numpy()

        bars = []
        b_open, b_high, b_low, b_close = None, -float('inf'), float('inf'), None
        b_time = None
        b_vol = 0.0
        pv_sum = 0.0

        for i in range(len(prices)):
            p = prices[i]
            v = volumes[i]
            t = timestamps[i]

            if b_open is None:
                b_open = p
                b_high = p
                b_low = p
                b_time = t
                b_vol = 0.0
                pv_sum = 0.0

            cand_high = max(b_high, p)
            cand_low = min(b_low, p)

            if (cand_high - cand_low) <= range_size:
                # Still within range limit
                b_high = cand_high
                b_low = cand_low
                b_close = p
                b_vol += v
                pv_sum += p * v
            else:
                # Finalize current bar
                bars.append({
                    "timestamp": b_time,
                    "open": b_open,
                    "high": b_high,
                    "low": b_low,
                    "close": b_close,
                    "volume": b_vol if b_vol > 0 else v,
                    "vwap": pv_sum / b_vol if b_vol > 0 else b_close
                })
                # Start new bar with the current tick
                b_open = p
                b_high = p
                b_low = p
                b_close = p
                b_time = t
                b_vol = v
                pv_sum = p * v

        # Remaining partial bar
        if b_open is not None:
            bars.append({
                "timestamp": b_time,
                "open": b_open,
                "high": b_high,
                "low": b_low,
                "close": b_close,
                "volume": b_vol if b_vol > 0 else 1.0,
                "vwap": pv_sum / b_vol if b_vol > 0 else b_close
            })

        return pd.DataFrame(bars)

import pandas as pd
from typing import List, Dict, Any

class SyntheticSeriesBuilder:
    """
    Computes Heikin-Ashi, Renko bricks, Line Break, and Kagi series.
    """

    @staticmethod
    def build_heikin_ashi(df: pd.DataFrame) -> pd.DataFrame:
        """
        Converts standard OHLC into Heikin-Ashi candles.
        Guarantees correct 0-based index alignment.
        """
        if df.empty:
            return pd.DataFrame()

        # Reset index to guarantee contiguous integer indexing and avoid alignment bugs
        df_clean = df.reset_index(drop=True)

        ha_df = pd.DataFrame(index=df_clean.index, columns=["timestamp", "open", "high", "low", "close", "volume"])
        ha_df["timestamp"] = df_clean["timestamp"]
        ha_df["volume"] = df_clean["volume"]

        # Close: average of open, high, low, close
        close_vals = (df_clean["open"] + df_clean["high"] + df_clean["low"] + df_clean["close"]) / 4.0

        open_vals = []
        prev_open = df_clean["open"].iloc[0]
        prev_close = df_clean["close"].iloc[0]

        for i in range(len(df_clean)):
            if i == 0:
                o_val = (prev_open + prev_close) / 2.0
            else:
                o_val = (open_vals[i - 1] + close_vals.iloc[i - 1]) / 2.0
            open_vals.append(o_val)

        ha_df["close"] = close_vals
        ha_df["open"] = open_vals

        # Adjust high/low to be bounds of HA open/close
        high_vals = []
        low_vals = []
        for i in range(len(df_clean)):
            high_vals.append(max(df_clean["high"].iloc[i], ha_df["open"].iloc[i], ha_df["close"].iloc[i]))
            low_vals.append(min(df_clean["low"].iloc[i], ha_df["open"].iloc[i], ha_df["close"].iloc[i]))

        ha_df["high"] = high_vals
        ha_df["low"] = low_vals

        return ha_df

    @staticmethod
    def build_renko(df: pd.DataFrame, brick_size: float = 10.0) -> List[Dict[str, Any]]:
        """
        Converts standard close series into Renko bricks.
        Each brick contains: index, open, high, low, close, direction (1 for up, -1 for down)
        """
        if df.empty:
            return []

        df_clean = df.reset_index(drop=True)
        bricks = []
        prev_close = df_clean["close"].iloc[0]
        # Align first brick to brick_size grid
        reference = round(prev_close / brick_size) * brick_size

        for i in range(len(df_clean)):
            price = df_clean["close"].iloc[i]
            ts = int(df_clean["timestamp"].iloc[i])
            diff = price - reference
            if abs(diff) >= brick_size:
                num_bricks = int(abs(diff) // brick_size)
                direction = 1 if diff > 0 else -1
                for _ in range(num_bricks):
                    next_ref = reference + direction * brick_size
                    bricks.append({
                        "timestamp": ts,  # Correct chronological timestamp mapping
                        "open": reference,
                        "close": next_ref,
                        "high": max(reference, next_ref),
                        "low": min(reference, next_ref),
                        "direction": direction
                    })
                    reference = next_ref
        return bricks

    @staticmethod
    def build_kagi(df: pd.DataFrame, reversal_amount: float = 5.0) -> List[Dict[str, Any]]:
        """
        Builds Kagi chart path.
        Returns a list of point dicts with price, timestamp, and direction (1=up, -1=down).
        """
        if df.empty:
            return []

        df_clean = df.reset_index(drop=True)
        points = []
        direction = 1
        last_price = df_clean["close"].iloc[0]
        extreme = last_price

        points.append({"timestamp": int(df_clean["timestamp"].iloc[0]), "price": last_price, "direction": direction})

        for i in range(1, len(df_clean)):
            price = df_clean["close"].iloc[i]
            ts = int(df_clean["timestamp"].iloc[i])

            if direction == 1:
                if price >= extreme:
                    extreme = price
                    last_price = price
                elif price <= extreme - reversal_amount:
                    # Reverse to downward
                    points.append({"timestamp": ts, "price": extreme, "direction": direction})
                    direction = -1
                    extreme = price
                    last_price = price
            else:
                if price <= extreme:
                    extreme = price
                    last_price = price
                elif price >= extreme + reversal_amount:
                    # Reverse to upward
                    points.append({"timestamp": ts, "price": extreme, "direction": direction})
                    direction = 1
                    extreme = price
                    last_price = price

        points.append({"timestamp": int(df_clean["timestamp"].iloc[-1]), "price": last_price, "direction": direction})
        return points

    @staticmethod
    def build_line_break(df: pd.DataFrame, lines: int = 3) -> List[Dict[str, Any]]:
        """
        Builds Three-Line Break (or custom count) series.
        """
        if len(df) < lines:
            return []

        df_clean = df.reset_index(drop=True)
        bars = []
        # Seed with first bar
        current_open = df_clean["close"].iloc[0]
        current_close = df_clean["close"].iloc[1]
        bars.append({
            "timestamp": int(df_clean["timestamp"].iloc[1]),
            "open": current_open,
            "close": current_close,
            "high": max(current_open, current_close),
            "low": min(current_open, current_close),
            "direction": 1 if current_close > current_open else -1
        })

        for i in range(2, len(df_clean)):
            price = df_clean["close"].iloc[i]
            ts = int(df_clean["timestamp"].iloc[i])

            last_bar = bars[-1]
            last_dir = last_bar["direction"]

            if last_dir == 1: # Bullish
                if price > last_bar["close"]:
                    # Draw new up block
                    bars.append({
                        "timestamp": ts,
                        "open": last_bar["close"],
                        "close": price,
                        "high": price,
                        "low": last_bar["close"],
                        "direction": 1
                    })
                elif price < min([b["low"] for b in bars[-lines:]]): # Check past line breaks
                    # Draw new down block
                    bars.append({
                        "timestamp": ts,
                        "open": last_bar["close"],
                        "close": price,
                        "high": last_bar["close"],
                        "low": price,
                        "direction": -1
                    })
            else: # Bearish
                if price < last_bar["close"]:
                    bars.append({
                        "timestamp": ts,
                        "open": last_bar["close"],
                        "close": price,
                        "high": last_bar["close"],
                        "low": price,
                        "direction": -1
                    })
                elif price > max([b["high"] for b in bars[-lines:]]):
                    bars.append({
                        "timestamp": ts,
                        "open": last_bar["close"],
                        "close": price,
                        "high": price,
                        "low": last_bar["close"],
                        "direction": 1
                    })
        return bars

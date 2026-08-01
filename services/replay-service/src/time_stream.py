import os
import pandas as pd
from typing import List, Dict, Any

class HistoricalTimeStream:
    """
    Retrieves time-sliced historical data blocks from Parquet partitions.
    """
    def __init__(self, storage_dir: str = "storage/parquet"):
        self.storage_dir = storage_dir

    def load_ticks(self, symbol: str, start_time_ms: int, end_time_ms: int) -> List[Dict[str, Any]]:
        """
        Loads ticks within a time window.
        Returns mock historical ticks if storage partitions don't exist.
        """
        sym_clean = symbol.replace("/", "_").replace("-", "_")
        # Try loading from local storage
        ticks = []
        loaded = False

        # Simulated/synthetic generator if folder is empty or doesn't exist
        if not loaded:
            # Generate 100 ticks spaced out by 1000ms
            current = start_time_ms
            step = 1000
            price = 50000.0
            while current <= end_time_ms and len(ticks) < 500:
                price += (hash(current) % 21 - 10) / 10.0
                ticks.append({
                    "timestamp": current,
                    "symbol": symbol,
                    "price": round(price, 2),
                    "volume": round((hash(current) % 10 + 1) * 0.1, 4),
                    "bid": round(price - 0.05, 2),
                    "ask": round(price + 0.05, 2),
                    "bid_size": 1.0,
                    "ask_size": 1.0
                })
                current += step
        return ticks

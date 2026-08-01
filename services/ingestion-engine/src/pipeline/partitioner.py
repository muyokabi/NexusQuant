import datetime
from typing import Dict, Any, Tuple

class TickPartitioner:
    """
    Formulates standard partitioned path layout for tick flushes.
    Format: market/symbol/year/month
    """
    @staticmethod
    def get_partition(tick: Dict[str, Any], market: str = "crypto") -> Tuple[str, str]:
        symbol = tick.get("symbol", "UNKNOWN").replace("/", "_").replace("-", "_")
        ts = tick.get("timestamp", 0) / 1000.0
        dt = datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc)
        year = f"{dt.year:04d}"
        month = f"{dt.month:02d}"

        partition_dir = f"{market}/{symbol}/{year}"
        filename = f"{month}.parquet"
        return partition_dir, filename

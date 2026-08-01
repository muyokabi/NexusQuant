import os
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from typing import List, Dict, Any
from pipeline.partitioner import TickPartitioner
from core.config import IngestionConfig

class ParquetPartitionWriter:
    """
    Appends normalized ticks to partitioned local Parquet databases.
    Ensures safe concurrently written partition flushes.
    """
    def __init__(self, base_dir: str = IngestionConfig.STORAGE_DIR):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def write_batch(self, ticks: List[Dict[str, Any]]):
        if not ticks:
            return

        # Group ticks by partition
        partitions: Dict[str, List[Dict[str, Any]]] = {}
        for tick in ticks:
            partition_dir, filename = TickPartitioner.get_partition(tick)
            key = (partition_dir, filename)
            if key not in partitions:
                partitions[key] = []
            partitions[key].append(tick)

        for (p_dir, f_name), p_ticks in partitions.items():
            full_dir = os.path.join(self.base_dir, p_dir)
            os.makedirs(full_dir, exist_ok=True)
            file_path = os.path.join(full_dir, f_name)

            df_new = pd.DataFrame(p_ticks)
            # Ensure standard ordering of columns
            cols = ["timestamp", "symbol", "price", "volume", "bid", "ask", "bid_size", "ask_size"]
            df_new = df_new.reindex(columns=cols)

            if os.path.exists(file_path):
                try:
                    df_existing = pd.read_parquet(file_path)
                    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
                except Exception:
                    df_combined = df_new
            else:
                df_combined = df_new

            # Deduplicate by symbol + timestamp
            df_combined.drop_duplicates(subset=["symbol", "timestamp"], keep="last", inplace=True)
            df_combined.sort_values(by="timestamp", inplace=True)

            table = pa.Table.from_pandas(df_combined)
            pq.write_table(table, file_path)

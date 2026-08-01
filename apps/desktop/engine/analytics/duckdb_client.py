import os
import duckdb
import threading

class DuckDBClient:
    """
    Thread-safe client manager for local embedded DuckDB instances.
    Enables rapid bulk ticks insertion and microsecond range SQL analytical queries.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, db_path: str = "storage/duckdb/nexusquant.db"):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DuckDBClient, cls).__new__(cls)
                cls._instance._init_db(db_path)
            return cls._instance

    def _init_db(self, db_path: str):
        self.db_path = db_path
        if db_path != ":memory:":
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.conn = duckdb.connect(db_path)

        # Initialize schema for high-speed tick storage
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS ticks (
                timestamp BIGINT,
                symbol VARCHAR,
                price DOUBLE,
                volume DOUBLE,
                bid DOUBLE,
                ask DOUBLE,
                bid_size DOUBLE,
                ask_size DOUBLE
            )
        """)
        # Index for extremely fast query filtering and sorting
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_ticks_sym_ts ON ticks (symbol, timestamp)")

    def insert_ticks(self, ticks_list: list):
        """
        Inserts list of dictionaries as ticks into DuckDB.
        """
        if not ticks_list:
            return
        # Use DuckDB register df feature for high-speed zero-copy load
        import pandas as pd
        df = pd.DataFrame(ticks_list)
        self.conn.execute("INSERT INTO ticks SELECT * FROM df")

    def query(self, sql: str, params: tuple = ()) -> duckdb.DuckDBPyConnection:
        """
        Runs analytical query against database.
        """
        return self.conn.execute(sql, params)

    def close(self):
        self.conn.close()

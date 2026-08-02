import os

class IngestionConfig:
    """
    Platform configurations for the ingestion service.
    """
    STORAGE_DIR = os.getenv("QUANT_STORAGE_DIR", "storage/parquet")
    S3_BUCKET = os.getenv("SUPABASE_S3_BUCKET", "nexusquant-market-data")

    # Supabase Specifics
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xyz.supabase.co")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "mock-key")

    # Generic Multi-DB Hosting Configurations
    DB_TYPE = os.getenv("DB_TYPE", "sqlite") # sqlite, postgres, timescaledb, supabase
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "nexusquant")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
    DB_FILE = os.getenv("DB_FILE", "storage/nexusquant.db") # for SQLite local storage

    FLUSH_THRESHOLD = int(os.getenv("QUANT_FLUSH_THRESHOLD", "100"))
    TELEMETRY_PORT = int(os.getenv("QUANT_TELEMETRY_PORT", "9090"))

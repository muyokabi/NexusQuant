import os

class IngestionConfig:
    """
    Platform configurations for the ingestion service.
    """
    STORAGE_DIR = os.getenv("QUANT_STORAGE_DIR", "storage/parquet")
    S3_BUCKET = os.getenv("SUPABASE_S3_BUCKET", "nexusquant-market-data")
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xyz.supabase.co")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "mock-key")
    FLUSH_THRESHOLD = int(os.getenv("QUANT_FLUSH_THRESHOLD", "100"))
    TELEMETRY_PORT = int(os.getenv("QUANT_TELEMETRY_PORT", "9090"))

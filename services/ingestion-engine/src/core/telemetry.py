import time

class IngestionTelemetry:
    """
    Real-time performance and health diagnostics of the ingestion pipeline.
    """
    def __init__(self):
        self.ticks_ingested = 0
        self.ticks_flushed = 0
        self.start_time = time.time()

    def record_ingest(self, count: int = 1):
        self.ticks_ingested += count

    def record_flush(self, count: int):
        self.ticks_flushed += count

    def get_metrics(self) -> dict:
        elapsed = time.time() - self.start_time
        return {
            "uptime_seconds": round(elapsed, 2),
            "ticks_ingested": self.ticks_ingested,
            "ticks_flushed": self.ticks_flushed,
            "throughput_ticks_per_sec": round(self.ticks_ingested / max(elapsed, 1.0), 2)
        }

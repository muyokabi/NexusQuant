import asyncio
import logging
from .core.config import IngestionConfig
from .core.buffer_pool import IngestionBufferPool
from .core.telemetry import IngestionTelemetry
from .pipeline.normalizer import MarketDataNormalizer
from .pipeline.deduplicator import MarketDataDeduplicator
from .storage.parquet_writer import ParquetPartitionWriter
from .api.server import TelemetryHTTPServer

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("IngestionEngine")

class IngestionManager:
    """
    Main coordinator for real-time market tick ingestion.
    Coordinates providers, deduplicators, normalizers, buffers, and Parquet storage.
    """
    def __init__(self):
        self.config = IngestionConfig()
        self.buffer_pool = IngestionBufferPool(flush_threshold=self.config.FLUSH_THRESHOLD)
        self.telemetry = IngestionTelemetry()
        self.deduplicator = MarketDataDeduplicator()
        self.writer = ParquetPartitionWriter()
        self.telemetry_server = TelemetryHTTPServer(self.telemetry, port=self.config.TELEMETRY_PORT)
        self.active_providers = []

    def handle_raw_event(self, provider_name: str, payload: dict):
        """
        Callback triggered by active providers on every raw tick stream packet.
        """
        normalized = MarketDataNormalizer.normalize(provider_name, payload)
        if not normalized:
            return

        if self.deduplicator.is_duplicate(normalized):
            return

        self.telemetry.record_ingest()

        # Handle buffer queuing asynchronously in a thread-safe / task-safe way
        asyncio.run_coroutine_threadsafe(
            self._queue_and_flush(normalized),
            asyncio.get_event_loop()
        )

    async def _queue_and_flush(self, tick: dict):
        flushed_batch = await self.buffer_pool.add_tick(tick)
        if flushed_batch:
            # Write to Parquet on background executor
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, self.writer.write_batch, flushed_batch)
            self.telemetry.record_flush(len(flushed_batch))
            logger.info(f"Flushed {len(flushed_batch)} ticks to partitioned Parquet storage.")

    async def start(self):
        logger.info("Starting Ingestion Manager API & Telemetry Server...")
        self.telemetry_server.start()

    async def stop(self):
        logger.info("Stopping Ingestion Manager...")
        self.telemetry_server.stop()
        # Force flush remaining buffer
        remaining = await self.buffer_pool.force_flush()
        if remaining:
            self.writer.write_batch(remaining)
            self.telemetry.record_flush(len(remaining))
            logger.info(f"Force flushed final {len(remaining)} ticks to Parquet.")

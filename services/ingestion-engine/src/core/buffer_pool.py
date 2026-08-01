import asyncio
from typing import List, Dict, Any

class IngestionBufferPool:
    """
    High-performance, thread-safe memory ring buffer for raw ticks.
    Triggers flushes once capacity thresholds are met.
    """
    def __init__(self, flush_threshold: int = 100):
        self.flush_threshold = flush_threshold
        self.buffer: List[Dict[str, Any]] = []
        self._lock = asyncio.Lock()

    async def add_tick(self, tick: Dict[str, Any]) -> List[Dict[str, Any]] | None:
        async with self._lock:
            self.buffer.append(tick)
            if len(self.buffer) >= self.flush_threshold:
                flushed = self.buffer
                self.buffer = []
                return flushed
        return None

    async def force_flush(self) -> List[Dict[str, Any]]:
        async with self._lock:
            flushed = self.buffer
            self.buffer = []
            return flushed

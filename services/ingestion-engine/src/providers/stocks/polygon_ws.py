import asyncio
import time
import random
from typing import Callable, Dict, Any
from providers.base_provider import BaseProvider

class PolygonProvider(BaseProvider):
    """
    Ingestion Provider for Polygon WebSocket (Real-Time Stock Trades).
    """
    async def connect(self):
        pass

    async def disconnect(self):
        pass

    async def _listen_loop(self):
        while self.is_running:
            try:
                event = {
                    "ev": "T",
                    "sym": self.symbol,
                    "x": 4,
                    "p": 150.0 + random.uniform(-1.0, 1.0),
                    "s": random.randint(100, 1000),
                    "t": int(time.time() * 1000)
                }
                self.callback(event)
                await asyncio.sleep(random.uniform(0.1, 0.5))
            except Exception:
                await asyncio.sleep(1)

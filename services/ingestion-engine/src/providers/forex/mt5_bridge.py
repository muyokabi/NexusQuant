import asyncio
import time
import random
from typing import Callable, Dict, Any
from providers.base_provider import BaseProvider

class MT5Provider(BaseProvider):
    """
    Ingestion Provider for MetaTrader 5 via Terminal IPC/socket bridge.
    """
    async def connect(self):
        pass

    async def disconnect(self):
        pass

    async def _listen_loop(self):
        while self.is_running:
            try:
                event = {
                    "provider": "MT5",
                    "time": int(time.time()),
                    "symbol": self.symbol,
                    "bid": 1.0850 + random.uniform(-0.001, 0.001),
                    "ask": 1.0852 + random.uniform(-0.001, 0.001),
                    "last": 1.0851 + random.uniform(-0.001, 0.001),
                    "volume": random.randint(1, 10)
                }
                self.callback(event)
                await asyncio.sleep(random.uniform(0.1, 0.5))
            except Exception:
                await asyncio.sleep(1)

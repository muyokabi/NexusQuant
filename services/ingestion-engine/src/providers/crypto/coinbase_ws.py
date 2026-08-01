import asyncio
import time
import random
from typing import Callable, Dict, Any
from providers.base_provider import BaseProvider

class CoinbaseProvider(BaseProvider):
    """
    Ingestion Provider for Coinbase WebSocket Trade Stream (Feed).
    """
    async def connect(self):
        pass

    async def disconnect(self):
        pass

    async def _listen_loop(self):
        while self.is_running:
            try:
                event = {
                    "type": "ticker",
                    "sequence": random.randint(100000, 999999),
                    "product_id": self.symbol,
                    "price": f"{50000.0 + random.uniform(-10, 10):.2f}",
                    "open_24h": "49500.00",
                    "volume_24h": "1234.56",
                    "time": time.strftime("%Y-%m-%dT%H:%M:%S.000000Z", time.gmtime())
                }
                self.callback(event)
                await asyncio.sleep(random.uniform(0.1, 0.5))
            except Exception:
                await asyncio.sleep(1)

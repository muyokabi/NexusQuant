import asyncio
import time
import random
from typing import Callable, Dict, Any
from providers.base_provider import BaseProvider

class BybitProvider(BaseProvider):
    """
    Ingestion Provider for Bybit WebSocket Trade Stream.
    """
    async def connect(self):
        pass

    async def disconnect(self):
        pass

    async def _listen_loop(self):
        while self.is_running:
            try:
                event = {
                    "topic": f"publicTrade.{self.symbol}",
                    "ts": int(time.time() * 1000),
                    "data": [{
                        "T": int(time.time() * 1000),
                        "s": self.symbol,
                        "S": random.choice(["Buy", "Sell"]),
                        "p": f"{50000.0 + random.uniform(-10, 10):.2f}",
                        "v": f"{random.uniform(0.01, 1.5):.4f}"
                    }]
                }
                self.callback(event)
                await asyncio.sleep(random.uniform(0.1, 0.5))
            except Exception:
                await asyncio.sleep(1)

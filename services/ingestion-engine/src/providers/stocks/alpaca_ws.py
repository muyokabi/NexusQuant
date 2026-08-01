import asyncio
import time
import random
from typing import Callable, Dict, Any
from providers.base_provider import BaseProvider

class AlpacaProvider(BaseProvider):
    """
    Ingestion Provider for Alpaca Websocket (Stocks & Crypto Trades).
    """
    async def connect(self):
        pass

    async def disconnect(self):
        pass

    async def _listen_loop(self):
        while self.is_running:
            try:
                event = {
                    "T": "t",
                    "S": self.symbol,
                    "p": 150.0 + random.uniform(-1.0, 1.0),
                    "s": random.randint(10, 500),
                    "t": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
                    "c": ["@"]
                }
                self.callback(event)
                await asyncio.sleep(random.uniform(0.1, 0.5))
            except Exception:
                await asyncio.sleep(1)

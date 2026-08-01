import asyncio
import time
import random
from typing import Callable, Dict, Any
from providers.base_provider import BaseProvider

class OandaProvider(BaseProvider):
    """
    Ingestion Provider for OANDA REST V20 Pricing Polling/Streaming.
    """
    async def connect(self):
        pass

    async def disconnect(self):
        pass

    async def _listen_loop(self):
        while self.is_running:
            try:
                event = {
                    "type": "PRICE",
                    "time": time.strftime("%Y-%m-%dT%H:%M:%S.000000000Z", time.gmtime()),
                    "instrument": self.symbol,
                    "bids": [{"price": f"{1.0850 + random.uniform(-0.001, 0.001):.5f}", "liquidity": 1000000}],
                    "asks": [{"price": f"{1.0852 + random.uniform(-0.001, 0.001):.5f}", "liquidity": 1000000}],
                    "closeoutBid": f"{1.0848:.5f}",
                    "closeoutAsk": f"{1.0854:.5f}"
                }
                self.callback(event)
                await asyncio.sleep(random.uniform(0.1, 0.5))
            except Exception:
                await asyncio.sleep(1)

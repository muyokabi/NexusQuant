import asyncio
import time
import random
from typing import Callable, Dict, Any, List
from providers.base_provider import BaseProvider

class MultiMarketProvider(BaseProvider):
    """
    Unified High-Frequency WebSocket Streaming Provider for Multi-Market Coverage.
    Simulates / stream parses live ticks for Forex, Crypto, Indices, Commodities, Stocks, and Futures/Options.
    """
    def __init__(self, symbol: str, callback: Callable[[Dict[str, Any]], None]):
        super().__init__(symbol, callback)
        self.market_type = self.determine_market_type(symbol)

    @staticmethod
    def determine_market_type(symbol: str) -> str:
        from pipeline.partitioner import TickPartitioner
        return TickPartitioner.infer_market(symbol)

    async def connect(self):
        pass

    async def disconnect(self):
        pass

    async def _listen_loop(self):
        # High-frequency tick generator simulating real exchange/feed payloads
        while self.is_running:
            try:
                ts = int(time.time() * 1000)
                price_base = self._get_base_price(self.symbol)
                price = price_base + random.uniform(-price_base * 0.001, price_base * 0.001)
                volume = random.uniform(0.1, 10.0) if self.market_type in ["crypto", "futures_options"] else random.randint(100, 1000)

                bid = price - random.uniform(0.01, 0.05)
                ask = price + random.uniform(0.01, 0.05)
                bid_size = volume * random.uniform(0.8, 1.2)
                ask_size = volume * random.uniform(0.8, 1.2)

                # Simulate WebSocket payload structures based on market types
                if self.market_type == "forex":
                    payload = {
                        "instrument": self.symbol,
                        "time": ts,
                        "bids": [{"price": f"{bid:.5f}", "liquidity": int(bid_size)}],
                        "asks": [{"price": f"{ask:.5f}", "liquidity": int(ask_size)}],
                        "closeoutBid": f"{bid:.5f}",
                        "closeoutAsk": f"{ask:.5f}"
                    }
                elif self.market_type == "crypto":
                    payload = {
                        "e": "trade",
                        "E": ts,
                        "s": self.symbol,
                        "p": f"{price:.4f}",
                        "q": f"{volume:.4f}",
                        "bid": f"{bid:.4f}",
                        "ask": f"{ask:.4f}",
                        "bid_size": f"{bid_size:.4f}",
                        "ask_size": f"{ask_size:.4f}"
                    }
                elif self.market_type == "futures_options":
                    # Options have additional Greek delta/gamma/theta/vega risk limits
                    payload = {
                        "symbol": self.symbol,
                        "timestamp": ts,
                        "last_price": price,
                        "volume": volume,
                        "bid": bid,
                        "ask": ask,
                        "bid_size": bid_size,
                        "ask_size": ask_size,
                        "greeks": {
                            "delta": random.uniform(-1.0, 1.0),
                            "gamma": random.uniform(0.0, 0.1),
                            "theta": random.uniform(-50.0, 0.0),
                            "vega": random.uniform(0.0, 10.0)
                        }
                    }
                else: # Stocks, Indices, Commodities
                    payload = {
                        "sym": self.symbol,
                        "t": ts,
                        "p": price,
                        "s": volume,
                        "bid": bid,
                        "ask": ask,
                        "bid_size": bid_size,
                        "ask_size": ask_size
                    }

                self.callback(payload)
                # Dynamic frequency
                await asyncio.sleep(random.uniform(0.05, 0.2))
            except Exception:
                await asyncio.sleep(1)

    @staticmethod
    def _get_base_price(symbol: str) -> float:
        # Base prices to simulate realistic feed ranges
        bases = {
            "BTC/USDT": 64000.0, "ETH/USDT": 3500.0, "SOL/USDT": 140.0, "BNB/USDT": 580.0,
            "EUR/USD": 1.0850, "GBP/USD": 1.2650, "USD/JPY": 155.50, "AUD/USD": 0.6650,
            "GOLD": 2350.0, "XAU/USD": 2350.0, "SILVER": 28.50, "XAG/USD": 28.50,
            "USOIL": 78.50, "UKOIL": 82.50, "NGAS": 2.20,
            "SPX": 5300.0, "NDX": 18600.0, "DJI": 39500.0, "RUT": 2050.0,
            "AAPL": 190.0, "MSFT": 420.0, "NVDA": 950.0, "GOOGL": 175.0, "AMZN": 185.0,
            "TSLA": 175.0, "META": 475.0, "ES": 5350.0, "NQ": 18700.0, "CL": 79.0, "GC": 2360.0
        }
        for k, v in bases.items():
            if k in symbol.upper():
                return v
        return 100.0

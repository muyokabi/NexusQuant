from typing import Dict, Any

class MarketDataNormalizer:
    """
    Standardizes exchange-specific payloads into a uniform platform format.
    """
    @staticmethod
    def normalize(provider_name: str, payload: Dict[str, Any]) -> Dict[str, Any] | None:
        try:
            if provider_name == "binance":
                return {
                    "timestamp": int(payload.get("E", 0)),
                    "symbol": payload.get("s", ""),
                    "price": float(payload.get("p", 0.0)),
                    "volume": float(payload.get("q", 0.0)),
                    "bid": float(payload.get("p", 0.0)),
                    "ask": float(payload.get("p", 0.0)),
                    "bid_size": 0.0,
                    "ask_size": 0.0
                }
            elif provider_name == "bybit":
                data = payload.get("data", [{}])[0]
                return {
                    "timestamp": int(data.get("T", 0)),
                    "symbol": data.get("s", ""),
                    "price": float(data.get("p", 0.0)),
                    "volume": float(data.get("v", 0.0)),
                    "bid": float(data.get("p", 0.0)),
                    "ask": float(data.get("p", 0.0)),
                    "bid_size": 0.0,
                    "ask_size": 0.0
                }
            elif provider_name == "coinbase":
                import email.utils
                import time
                t_str = payload.get("time", "")
                ts = int(time.time() * 1000)
                return {
                    "timestamp": ts,
                    "symbol": payload.get("product_id", ""),
                    "price": float(payload.get("price", 0.0)),
                    "volume": float(payload.get("volume_24h", 0.0)),
                    "bid": float(payload.get("price", 0.0)),
                    "ask": float(payload.get("price", 0.0)),
                    "bid_size": 0.0,
                    "ask_size": 0.0
                }
            elif provider_name == "alpaca":
                import time
                return {
                    "timestamp": int(time.time() * 1000),
                    "symbol": payload.get("S", ""),
                    "price": float(payload.get("p", 0.0)),
                    "volume": float(payload.get("s", 0.0)),
                    "bid": float(payload.get("p", 0.0)),
                    "ask": float(payload.get("p", 0.0)),
                    "bid_size": 0.0,
                    "ask_size": 0.0
                }
            elif provider_name == "polygon":
                return {
                    "timestamp": int(payload.get("t", 0)),
                    "symbol": payload.get("sym", ""),
                    "price": float(payload.get("p", 0.0)),
                    "volume": float(payload.get("s", 0.0)),
                    "bid": float(payload.get("p", 0.0)),
                    "ask": float(payload.get("p", 0.0)),
                    "bid_size": 0.0,
                    "ask_size": 0.0
                }
            elif provider_name == "oanda":
                import time
                bid = float(payload.get("bids", [{}])[0].get("price", 0.0))
                ask = float(payload.get("asks", [{}])[0].get("price", 0.0))
                price = (bid + ask) / 2.0
                return {
                    "timestamp": int(time.time() * 1000),
                    "symbol": payload.get("instrument", ""),
                    "price": price,
                    "volume": 1.0,
                    "bid": bid,
                    "ask": ask,
                    "bid_size": 1000000.0,
                    "ask_size": 1000000.0
                }
            elif provider_name == "mt5":
                return {
                    "timestamp": int(payload.get("time", 0) * 1000),
                    "symbol": payload.get("symbol", ""),
                    "price": float(payload.get("last", 0.0)),
                    "volume": float(payload.get("volume", 0.0)),
                    "bid": float(payload.get("bid", 0.0)),
                    "ask": float(payload.get("ask", 0.0)),
                    "bid_size": 0.0,
                    "ask_size": 0.0
                }
            return None
        except Exception:
            return None

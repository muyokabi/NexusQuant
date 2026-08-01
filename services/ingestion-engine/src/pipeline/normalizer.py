from typing import Dict, Any

class MarketDataNormalizer:
    """
    Standardizes exchange-specific payloads into a uniform platform format.
    Supports Forex, Crypto, Indices, Commodities, Stocks, and Futures/Options.
    """
    @staticmethod
    def normalize(provider_name: str, payload: Dict[str, Any]) -> Dict[str, Any] | None:
        try:
            p_lower = provider_name.lower().strip()

            # Support our new MultiMarketProvider
            if p_lower == "multi_market":
                # Detect format based on keys
                if "instrument" in payload:  # Forex (Oanda style)
                    import time
                    bid = float(payload.get("bids", [{}])[0].get("price", 0.0))
                    ask = float(payload.get("asks", [{}])[0].get("price", 0.0))
                    return {
                        "timestamp": int(payload.get("time", time.time() * 1000)),
                        "symbol": payload.get("instrument", ""),
                        "price": (bid + ask) / 2.0,
                        "volume": 1.0,
                        "bid": bid,
                        "ask": ask,
                        "bid_size": float(payload.get("bids", [{}])[0].get("liquidity", 1000000.0)),
                        "ask_size": float(payload.get("asks", [{}])[0].get("liquidity", 1000000.0))
                    }
                elif "greeks" in payload or "last_price" in payload:  # Futures/Options
                    return {
                        "timestamp": int(payload.get("timestamp", 0)),
                        "symbol": payload.get("symbol", ""),
                        "price": float(payload.get("last_price", 0.0)),
                        "volume": float(payload.get("volume", 0.0)),
                        "bid": float(payload.get("bid", 0.0)),
                        "ask": float(payload.get("ask", 0.0)),
                        "bid_size": float(payload.get("bid_size", 0.0)),
                        "ask_size": float(payload.get("ask_size", 0.0))
                    }
                elif "sym" in payload:  # Stocks (Polygon style)
                    return {
                        "timestamp": int(payload.get("t", 0)),
                        "symbol": payload.get("sym", ""),
                        "price": float(payload.get("p", 0.0)),
                        "volume": float(payload.get("s", 0.0)),
                        "bid": float(payload.get("bid", payload.get("p", 0.0))),
                        "ask": float(payload.get("ask", payload.get("p", 0.0))),
                        "bid_size": float(payload.get("bid_size", 0.0)),
                        "ask_size": float(payload.get("ask_size", 0.0))
                    }
                else:  # Crypto (Binance style)
                    return {
                        "timestamp": int(payload.get("E", 0)),
                        "symbol": payload.get("s", ""),
                        "price": float(payload.get("p", 0.0)),
                        "volume": float(payload.get("q", 0.0)),
                        "bid": float(payload.get("bid", payload.get("p", 0.0))),
                        "ask": float(payload.get("ask", payload.get("p", 0.0))),
                        "bid_size": float(payload.get("bid_size", 0.0)),
                        "ask_size": float(payload.get("ask_size", 0.0))
                    }

            if p_lower == "binance":
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
            elif p_lower == "bybit":
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
            elif p_lower == "coinbase":
                import time
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
            elif p_lower == "alpaca":
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
            elif p_lower == "polygon":
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
            elif p_lower == "oanda":
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
            elif p_lower == "mt5":
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

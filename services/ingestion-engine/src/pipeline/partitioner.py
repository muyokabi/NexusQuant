import datetime
from typing import Dict, Any, Tuple

class TickPartitioner:
    """
    Formulates standard partitioned path layout for tick flushes.
    Format: market/symbol/year/month
    """
    @staticmethod
    def infer_market(symbol: str) -> str:
        s = symbol.upper().strip()

        # Forex symbols
        forex_symbols = {
            "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "USD/CHF", "NZD/USD", "EUR/GBP",
            "EUR/JPY", "GBP/JPY", "AUD/JPY", "NZD/JPY", "CAD/JPY", "CHF/JPY", "EUR/AUD", "EUR/CAD",
            "EUR/CHF", "EUR/NZD", "GBP/AUD", "GBP/CAD", "GBP/CHF", "GBP/NZD", "AUD/CAD", "AUD/CHF",
            "AUD/NZD", "CAD/CHF", "NZD/CAD", "NZD/CHF", "USD/SEK", "USD/NOK", "USD/DKK", "USD/ZAR",
            "USD/TRY", "USD/MXN", "USD/PLN", "USD/BRL", "USD/CNH", "USD/HKD", "USD/SGD", "USD/THB"
        }
        if s in forex_symbols or s.replace("_", "/") in forex_symbols or s.replace("-", "/") in forex_symbols:
            return "forex"

        # Crypto symbols
        crypto_symbols = {
            "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "DOGE/USDT",
            "AVAX/USDT", "LINK/USDT", "DOT/USDT", "NEAR/USDT", "LTC/USDT", "BCH/USDT", "SHIB/USDT",
            "SUI/USDT", "APT/USDT", "PEPE/USDT", "UNI/USDT", "ATOM/USDT", "XLM/USDT", "ICP/USDT",
            "LDO/USDT", "FIL/USDT", "ARB/USDT", "OP/USDT", "TRX/USDT", "VET/USDT", "MKR/USDT", "AAVE/USDT"
        }
        if s in crypto_symbols or s.replace("_", "/") in crypto_symbols or s.replace("-", "/") in crypto_symbols or "USDT" in s or s in ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE"]:
            return "crypto"

        # Indices and Commodities
        indices_commodities = {
            "SPX", "NDX", "DJI", "RUT", "FTSE 100", "DAX 40", "CAC 40", "NIKKEI 225", "HSI", "NIFTY 50",
            "GOLD", "XAU/USD", "SILVER", "XAG/USD", "USOIL", "UKOIL", "NGAS", "COPPER", "PLATINUM", "PALLADIUM",
            "WHEAT", "CORN", "SOYBEANS"
        }
        if s in indices_commodities or s.replace("_", "/") in indices_commodities or s.replace("-", "/") in indices_commodities:
            return "indices_commodities"

        # Futures and Options
        futures_options = {
            "ES", "NQ", "CL", "GC", "TY", "BTC1!", "OPTION_CHAIN_BOUNDS", "OPTION_CHAIN_DELTA", "OPTION_CHAIN_GAMMA"
        }
        if s in futures_options or "!" in s or "OPTION" in s or s in ["E-MINI S&P 500", "E-MINI NASDAQ", "CRUDE OIL FUTURES", "GOLD FUTURES", "10-YEAR TREASURY NOTE", "BITCOIN FUTURES"]:
            return "futures_options"

        # Global Stocks & Equities
        stocks_symbols = {
            "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "BRK.B", "UNH", "LLY", "JNJ", "JPM",
            "XOM", "V", "PG", "MA", "AVGO", "HD", "CVX", "MRK", "ABBV", "COST", "PEP", "KO", "BAC", "WMT",
            "TSM", "ASML", "NVO", "SAP", "SHEL", "BABA", "TENT"
        }
        if s in stocks_symbols:
            return "stocks"

        return "stocks"

    @staticmethod
    def get_partition(tick: Dict[str, Any], market: str | None = None) -> Tuple[str, str]:
        symbol = tick.get("symbol", "UNKNOWN")
        if not market:
            market = TickPartitioner.infer_market(symbol)

        symbol_safe = symbol.replace("/", "_").replace("-", "_")
        ts = tick.get("timestamp", 0) / 1000.0
        dt = datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc)
        year = f"{dt.year:04d}"
        month = f"{dt.month:02d}"

        partition_dir = f"{market}/{symbol_safe}/{year}"
        filename = f"{month}.parquet"
        return partition_dir, filename

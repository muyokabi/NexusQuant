import pytest
import os
import sys
import shutil
import asyncio

# Setup path so we can import from src/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from pipeline.normalizer import MarketDataNormalizer
from pipeline.deduplicator import MarketDataDeduplicator
from pipeline.partitioner import TickPartitioner
from core.buffer_pool import IngestionBufferPool
from storage.parquet_writer import ParquetPartitionWriter

def test_normalizer():
    # Test binance trade event normalization
    payload = {
        "e": "trade",
        "E": 1700000000000,
        "s": "BTCUSDT",
        "p": "43500.50",
        "q": "0.15"
    }
    normalized = MarketDataNormalizer.normalize("binance", payload)
    assert normalized is not None
    assert normalized["symbol"] == "BTCUSDT"
    assert normalized["price"] == 43500.50
    assert normalized["volume"] == 0.15

def test_deduplicator():
    dedup = MarketDataDeduplicator()
    tick = {"symbol": "BTCUSDT", "timestamp": 1700000000000, "price": 43500.0, "volume": 1.0}

    assert dedup.is_duplicate(tick) is False
    assert dedup.is_duplicate(tick) is True  # subsequent calls with same parameters should return True

def test_partitioner():
    tick = {"symbol": "BTC/USDT", "timestamp": 1709299200000, "price": 62000.0} # March 1, 2024
    p_dir, f_name = TickPartitioner.get_partition(tick)
    assert "crypto" in p_dir
    assert "BTC_USDT" in p_dir
    assert "2024" in p_dir
    assert f_name == "03.parquet"

@pytest.mark.asyncio
async def test_buffer_pool():
    pool = IngestionBufferPool(flush_threshold=3)
    tick = {"symbol": "BTCUSDT", "price": 100.0}

    assert (await pool.add_tick(tick)) is None
    assert (await pool.add_tick(tick)) is None
    flushed = await pool.add_tick(tick)
    assert flushed is not None
    assert len(flushed) == 3

def test_parquet_writer():
    test_dir = "storage/test_parquet"
    if os.path.exists(test_dir):
        shutil.rmtree(test_dir)

    writer = ParquetPartitionWriter(base_dir=test_dir)
    ticks = [
        {"timestamp": 1700000000000, "symbol": "ETHUSDT", "price": 2200.0, "volume": 0.5, "bid": 2199.0, "ask": 2201.0, "bid_size": 1.0, "ask_size": 1.0},
        {"timestamp": 1700000010000, "symbol": "ETHUSDT", "price": 2205.0, "volume": 1.5, "bid": 2204.0, "ask": 2206.0, "bid_size": 2.0, "ask_size": 2.0}
    ]

    writer.write_batch(ticks)
    expected_path = os.path.join(test_dir, "crypto", "ETHUSDT", "2023", "11.parquet")
    assert os.path.exists(expected_path)

    # Cleanup
    if os.path.exists(test_dir):
        shutil.rmtree(test_dir)

def test_multi_market_normalization():
    # Forex
    payload_forex = {
        "instrument": "EUR/USD",
        "time": 1709299200000,
        "bids": [{"price": "1.0850", "liquidity": 100000}],
        "asks": [{"price": "1.0852", "liquidity": 100000}]
    }
    norm_forex = MarketDataNormalizer.normalize("multi_market", payload_forex)
    assert norm_forex is not None
    assert norm_forex["symbol"] == "EUR/USD"
    assert norm_forex["price"] == 1.0851
    assert TickPartitioner.infer_market("EUR/USD") == "forex"

    # Crypto
    payload_crypto = {
        "e": "trade",
        "E": 1709299200000,
        "s": "BTC/USDT",
        "p": "62000.00",
        "q": "1.5"
    }
    norm_crypto = MarketDataNormalizer.normalize("multi_market", payload_crypto)
    assert norm_crypto is not None
    assert norm_crypto["symbol"] == "BTC/USDT"
    assert norm_crypto["price"] == 62000.00
    assert TickPartitioner.infer_market("BTC/USDT") == "crypto"

    # Indices
    payload_indices = {
        "sym": "SPX",
        "t": 1709299200000,
        "p": 5100.00,
        "s": 1000
    }
    norm_indices = MarketDataNormalizer.normalize("multi_market", payload_indices)
    assert norm_indices is not None
    assert norm_indices["symbol"] == "SPX"
    assert norm_indices["price"] == 5100.00
    assert TickPartitioner.infer_market("SPX") == "indices_commodities"

    # Stocks
    payload_stocks = {
        "sym": "AAPL",
        "t": 1709299200000,
        "p": 180.50,
        "s": 500
    }
    norm_stocks = MarketDataNormalizer.normalize("multi_market", payload_stocks)
    assert norm_stocks is not None
    assert norm_stocks["symbol"] == "AAPL"
    assert norm_stocks["price"] == 180.50
    assert TickPartitioner.infer_market("AAPL") == "stocks"

    # Futures
    payload_futures = {
        "symbol": "BTC1!",
        "timestamp": 1709299200000,
        "last_price": 63000.00,
        "volume": 2.0
    }
    norm_futures = MarketDataNormalizer.normalize("multi_market", payload_futures)
    assert norm_futures is not None
    assert norm_futures["symbol"] == "BTC1!"
    assert norm_futures["price"] == 63000.00
    assert TickPartitioner.infer_market("BTC1!") == "futures_options"

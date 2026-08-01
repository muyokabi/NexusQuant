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
    # Check that partition file was written
    # 1700000000 => Nov 14 2023
    expected_path = os.path.join(test_dir, "crypto", "ETHUSDT", "2023", "11.parquet")
    assert os.path.exists(expected_path)

    # Cleanup
    if os.path.exists(test_dir):
        shutil.rmtree(test_dir)

import pytest
import os
import sys
import pandas as pd
import time

# Path injection
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analytics.duckdb_client import DuckDBClient
from aggregator.tick_resampler import TickResampler
from analytics.synthetic_builder import SyntheticSeriesBuilder
from sandbox.security_policy import SecurityPolicy
from sandbox.isolate_runner import SandboxedIsolateRunner

def test_duckdb_and_resampler():
    # Initialize in-memory duckdb client
    client = DuckDBClient(":memory:")
    resampler = TickResampler(client)

    ticks = []
    # Seed 1000 ticks in March 2024
    start_ts = 1709299200000  # March 1, 2024
    for i in range(1000):
        ticks.append({
            "timestamp": start_ts + i * 50, # every 50ms
            "symbol": "BTCUSDT",
            "price": 60000.0 + (i % 10) - 5,
            "volume": 10.0,
            "bid": 59999.0,
            "ask": 60001.0,
            "bid_size": 1.0,
            "ask_size": 1.0
        })

    client.insert_ticks(ticks)

    # Resample to 3-second bars
    df_bars = resampler.resample("BTCUSDT", "3s", start_ts, start_ts + 1000 * 50)
    assert not df_bars.empty
    assert "open" in df_bars.columns
    assert "close" in df_bars.columns

    # Test tick-count resampling ("10 Ticks")
    df_ticks = resampler.resample("BTCUSDT", "10 Ticks", start_ts, start_ts + 1000 * 50)
    assert not df_ticks.empty
    assert len(df_ticks) == 100 # 1000 ticks / 10 = 100 bars

    # Test volume resampling ("100 Volume")
    df_vol = resampler.resample("BTCUSDT", "100 Volume", start_ts, start_ts + 1000 * 50)
    assert not df_vol.empty

    # Test range resampling ("2 Range")
    df_range = resampler.resample("BTCUSDT", "2 Range", start_ts, start_ts + 1000 * 50)
    assert not df_range.empty

    # Test calendar resampling ("1D")
    df_day = resampler.resample("BTCUSDT", "1D", start_ts, start_ts + 1000 * 50)
    assert not df_day.empty

def test_synthetic_builders():
    candles = [
        {"timestamp": 1000, "open": 10.0, "high": 15.0, "low": 9.0, "close": 12.0, "volume": 100},
        {"timestamp": 2000, "open": 12.0, "high": 18.0, "low": 11.0, "close": 17.0, "volume": 120},
        {"timestamp": 3000, "open": 17.0, "high": 20.0, "low": 14.0, "close": 15.0, "volume": 150},
        {"timestamp": 4000, "open": 15.0, "high": 16.0, "low": 8.0, "close": 10.0, "volume": 80},
    ]
    df = pd.DataFrame(candles)

    # Heikin-Ashi
    ha_df = SyntheticSeriesBuilder.build_heikin_ashi(df)
    assert len(ha_df) == 4
    assert ha_df["close"].iloc[0] == 11.5  # (10 + 15 + 9 + 12)/4

    # Renko
    renko_bricks = SyntheticSeriesBuilder.build_renko(df, brick_size=2.0)
    assert len(renko_bricks) > 0
    assert "direction" in renko_bricks[0]
    assert renko_bricks[-1]["timestamp"] > renko_bricks[0]["timestamp"]

    # Kagi
    kagi_points = SyntheticSeriesBuilder.build_kagi(df, reversal_amount=2.0)
    assert len(kagi_points) >= 2

    # Line Break
    lb_bars = SyntheticSeriesBuilder.build_line_break(df, lines=3)
    assert len(lb_bars) >= 1

def test_sandbox_security_policy():
    # Check block words
    with pytest.raises(PermissionError):
        SecurityPolicy.validate_code("import os; os.system('clear')")

    with pytest.raises(PermissionError):
        SecurityPolicy.validate_code("eval('2+2')")

def test_sandbox_isolate_runner():
    code_str = """
def calculate(ctx):
    # Retrieve series
    closes = ctx.get_series("close")
    times = ctx.get_timestamps()

    # Emit primitives
    ctx.draw_line(0, closes[0], 1, closes[-1], color=(0, 255, 0, 255), width=2.0)
    ctx.draw_rect(0, 100, 10, 200, color=(255, 0, 0, 50))
    ctx.draw_text(5, 150, "SMC Order Block", color=(255, 255, 255, 255))
"""
    candles = [
        {"timestamp": 1000, "open": 10.0, "high": 15.0, "low": 9.0, "close": 12.0, "volume": 100},
        {"timestamp": 2000, "open": 12.0, "high": 18.0, "low": 11.0, "close": 17.0, "volume": 120},
    ]
    df = pd.DataFrame(candles)

    drawings = SandboxedIsolateRunner.run_indicator(code_str, df)
    assert len(drawings["lines"]) == 1
    assert len(drawings["rectangles"]) == 1
    assert len(drawings["texts"]) == 1
    assert drawings["lines"][0]["start"]["y"] == 12.0
    assert drawings["lines"][0]["end"]["y"] == 17.0

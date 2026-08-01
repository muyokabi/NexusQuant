import pytest
import os
import sys
import pandas as pd

# Path injection
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from indicators.engine import IndicatorEngine

def test_indicator_engine_registry():
    # Retrieve all definitions
    defs = IndicatorEngine.get_all_definitions()

    # We registered 50 indicators in Category A + 355 indicators in Categories B-G
    # Total registered: 50 + 355 = 405 indicators!
    assert len(defs) == 405, f"Expected 405 registered indicators, but got {len(defs)}."

    # Validate some random indicators by ID
    sma_spec = [d for d in defs if d["id"] == 1][0]
    assert "Simple Moving Average" in sma_spec["name"]
    assert sma_spec["category"] == "Overlap & Moving Averages"

    rsi_spec = [d for d in defs if d["id"] == 51][0]
    assert "Relative Strength Index" in rsi_spec["name"]
    assert rsi_spec["category"] == "Momentum & Oscillators"

    obv_spec = [d for d in defs if d["id"] == 131][0]
    assert "On-Balance Volume" in obv_spec["name"]
    assert obv_spec["category"] == "Volume & Order Flow"

    atr_spec = [d for d in defs if d["id"] == 191][0]
    assert "Average True Range" in atr_spec["name"]
    assert atr_spec["category"] == "Volatility & Market Breadth"

    ob_spec = [d for d in defs if d["id"] == 251][0]
    assert "Order Block" in ob_spec["name"]
    assert ob_spec["category"] == "Smart Money Concepts, ICT & Market Structure"

    zigzag_spec = [d for d in defs if d["id"] == 311][0]
    assert "Auto ZigZag" in zigzag_spec["name"]
    assert zigzag_spec["category"] == "Harmonic & Pattern Recognition"

    hurst_spec = [d for d in defs if d["id"] == 361][0]
    assert "Hurst" in hurst_spec["name"]
    assert hurst_spec["category"] == "Custom & Experimental Quant Tools"

def test_indicator_calculations():
    # Seed mock candles
    candles = [
        {"timestamp": 1000, "open": 10.0, "high": 15.0, "low": 9.0, "close": 12.0, "volume": 100},
        {"timestamp": 2000, "open": 12.0, "high": 18.0, "low": 11.0, "close": 17.0, "volume": 120},
        {"timestamp": 3000, "open": 17.0, "high": 20.0, "low": 14.0, "close": 15.0, "volume": 150},
        {"timestamp": 4000, "open": 15.0, "high": 16.0, "low": 8.0, "close": 10.0, "volume": 80},
        {"timestamp": 5000, "open": 10.0, "high": 12.0, "low": 7.0, "close": 9.0, "volume": 110},
    ]
    df = pd.DataFrame(candles)

    # Calculate EMA (ID 2)
    res_ema = IndicatorEngine.calculate(2, df, {"period": 3})
    assert "ema" in res_ema.columns
    assert len(res_ema) == 5

    # Calculate RSI (ID 51)
    res_rsi = IndicatorEngine.calculate(51, df, {"period": 3})
    assert len(res_rsi) == 5

    # Calculate OBV (ID 131)
    res_obv = IndicatorEngine.calculate(131, df, {})
    assert len(res_obv) == 5

    # Calculate Kalman state tracking (ID 364)
    res_kalman = IndicatorEngine.calculate(364, df, {})
    assert len(res_kalman) == 5

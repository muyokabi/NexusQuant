import pytest
import os
import sys
import asyncio

# Path injection
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from main import AlertEvaluator

@pytest.mark.asyncio
async def test_alert_above():
    evaluator = AlertEvaluator()
    alert = {
        "alert_id": "alert_1",
        "symbol": "BTCUSDT",
        "condition_type": "ABOVE",
        "threshold": 45000.0,
        "active": True
    }
    evaluator.add_alert(alert)

    # First tick initializes history
    triggered = await evaluator.evaluate_tick({"symbol": "BTCUSDT", "price": 44000.0})
    assert len(triggered) == 0

    # Second tick is above threshold
    triggered2 = await evaluator.evaluate_tick({"symbol": "BTCUSDT", "price": 45100.0})
    assert len(triggered2) == 1
    assert triggered2[0]["alert_id"] == "alert_1"
    assert triggered2[0]["active"] is False  # alert should be deactivated

@pytest.mark.asyncio
async def test_alert_crossing():
    evaluator = AlertEvaluator()
    alert = {
        "alert_id": "alert_cross",
        "symbol": "ETHUSDT",
        "condition_type": "CROSS",
        "threshold": 3000.0,
        "active": True
    }
    evaluator.add_alert(alert)

    # First tick: 2990
    await evaluator.evaluate_tick({"symbol": "ETHUSDT", "price": 2990.0})
    # Second tick: 3010 (crosses 3000)
    triggered = await evaluator.evaluate_tick({"symbol": "ETHUSDT", "price": 3010.0})
    assert len(triggered) == 1
    assert triggered[0]["alert_id"] == "alert_cross"

import pytest
import os
import sys
import asyncio

# Path injection
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from state_machine import ReplayStateMachine, ReplayState
from time_stream import HistoricalTimeStream
from controller import ReplayController

def test_time_stream():
    stream = HistoricalTimeStream()
    ticks = stream.load_ticks("BTCUSDT", 1700000000000, 1700005000000)
    assert len(ticks) > 0
    assert ticks[0]["symbol"] == "BTCUSDT"

def test_state_machine():
    fsm = ReplayStateMachine()
    assert fsm.state == ReplayState.STOPPED

    fsm.start(100, 200)
    assert fsm.state == ReplayState.PLAYING
    assert fsm.current_time_ms == 100

    fsm.pause()
    assert fsm.state == ReplayState.PAUSED

    fsm.resume()
    assert fsm.state == ReplayState.PLAYING

    fsm.stop()
    assert fsm.state == ReplayState.STOPPED

    fsm.seek(150)
    assert fsm.current_time_ms == 150

    fsm.set_speed(5.0)
    assert fsm.speed_multiplier == 5.0

@pytest.mark.asyncio
async def test_replay_controller():
    stream = HistoricalTimeStream()
    controller = ReplayController(stream)
    controller.configure_replay("ETHUSDT", 1000, 2000, speed=100.0)

    emitted = []
    async def callback(tick):
        emitted.append(tick)

    await controller.start_streaming(callback)
    await asyncio.sleep(0.1) # allow time to play
    await controller.stop_streaming()

    assert len(emitted) > 0
    assert emitted[0]["symbol"] == "ETHUSDT"

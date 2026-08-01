import asyncio
import logging
from typing import Callable, Any, Dict
from state_machine import ReplayStateMachine, ReplayState
from time_stream import HistoricalTimeStream

logger = logging.getLogger("ReplayController")

class ReplayController:
    """
    Coordinates state machine transitions and triggers data stream flushes
    to a consumer callback at variable playback rates.
    """
    def __init__(self, time_stream: HistoricalTimeStream):
        self.time_stream = time_stream
        self.fsm = ReplayStateMachine()
        self.ticks_queue = []
        self.playback_task: asyncio.Task | None = None

    def configure_replay(self, symbol: str, start_time: int, end_time: int, speed: float = 1.0):
        self.fsm.start(start_time, end_time)
        self.fsm.set_speed(speed)
        self.ticks_queue = self.time_stream.load_ticks(symbol, start_time, end_time)
        logger.info(f"Loaded {len(self.ticks_queue)} historical ticks for replay.")

    async def start_streaming(self, send_callback: Callable[[Dict[str, Any]], Any]):
        self.playback_task = asyncio.create_task(self._stream_loop(send_callback))

    async def stop_streaming(self):
        self.fsm.stop()
        if self.playback_task:
            self.playback_task.cancel()
            try:
                await self.playback_task
            except asyncio.CancelledError:
                pass

    async def _stream_loop(self, send_callback: Callable[[Dict[str, Any]], Any]):
        idx = 0
        while self.fsm.state != ReplayState.STOPPED:
            if self.fsm.state == ReplayState.PAUSED:
                await asyncio.sleep(0.1)
                continue

            if idx >= len(self.ticks_queue):
                logger.info("Reached end of replay data.")
                self.fsm.stop()
                break

            tick = self.ticks_queue[idx]
            self.fsm.current_time_ms = tick["timestamp"]
            await send_callback(tick)

            idx += 1
            # Wait based on speed. Standard delay is 0.5s divided by speed multiplier
            delay = 0.5 / self.fsm.speed_multiplier
            await asyncio.sleep(max(delay, 0.001))

        logger.info("Playback stream task stopped.")

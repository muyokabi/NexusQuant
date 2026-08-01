from enum import Enum
import logging

logger = logging.getLogger("ReplayStateMachine")

class ReplayState(Enum):
    STOPPED = 0
    PLAYING = 1
    PAUSED = 2
    SEEKING = 3

class ReplayStateMachine:
    """
    Finite State Machine regulating playback states, position tracking, and speeds.
    """
    def __init__(self):
        self.state = ReplayState.STOPPED
        self.speed_multiplier = 1.0
        self.current_time_ms = 0
        self.start_time_ms = 0
        self.end_time_ms = 0

    def start(self, start_time: int, end_time: int):
        self.start_time_ms = start_time
        self.end_time_ms = end_time
        self.current_time_ms = start_time
        self.state = ReplayState.PLAYING
        logger.info(f"Replay started from {start_time} to {end_time}")

    def pause(self):
        if self.state == ReplayState.PLAYING:
            self.state = ReplayState.PAUSED
            logger.info("Replay paused.")

    def resume(self):
        if self.state == ReplayState.PAUSED:
            self.state = ReplayState.PLAYING
            logger.info("Replay resumed.")

    def stop(self):
        self.state = ReplayState.STOPPED
        self.current_time_ms = self.start_time_ms
        logger.info("Replay stopped.")

    def seek(self, target_time_ms: int):
        if self.start_time_ms <= target_time_ms <= self.end_time_ms:
            self.current_time_ms = target_time_ms
            logger.info(f"Replay seeked to {target_time_ms}")
        else:
            logger.warning(f"Seek target {target_time_ms} is out of bounds [{self.start_time_ms}, {self.end_time_ms}]")

    def set_speed(self, speed: float):
        if 0.1 <= speed <= 100.0:
            self.speed_multiplier = speed
            logger.info(f"Replay speed multiplier set to {speed}x")
        else:
            logger.warning(f"Speed {speed} is invalid. Keep between 0.1 and 100.")

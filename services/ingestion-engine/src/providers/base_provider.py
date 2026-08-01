import abc
import asyncio
from typing import Callable, Dict, Any

class BaseProvider(abc.ABC):
    """
    Abstract Base Class for all ingestion market data providers.
    Ensures structured connection state, logging, and unified callback dispatch.
    """
    def __init__(self, symbol: str, callback: Callable[[Dict[str, Any]], None]):
        self.symbol = symbol
        self.callback = callback
        self.is_running = False
        self.task: asyncio.Task | None = None

    @abc.abstractmethod
    async def connect(self):
        """Establish connection to the endpoint."""
        pass

    @abc.abstractmethod
    async def disconnect(self):
        """Tear down connection and release resources."""
        pass

    async def start(self):
        """Start background listening task."""
        self.is_running = True
        self.task = asyncio.create_task(self._listen_loop())

    async def stop(self):
        """Stop background task."""
        self.is_running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        await self.disconnect()

    @abc.abstractmethod
    async def _listen_loop(self):
        """Internal loop listening for live events."""
        pass

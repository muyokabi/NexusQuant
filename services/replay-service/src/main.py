import asyncio
import json
import logging
import websockets
from time_stream import HistoricalTimeStream
from controller import ReplayController

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] ReplayService: %(message)s")
logger = logging.getLogger("ReplayServer")

class ReplayWebSocketServer:
    """
    WebSocket server allowing client connections to control and consume
    high-speed historical playbacks.
    """
    def __init__(self, host: str = "0.0.0.0", port: int = 8081):
        self.host = host
        self.port = port
        self.time_stream = HistoricalTimeStream()
        self.controller = ReplayController(self.time_stream)

    async def handler(self, websocket):
        logger.info(f"Client connected: {websocket.remote_address}")

        async def send_callback(tick: dict):
            if websocket.open:
                await websocket.send(json.dumps({"type": "tick", "data": tick}))

        try:
            async for message in websocket:
                try:
                    req = json.loads(message)
                except Exception:
                    continue

                cmd = req.get("command")
                if cmd == "START":
                    symbol = req.get("symbol", "BTCUSDT")
                    start = req.get("start_time", 1700000000000)
                    end = req.get("end_time", 1700086400000)
                    speed = req.get("speed", 1.0)
                    self.controller.configure_replay(symbol, start, end, speed)
                    await self.controller.start_streaming(send_callback)
                    await websocket.send(json.dumps({"type": "status", "state": "PLAYING"}))

                elif cmd == "PAUSE":
                    self.controller.fsm.pause()
                    await websocket.send(json.dumps({"type": "status", "state": "PAUSED"}))

                elif cmd == "RESUME":
                    self.controller.fsm.resume()
                    await websocket.send(json.dumps({"type": "status", "state": "PLAYING"}))

                elif cmd == "STOP":
                    await self.controller.stop_streaming()
                    await websocket.send(json.dumps({"type": "status", "state": "STOPPED"}))

                elif cmd == "SPEED":
                    speed = float(req.get("speed", 1.0))
                    self.controller.fsm.set_speed(speed)
                    await websocket.send(json.dumps({"type": "status", "speed": speed}))

                elif cmd == "SEEK":
                    target = int(req.get("timestamp", 0))
                    self.controller.fsm.seek(target)
                    await websocket.send(json.dumps({"type": "status", "current_time": target}))

        except websockets.exceptions.ConnectionClosed:
            logger.info("Client connection closed.")
        finally:
            await self.controller.stop_streaming()

    async def start(self):
        async with websockets.serve(self.handler, self.host, self.port):
            logger.info(f"Replay WebSocket server running on ws://{self.host}:{self.port}")
            await asyncio.Future()  # run forever

if __name__ == "__main__":
    server = ReplayWebSocketServer()
    asyncio.run(server.start())

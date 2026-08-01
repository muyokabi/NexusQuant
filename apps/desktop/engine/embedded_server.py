import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading
from analytics.duckdb_client import DuckDBClient
from analytics.tick_resampler import TickResampler
from analytics.synthetic_builder import SyntheticSeriesBuilder
from plugins_runtime.manager import PluginsRuntimeManager

class EngineHTTPServer:
    """
    Embedded server exposing DuckDB analytical metrics, Resampler,
    Synthetic builders, and Sandbox environments to Tauri.
    """
    def __init__(self, host: str = "127.0.0.1", port: int = 8082):
        self.host = host
        self.port = port
        self.db_client = DuckDBClient(":memory:")
        self.resampler = TickResampler(self.db_client)
        self.plugins_manager = PluginsRuntimeManager()
        self.server: HTTPServer | None = None
        self.thread: threading.Thread | None = None

        class EngineHandler(BaseHTTPRequestHandler):
            ref = self

            def log_message(self, format, *args):
                pass  # Suppress logging

            def do_POST(self):
                content_length = int(self.headers['Content-Length'])
                body = self.rfile.read(content_length).decode('utf-8')

                try:
                    req = json.loads(body)
                except Exception:
                    self.send_response(400)
                    self.end_headers()
                    return

                action = req.get("action")
                resp_data = {"success": True}

                if action == "insert_ticks":
                    ticks = req.get("ticks", [])
                    self.ref.db_client.insert_ticks(ticks)
                    resp_data["message"] = f"Inserted {len(ticks)} ticks successfully."

                elif action == "resample":
                    symbol = req.get("symbol", "")
                    timeframe = req.get("timeframe", "1m")
                    start = req.get("start", 0)
                    end = req.get("end", 0)
                    df = self.ref.resampler.resample(symbol, timeframe, start, end)
                    resp_data["candles"] = df.to_dict(orient="records")

                elif action == "synthetic":
                    chart_type = req.get("type", "")
                    candles = req.get("candles", [])
                    import pandas as pd
                    df = pd.DataFrame(candles)
                    if chart_type == "heikin_ashi":
                        res_df = SyntheticSeriesBuilder.build_heikin_ashi(df)
                        resp_data["candles"] = res_df.to_dict(orient="records")
                    elif chart_type == "renko":
                        size = float(req.get("brick_size", 10.0))
                        resp_data["bricks"] = SyntheticSeriesBuilder.build_renko(df, size)
                    elif chart_type == "kagi":
                        rev = float(req.get("reversal_amount", 5.0))
                        resp_data["points"] = SyntheticSeriesBuilder.build_kagi(df, rev)
                    elif chart_type == "line_break":
                        lines = int(req.get("lines", 3))
                        resp_data["bars"] = SyntheticSeriesBuilder.build_line_break(df, lines)
                    else:
                        resp_data["success"] = False
                        resp_data["error"] = f"Unsupported synthetic type: {chart_type}"

                else:
                    resp_data["success"] = False
                    resp_data["error"] = f"Unknown action: {action}"

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp_data).encode("utf-8"))

        self.handler_class = EngineHandler

    def start(self):
        self.server = HTTPServer((self.host, self.port), self.handler_class)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def stop(self):
        if self.server:
            self.server.shutdown()
            self.server.server_close()
        if self.thread:
            self.thread.join()
        self.db_client.close()

if __name__ == "__main__":
    server = EngineHTTPServer()
    server.start()
    print("Engine server started on 127.0.0.1:8082")
    try:
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        server.stop()

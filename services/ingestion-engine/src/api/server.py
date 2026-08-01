import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading
from core.telemetry import IngestionTelemetry

class TelemetryHTTPServer:
    """
    HTTP Server to serve live telemetry JSON metrics over REST.
    """
    def __init__(self, telemetry: IngestionTelemetry, port: int = 9090):
        self.telemetry = telemetry
        self.port = port
        self.server: HTTPServer | None = None
        self.thread: threading.Thread | None = None

        # Inline handler class to capture telemetry closure safely
        class TelemetryHandler(BaseHTTPRequestHandler):
            telemetry_ref = self.telemetry

            def log_message(self, format, *args):
                pass  # Suppress logging

            def do_GET(self):
                if self.path == "/metrics" or self.path == "/":
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    metrics = self.telemetry_ref.get_metrics()
                    self.wfile.write(json.dumps(metrics).encode("utf-8"))
                else:
                    self.send_response(404)
                    self.end_headers()

        self.handler_class = TelemetryHandler

    def start(self):
        self.server = HTTPServer(("0.0.0.0", self.port), self.handler_class)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def stop(self):
        if self.server:
            self.server.shutdown()
            self.server.server_close()
        if self.thread:
            self.thread.join()

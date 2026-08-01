# Ingestion Service Development Guide

The Ingestion Service is a real-time market data connection pipeline designed to fetch, parse, and stream financial tick data directly into the desktop charting engine.

## Service Architecture

The service leverages highly efficient network protocols and formats to handle microsecond trade updates without queue congestion:

- **Data Sources:** Direct low-latency TCP socket handlers and high-performance WebSockets.
- **Serialization:** FlatBuffers payload serialization (using schema types compiled with `flatc`).
- **Buffers:** Circular ring-buffer data structures to handle heavy traffic spikes gracefully.

## Execution and Troubleshooting

To run the ingestion pipeline service locally:

```bash
# Start ingestion daemon
poetry run python -m services.ingestion_engine.main
```

Ensure absolute imports paths are preserved correctly by setting:
```bash
export PYTHONPATH=$(pwd)
```

# WebSocket Feed Protocol Specification

The NexusQuant Trading Terminal establishes a high-performance raw WebSocket connection to sync order books and tick streams.

## Protocol Payloads

All communication is formatted as compact FlatBuffer binary schemas or compressed JSON segments to minimize latency:

### Tick Update (JSON Schema)

```json
{
  "type": "tick",
  "symbol": "BTC/USDT",
  "price": 63945.50,
  "volume": 1.25,
  "time": 1718224500000,
  "bidVol": 4,
  "askVol": 12
}
```

### Depth Level-3 Update

```json
{
  "type": "depth",
  "symbol": "BTC/USDT",
  "asks": [
    [64280.00, 14.50],
    [64250.00, 8.12]
  ],
  "bids": [
    [63800.00, 45.01],
    [63750.00, 12.50]
  ]
}
```

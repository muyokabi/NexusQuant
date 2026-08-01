# ADR 0002: Inter-Process Communication (IPC) Protocol

- **Status:** Approved
- **Date:** June 2024

## Context & Problem Statement

Real-time streaming engines must parse thousands of raw tick segments per second. Standard text serialization like JSON is highly CPU-intensive and introduces garbage collection spikes, violating zero-latency requirements.

## Decision

We chose Google FlatBuffers (`flatc` compiled binaries) for high-frequency Inter-Process Communication:
- **Zero-Copy Deserialization:** Direct memory access without deep copying memory structures.
- **Strict Backward-Compatibility:** Seamless protocol versioning with zero data loss or translation layer overhead.

## Consequences

- Direct memory parsing in the Rust backend and TypeScript frontend wrappers.
- Reduced CPU load during heavy market volatility spikes.

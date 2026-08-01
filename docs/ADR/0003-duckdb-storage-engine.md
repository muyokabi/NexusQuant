# ADR 0003: DuckDB Columnar Storage Engine

- **Status:** Approved
- **Date:** June 2024

## Context & Problem Statement

Storing and querying historical tick bars requires handling millions of data points with fast columnar calculations and sliding aggregation windows.

## Decision

We chose **DuckDB** as our embedded historical storage engine:
- Columnar format tailored for high-performance aggregations.
- Zero-configuration local database architecture with instant query response times.

## Consequences

- Ultra-fast calculations of time-based metrics directly on disk.
- Simplified data synchronization between real-time memory queues and on-disk historical blocks.

# ADR 0004: Custom WebGL/Canvas Rendering Engine

- **Status:** Approved
- **Date:** June 2024

## Context & Problem Statement

Standard HTML or SVG-based charting tools fail to maintain smooth, high frame rates under heavy tick stream density. Re-rendering thousands of elements inside the DOM causes severe interface stuttering.

## Decision

We designed a unified, custom high-performance **Canvas 2D and WebGL-optimized rendering engine**:
- Direct hardware acceleration.
- Batch drawing commands to minimize GPU redraw calls.
- Encapsulated rendering methods (like Heikin-Ashi, Kagi, SVP) into independent paint algorithms.

## Consequences

- Stable 60 to 120 FPS performance under extreme trade-intensity streams.
- Full layout flexibility with low memory consumption.

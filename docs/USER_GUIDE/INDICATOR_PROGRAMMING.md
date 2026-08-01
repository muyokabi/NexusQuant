# Indicator Programming & Scripting Guide

This guide describes how to program and wire custom modular indicators and overlay renderers into the high-performance Canvas rendering pipeline.

## Scripting API Overview

Custom indicators execute logic asynchronously or synchronously on input market data streams (bars or ticks). Calculations are compiled or computed, and then bound directly to the Canvas drawing cycle.

### Registering custom indicators

Register custom indicator calculations using modular hooks:

```typescript
import { MarketBar } from "../utils/math";

export interface IndicatorMetadata {
  id: string;
  name: string;
  calculate: (bars: MarketBar[]) => number[];
  render: (ctx: CanvasRenderingContext2D, values: number[]) => void;
}
```

### High-Performance Calculations Guidelines

To prevent garbage collection cycles from affecting WebGL or Canvas rendering frame rates, adhere to the following strict guidelines:

1. **Pre-allocate Buffers:** Avoid creating new arrays on every frame calculation. Pre-allocate buffer arrays and update only the newest indexes as new ticks arrive.
2. **Batch Calculations:** Group calculations using dynamic batching configurations to run heavy algorithms (e.g. Monte Carlo paths or Kalman filters) on background worker threads.
3. **Low Complexity:** Ensure calculation loops are optimized to $O(N)$ or better, running calculations strictly within visible bars ranges.

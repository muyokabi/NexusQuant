# Plugin Interface Specification

This document outlines the API contracts for writing plugin extensions that interact with the NexusQuant Pro Trading Terminal.

## Core Interface

Plugins are loaded dynamically and must expose the `NexusPlugin` interface structure:

```typescript
export interface NexusPlugin {
  id: string;
  version: string;
  initialize: (context: PluginContext) => void;
  destroy?: () => void;
}

export interface PluginContext {
  subscribeToTicks: (symbol: string, callback: (tick: TickPayload) => void) => void;
  getVisiblePriceRange: () => { min: number; max: number };
  drawOverlayLine: (p1: Point, p2: Point, color: string) => void;
}
```

All dynamic plugins are executed inside a sandboxed iframe or a secure worker thread to preserve the main interface rendering performance.

# Component Isolation & Visual Boundaries Guide

Component Isolation guarantees that layout panels (such as the canvas, order book, watchlist, and portfolio drawer) remain independent and self-contained, communicating exclusively through well-defined reactive state hooks or centralized store actions.

## Key Architecture Patterns

- **Separation of Render & State:** Canvas drawing engines must be pure functions of price bars and color configurations. They do not manage sidebar selections or trigger state updates.
- **Isolated Layout Containers:** Each workspace panel acts as an isolated flex container, ensuring DOM layout overflows are trapped inside the panel and do not affect other viewports.
- **Micro-Animations Isolation:** Maintain highly-optimized local transitions (<= 150ms CSS animations) inside individual buttons or lists to avoid triggering global component repaints.

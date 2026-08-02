# Contributing Guide

We appreciate your contributions to the NexusQuant Pro Trading Terminal repo. Please review the following developer guidelines before opening pull requests.

## Workflow & Coding Standards

1. **Monorepo Workspace:** We utilize a monorepo structure managed by `pnpm`. Run core frontend developments within `apps/desktop/frontend`.
2. **Strict Typings:** Avoid using `any`. Write highly-explicit interface properties and custom type bounds.
3. **Low-Latency Rendering:** All canvas operations must run within highly-optimized repaint loops. Ensure memory footprint is minimal and avoid unnecessary React hooks dependency updates.
4. **No Placeholders:** Avoid any placeholder comments, stubs, mock TODOs, or empty functions. All code must be production-ready and fully implemented.

## Building and Verification

Always verify all code compiles cleanly before submitting:
```bash
pnpm -r build
```
Ensure all frontend rendering updates are visually checked using Playwright screenshot generators.

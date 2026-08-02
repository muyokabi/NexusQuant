# ADR 0001: Monorepo Workspace Architecture

- **Status:** Approved
- **Date:** June 2024

## Context & Problem Statement

We require a scalable, professional repository design capable of organizing multiple distinct modules, including TypeScript frontend, Rust calculations packages, Python ingestion services, and unified TypeScript APIs.

## Decision

We selected a Monorepo workspace structure built using `pnpm` workspace filters:
- **`pnpm-workspace.yaml`** manages multi-project dependencies.
- **Frontend App:** Located inside `apps/desktop/frontend`.
- **Shared packages:** Built under `packages/core-types` and `packages/plugin-sdk`.

## Consequences

- Easy cross-workspace linking.
- Unified build cycles and reproducible dependency lock-files.

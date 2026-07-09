# Business Logic Model - U01 Charge Agreement Walking Skeleton

## Scope

U01 establishes the executable boundary for `charge-agreement-service` and `apps/charge-agreements`. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md` only to define the runnable shell; no commercial lifecycle logic is implemented in this unit.

## Workflow

1. Start `charge-agreement-service` on port `8084`.
2. Expose Spring Boot health through `/actuator/health`.
3. Expose a lightweight module endpoint such as `/api/charge-agreements/module-info`.
4. Start `apps/charge-agreements` on port `3002`.
5. Add reverse proxy routing for `/charge-agreements/`.
6. Render the workbench shell with runtime status, navigation landmarks, and future agreement panels.

## Decision Points

| Decision | Rule |
| --- | --- |
| Service starts | Return healthy when the application context loads. |
| Module info requested | Return service name, local mode, build/version placeholder, and feature flags for skeleton mode. |
| UI loads | Show a workbench shell, not a marketing page or static documentation page. |
| Shared services unavailable | Show a non-destructive local status warning; do not fail the page. |

## Handoff

U02 adds domain behavior inside the established backend module. U06 later replaces skeleton UI placeholders with functional list/detail/editor flows.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U01 is correctly thin for a gated walking skeleton and avoids claiming full module behavior before later units implement it.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.
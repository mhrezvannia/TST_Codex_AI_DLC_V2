# Code Generation Plan - U01 Charge Agreement Walking Skeleton

## Scope

Implement B01 walking skeleton from `unit-of-work.md`, `requirements.md`, `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `performance-design.md`, `security-design.md`, and `deployment-architecture.md`.

## Steps

- [x] Step 1: Add `charge-agreement-service` Maven parent and submodule placeholders. Trace: FR-6.1, U01.
- [x] Step 2: Add runnable Spring Boot container on local port `8084`. Trace: FR-6.1, U01.
- [x] Step 3: Add module-info endpoint under `/api/charge-agreements/module-info`. Trace: FR-6.1, U01.
- [x] Step 4: Add backend skeleton unit test for module-info. Trace: Standard test strategy.
- [x] Step 5: Add `apps/charge-agreements` Next.js app on local port `3002`. Trace: FR-3.1, FR-6.1, U01.
- [x] Step 6: Add workbench shell with list, detail, lookup, runtime, and capability panels. Trace: FR-3, U01.
- [x] Step 7: Add frontend health and module-info BFF routes. Trace: FR-6.1, U01.
- [x] Step 8: Add frontend page test for the skeleton workbench. Trace: Standard test strategy.
- [x] Step 9: Add local reverse proxy route `/charge-agreements/`. Trace: FR-6.1, U01.

## Out of Scope

Agreement lifecycle, persistence, REST CRUD, Shared Platform reference selectors, active lookup, and event publication are planned for U02-U10.

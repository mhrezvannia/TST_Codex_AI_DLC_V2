# Code Generation Plan - U06 Reference Data Frontend App and BFF

## Source Trace

This plan implements U06 from `business-logic-model.md`, `business-rules.md`, `frontend-components.md`, `security-design.md`, `performance-design.md`, and `deployment-architecture.md`.

U06 expands `apps/reference-data` from a shell into a reference administration workspace with BFF route handlers, permission-aware read/write states, reference-set navigation, list/detail/status views, validation-ready form helpers, and tests. Browser code must not call backend services directly, and no downstream Charge, Booking, or Container Movement runtime screens are in scope.

## Implementation Steps

- [x] Step 1: Add reference workspace domain/view models.
  - Traceability: BR-U06-007 through BR-U06-012, BR-U06-022 through BR-U06-025.
  - Define descriptors for all nine MVP reference sets, sample local rows, permission state, history/status projections, and Zod form schemas.

- [x] Step 2: Add BFF route handlers.
  - Traceability: BR-U06-001 through BR-U06-006, BR-U06-008 through BR-U06-010.
  - Add `/api/reference-sets`, `/api/reference-sets/[set]/records`, `/api/reference-sets/[set]/records/[id]`, `/api/reference-sets/[set]/records/[id]/history`, and `/api/permissions/reference-data` handlers.
  - Use server-side placeholder adapters and correlation ids; do not expose backend service URLs to browser code.

- [x] Step 3: Build the reference workspace UI.
  - Traceability: BR-U06-007 through BR-U06-012, BR-U06-026 through BR-U06-030.
  - Replace the placeholder page with a dense admin workspace: nav, permission banner, search/filter controls, semantic table, mobile cards, detail panel, history/status panel, and action bar.

- [x] Step 4: Add validation-ready create/edit/status components.
  - Traceability: BR-U06-013 through BR-U06-021.
  - Add Zod-backed validation helpers and visible validation summary/read-only mutation states. React Hook Form integration remains pending until the dependency is installed.

- [x] Step 5: Add tests.
  - Traceability: Standard test strategy.
  - Cover workspace rendering, all nine set navigation items, read-only permission banner, table semantics, event status text labels, and BFF helper behavior.

- [x] Step 6: Run verification.
  - Traceability: U06 frontend quality and security rules.
  - Run app-level Vitest, direct TypeScript check where possible, source scans for direct browser-to-service calls and downstream runtime screens, and record any unavailable tooling.

## Test Strategy

The active strategy is Standard. U06 must include component tests and utility/BFF tests that run without backend services. Full BFF integration with live `reference-data-service` and `identity-service` remains a later local-compose verification step.

## Approval

This plan is ready for review before U06 implementation.

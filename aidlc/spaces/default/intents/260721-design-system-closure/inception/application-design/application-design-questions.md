# Application Design Questions — W2-02 Design-System Closure

## Fixed Architecture Context

The design must reconcile `requirements.md`, `stories.md`, brownfield `architecture.md`, `component-inventory.md`, and `team-practices.md`. Graph evidence shows duplicate Booking presentation implementations in `apps/shell` and `apps/booking`, while nginx and `apps/shell/lib/booking-client.ts` make the shell route canonical. Existing BFF, service, storage, event, authentication, and deployment contracts remain fixed.

## Q1. How should the duplicate Booking presentation seam be closed?

A. Keep `apps/shell` as the sole canonical Booking presentation and migrate its route compositions to `@erp/ui`; retain `apps/booking` as the protected BFF/service adapter, decommission or redirect its standalone presentation routes, and preserve all BFF endpoints (recommended)
B. Keep both independent Booking UIs and make them visually similar
C. Make the standalone `apps/booking` port canonical and bypass `apps/shell`
D. Embed one application in the other with an iframe
X. Other (please specify)

[Answer]: A — Shell UI + BFF app (Recommended) — 2026-07-21T14:15:38Z — **Mode:** guided

## Q2. Where should shared versus domain UI code live?

A. Add or correct only generic tokens/primitives in `packages/ui`; keep Booking-specific list/form/detail compositions in the canonical shell route, and create no new domain UI package or app-to-app import (recommended)
B. Move Booking-specific forms and lifecycle panels into `packages/ui`
C. Create a new `packages/booking-ui` solely to keep both frontends
D. Copy shared primitives into each application
X. Other (please specify)

[Answer]: A — Primitives shared (Recommended) — 2026-07-21T14:15:38Z — **Mode:** guided

## Q3. How should service communication and data ownership change?

A. Do not change them: preserve synchronous shell → Booking BFF → Booking service/reference/pricing calls, asynchronous confirmed-Booking events, service-owned stores, authentication metadata, correlation, idempotency, limits, and timeouts (recommended)
B. Replace synchronous calls with a new event-driven UI workflow
C. Let the shell call Booking-service directly and bypass the BFF
D. Add a shared database/read model for the UI
X. Other (please specify)

[Answer]: A — Preserve contracts (Recommended) — 2026-07-21T14:15:38Z — **Mode:** guided

## Q4. Where should live acceptance and evidence orchestration live?

A. Add focused root-level Playwright/config/evidence helpers that operate the canonical route through `scripts/wave-a-compose.mjs`, write `artifacts/w2-02-live/`, and preserve pre/post demo guards; add no AWS or production infrastructure (recommended)
B. Put acceptance logic inside `packages/ui`
C. Run only component tests against a detached Storybook-like surface
D. Add a new AWS environment for this local closure
X. Other (please specify)

[Answer]: A — Root acceptance harness (Recommended) — 2026-07-21T14:17:33Z — **Mode:** guided

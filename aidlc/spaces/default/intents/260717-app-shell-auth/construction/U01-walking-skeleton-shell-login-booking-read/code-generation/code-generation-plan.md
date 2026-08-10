# Code Generation Plan - U01 Walking Skeleton

## Unit Scope

U01 implements the walking skeleton path: Nginx -> `apps/shell` -> existing auth/session cookie contract -> Booking read/list -> booking-service. It covers US-01, US-02, and US-03, with traceability to FR-01, FR-02, FR-03, FR-05, FR-09, FR-10, NFR-01, NFR-02, NFR-03, NFR-04, NFR-07, and NFR-08.

## Plan Steps

- [x] Step 1: Shared auth session helpers and tests. Add reusable helpers in `packages/auth` for safe `lc_session` decoding, summary generation, and actor extraction from a server `Request`, then add unit tests covering valid sessions, missing sessions, expired sessions, and missing actor fail-closed behavior. Traceability: US-01, US-02; FR-03, FR-05; NFR-01, NFR-02, NFR-03.
- [x] Step 2: Booking BFF actor propagation and tests. Change `apps/booking/lib/bookings.ts` so read and proxy paths call `serviceHeaders(correlationId, actorSubjectId, idempotencyKey?)`, reject missing/blank actors before backend fetch, and never synthesize `local-user` on protected paths. Update Booking tests to assert actor header propagation and no backend call when the actor is missing. Traceability: US-02; FR-05, FR-10; NFR-02, NFR-03, NFR-04.
- [x] Step 3: Shell workspace setup. Create `apps/shell` as a Next.js workspace `@erp/app-shell` using existing App Router, TypeScript, Vitest, and inline/global CSS patterns without Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. Traceability: US-01, US-03; FR-01, FR-09; NFR-07.
- [x] Step 4: Shell protected routes. Implement `apps/shell` root layout, protected landing page `/`, and `/booking` page with server-side session guard, safe session summary display, shell navigation, breadcrumbs, and user menu placeholder for later sign-out. Unauthenticated requests redirect to existing `/auth/sign-in?returnUrl=...`; raw tokens are never serialized. Traceability: US-01, US-03; FR-01, FR-02, FR-03; NFR-01, NFR-02, NFR-09.
- [x] Step 5: Shell Booking read adapter. Implement the thinnest read-only `/booking` view by calling the Booking BFF/service path with the session-derived actor and correlation id, rendering the existing Booking list semantics inside shell chrome, and avoiding create/deny/sign-out compatibility behavior that belongs to later units. Traceability: US-02, US-03; FR-04, FR-05, FR-10; NFR-03, NFR-04, NFR-06.
- [x] Step 6: Shell tests. Add component/server tests for protected-route redirect, authenticated shell rendering, `/booking` read with non-`local-user` actor, and fail-closed behavior when no actor exists. Traceability: US-01, US-02; FR-02, FR-03, FR-05; NFR-02, NFR-03.
- [x] Step 7: Compose and Nginx wiring. Add `apps-shell` to `compose.yaml` using `infrastructure/docker/next-app.Dockerfile` with `WORKSPACE: "@erp/app-shell"`, wire server-only `BOOKING_SERVICE_URL` and `BOOKING_SERVICE_TOKEN`, and route `/` plus `/booking*` through Nginx to shell while preserving `/auth/`, `/reference-data/`, `/health`, and existing app services. Traceability: US-01, US-02; FR-01, FR-02, FR-10; NFR-08.
- [x] Step 8: Verification commands. Run focused package tests for `packages/auth`, `apps/booking`, and `apps/shell`, then run type-check/lint where supported by package scripts. Document any tool limitation honestly. Traceability: U01 DoD and stage sensors.
- [x] Step 9: Code summary. Write `code-summary.md` listing files changed, key decisions, test coverage, deviations from this plan, and U01 risks that remain for Build/Test or later units. Traceability: stage output contract.

## Non-Goals

- Do not implement Booking create, authorization deny UI, sign-out/session expiry proof, `/bookings*` compatibility redirects, final detector packaging, AWS/cloud infrastructure, CDN, cache, or new runtime services in U01.
- Do not rewrite or revalidate W0-01, W0-02, W1-01, or W2-02 as part of this unit. Preserve their existing routes and contracts.
- Do not rewrite W1's live-proof waiver from BLOCKED at `compose-start` into a PASS.

## Planned Verification

| Check | Command |
| --- | --- |
| Shared auth tests | `yarn workspace @erp/auth test` |
| Booking BFF tests | `yarn workspace @erp/app-booking test` |
| Shell tests | `yarn workspace @erp/app-shell test` |
| Shell type-check | `yarn workspace @erp/app-shell typecheck` |
| Shell build or monorepo build | `yarn workspace @erp/app-shell build` or targeted Turbo check if package build is blocked |

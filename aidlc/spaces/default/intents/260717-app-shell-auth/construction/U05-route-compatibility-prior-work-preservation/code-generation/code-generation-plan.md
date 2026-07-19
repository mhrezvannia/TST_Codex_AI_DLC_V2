# Code Generation Plan - U05 Route Compatibility and Prior Work Preservation

## Unit Scope

U05 preserves legacy `/bookings*` entry points while keeping canonical W2-01 shell routes at `/booking`, `/booking/new`, and `/booking/[id]`. Compatibility must land in shell chrome, preserve auth/session/actor behavior by redirecting before any data load, and document prior-work preservation for W0-01, W0-02, W1-01, and W2-02.

Traceability: US-03 and US-04; FR-04, FR-09; NFR-06, NFR-07, NFR-10; Acceptance Criteria 8, 10, 11.

## Plan Steps

- [x] Step 1: Compatibility route helper. Add a shell helper that maps `/bookings` to `/booking` while preserving only `page`, `pageSize`, `sort`, `direction`, `status`, and `q`, keeping the first duplicate value and dropping unknown query keys. Traceability: ROUTE-01, ROUTE-02; NFR-07.
- [x] Step 2: Create/new route compatibility pages. Add shell `/bookings` and `/bookings/new` pages that issue static `308` redirects to canonical shell routes and do not invoke Booking data loaders. Traceability: ROUTE-02, ROUTE-04; FR-04, FR-09.
- [x] Step 3: Detail route compatibility page. Add shell `/bookings/[id]` route that rejects empty, traversal, encoded-slash, malformed, or extra-segment ids with shell 404; valid one-segment ids redirect to `/booking/[encoded-id]` with query dropped. Traceability: ROUTE-02, ROUTE-03; NFR-03, NFR-07.
- [x] Step 4: Nginx forwarding. Update local Nginx to forward `/bookings` and `/bookings/` to `apps-shell` so the shell-owned compatibility redirects are reachable in Compose. Traceability: deployment route plan; FR-09.
- [x] Step 5: Route tests. Add shell tests for list query allowlist, duplicate handling, unknown query dropping, `/bookings/new` precedence, detail id encoding, and invalid-id rejection. Traceability: U05 security verification.
- [x] Step 6: Prior-work preservation review. Record W0-01, W0-02, W1-01, and W2-02 touch reasons and verification outcomes in the U05 summary, keeping W1 live-proof waiver BLOCKED at `compose-start`. Traceability: PRES-01 through PRES-05; EVID-03, EVID-04.
- [x] Step 7: Verification commands. Run shell tests/type/build/lint, Booking/auth smoke tests where route changes interact with them, prohibited-library and `local-user` scans, and `docker compose config --quiet`. Traceability: stage sensors and U05 DoD.
- [x] Step 8: Code summary. Write `code-summary.md` listing files changed, decisions, tests, preservation review, deviations, and live-proof handoff notes. Traceability: stage output contract.

## Non-Goals

- Do not migrate the Booking app business UI out of the existing Booking BFF.
- Do not change W0-01 eventing/platform files or W0-02 reference-data UI/seeds for compatibility routing.
- Do not rebuild W2-02 design-system primitives or introduce a broad navigation redesign.
- Do not add AWS, CDN, cache, route database, runtime preservation service, or new frontend libraries.
- Do not rewrite W1's live-proof waiver from BLOCKED at `compose-start` into PASS.

## Planned Verification

| Check | Command |
| --- | --- |
| Shell compatibility tests | `yarn workspace @erp/app-shell test` |
| Shell type/build/lint | `yarn workspace @erp/app-shell typecheck`, `build`, `lint` |
| Booking/auth regression smoke | `yarn workspace @erp/app-booking test`, `yarn workspace @erp/app-auth test` |
| Prohibited patterns | `rg` scans for prohibited libraries and `local-user` in protected shell/Booking paths |
| Compose validation | `docker compose config --quiet` |

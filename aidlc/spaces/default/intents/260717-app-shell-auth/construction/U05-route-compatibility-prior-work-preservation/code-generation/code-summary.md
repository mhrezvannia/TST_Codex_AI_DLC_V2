# Code Summary - U05 Route Compatibility and Prior Work Preservation

## Scope Implemented

U05 adds legacy `/bookings*` compatibility entry points that redirect to canonical shell `/booking*` routes before any Booking data load. Compatibility remains shell-owned and preserves the protected session/actor behavior already implemented for canonical routes.

## Files Created

- `apps/shell/lib/booking-compat.ts` - canonical route helper for list query allowlist and safe detail id mapping.
- `apps/shell/lib/booking-compat.test.ts` - route compatibility tests for query allowlist, duplicate handling, new-route mapping, encoded detail ids, and invalid id rejection.
- `apps/shell/app/bookings/page.tsx` - `/bookings` 308 redirect to `/booking` with allowlisted query state.
- `apps/shell/app/bookings/new/page.tsx` - `/bookings/new` 308 redirect to `/booking/new`, dropping query state.
- `apps/shell/app/bookings/[bookingId]/page.tsx` - `/bookings/[id]` safe one-segment redirect to `/booking/[id]`, with shell 404 for invalid ids.

## Files Modified

- `infrastructure/nginx/default.conf` - forwards `/bookings` and `/bookings/` to `apps-shell` so Compose reaches shell-owned compatibility redirects.

## Key Decisions

- Compatibility uses Next.js `permanentRedirect`, yielding 308 route redirects without proxying through the Booking BFF or backend.
- List compatibility preserves only `page`, `pageSize`, `sort`, `direction`, `status`, and `q`; duplicate allowlisted keys keep the first non-empty value, and unknown keys are dropped.
- Detail compatibility decodes once, rejects traversal, encoded slash/backslash, invalid percent encoding, empty ids, and unsafe characters, then re-encodes the canonical route target.
- `/bookings/new` is a concrete route under `app/bookings/new/page.tsx`, so it has filesystem precedence over the dynamic detail route.

## Prior-Work Preservation Review

| Prior work | Status | W2-01 touch reason and verification |
| --- | --- | --- |
| W0-01 platform/eventing | Preserved | No eventing, outbox, telemetry, or platform messaging files were changed for U05. |
| W0-02 reference-data | Preserved | No reference-data UI or seed files were changed for U05. Existing U02 shared validation/reference-option usage remains intact. |
| W1-01 Booking | Preserved | U05 redirects land in shell before Booking data load; Booking BFF/service behavior was not changed in U05. `yarn workspace @erp/app-booking test` passed 22 tests. |
| W2-02 design-system foundation | Preserved | No design-system foundation files were changed; shell uses existing Next.js/React/TypeScript patterns and existing shell CSS. |
| W1 live-proof waiver | Preserved | Remains explicitly BLOCKED at `compose-start`; U05 does not rewrite it as PASS. |

## Verification

| Result | Command |
| --- | --- |
| PASS - 20 tests | `yarn workspace @erp/app-shell test` |
| PASS | `yarn workspace @erp/app-shell typecheck` |
| PASS, Next plugin warning only | `yarn workspace @erp/app-shell build` |
| PASS, Next deprecation/plugin warnings only | `yarn workspace @erp/app-shell lint` |
| PASS - 12 tests | `yarn workspace @erp/app-auth test` |
| PASS - 22 tests | `yarn workspace @erp/app-booking test` |
| PASS | `docker compose config --quiet` |
| PASS - no matches | `rg "Redux Toolkit|@reduxjs/toolkit|\\bswr\\b|\\.module\\.css|styled-components|@emotion|jquery|moment" apps\\shell apps\\booking packages\\auth packages\\shared-types` |
| PASS - no matches | `rg "local-user" apps\\shell apps\\booking -n` |

## Deviations and Notes

- Code generation was completed inline because the configured `aidlc-developer-agent` subagent path remained unavailable earlier in this intent due model/thread-limit failures; this deviation is recorded in shared code-generation memory.
- Live Compose/browser proof was not run in this stage. Build and Test must still observe `/bookings`, `/bookings/new`, and `/bookings/[id]` through Nginx and verify they land in canonical shell routes with protected Booking behavior.

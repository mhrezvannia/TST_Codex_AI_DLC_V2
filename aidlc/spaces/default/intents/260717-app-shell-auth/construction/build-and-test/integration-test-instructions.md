# Integration Test Instructions - W2-01 App Shell and Auth

## Upstream Inputs

This file consumes U01-U06 code summaries for cross-boundary checks: shell to auth, shell to Booking BFF, Booking BFF to booking-service, booking-service to identity-service, Nginx route compatibility, and U06 evidence packaging.

## Commands

Static integration checks:
```powershell
docker compose config --quiet
node scripts/w2-01-live-acceptance.mjs --dry-run --output-root artifacts/w2-01-live/app-shell-auth
node scripts/w2-01-live-acceptance.mjs --validate --output-root artifacts/w2-01-live/app-shell-auth
```

Live integration attempt:
```powershell
docker compose --profile full up -d --build
node scripts/seed-local.mjs --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json
node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth
node scripts/w2-01-live-acceptance.mjs --validate --output-root artifacts/w2-01-live/app-shell-auth
```

## Scenario Matrix

| Scenario | Expected evidence |
| --- | --- |
| `allow-booking-create-detail` | `local.booking.user`, non-`local-user` actor header, allow decision, created Booking id/detail route, correlation id. |
| `deny-booking-access` | `local.reference.admin`, denied shell state, no Booking data disclosure, correlation id. |
| `sign-out-reauth-stale-call` | Pre-sign-out subject, `POST /api/auth/sign-out`, cookie cleared, protected route requires login, stale call fails closed, `backendLocalUserObserved=false`. |
| `legacy-bookings-compatibility` | `/bookings`, `/bookings/new`, and `/bookings/[id]` resolve to canonical shell routes without backend call before redirect. |

## Failure Handling

Unit tests, screenshots, or container startup alone do not satisfy live proof. If the live stack cannot run, write or preserve `blockers.jsonl` under `artifacts/w2-01-live/app-shell-auth/` with a W2-01 blocker that is separate from W1's existing `compose-start` waiver.

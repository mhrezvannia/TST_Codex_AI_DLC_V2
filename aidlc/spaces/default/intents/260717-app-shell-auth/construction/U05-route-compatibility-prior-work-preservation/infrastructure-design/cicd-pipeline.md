# CI/CD Pipeline - U05 Route Compatibility and Preservation

## Source Context

This CI/CD pipeline design consumes U05 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U05 `business-logic-model.md`. It verifies compatibility routing and prior-work preservation without adding runtime dependencies.

## Build Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Shell build | `apps-shell` compatibility and canonical routes. | Redirect handlers compile. |
| Nginx config validation | `infrastructure/nginx/default.conf` if touched. | `/bookings*` forwards to shell and preserves existing routes. |
| Booking build | `apps-booking`/booking-service if touched. | No legacy-route prefetch or domain regression. |
| Preservation diff | Git/path review. | W0-01/W0-02/W1-01/W2-02 touches classified. |

## Test Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Route mapping tests | `/bookings`, `/bookings/new`, `/bookings/[id]`. | 308 to canonical routes or shell 404 for malformed ids. |
| Query/id tests | Allowlist and encoded values. | Exact decode/re-encode/drop behavior. |
| Security tests | Open redirect and backend prefetch checks. | No arbitrary redirect, no backend call before redirect. |
| Canonical route smoke | `/booking*` after redirect. | Auth/session/actor preserved. |
| Preservation verification | Touched prior-work files. | Targeted test/result for each justified touch. |

## Security Gates

- No open redirect input.
- No `local-user` compatibility mode.
- No standalone Booking route acceptance outside shell.
- W1 waiver remains BLOCKED at `compose-start`.
- No Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Deployment Strategy

U05 deploys only to local Compose. Rollback is reverting shell redirect/Nginx changes while preserving canonical `/booking*`, auth, Booking, and prior-work services. No production, AWS, W4-01 migration, or route database deployment is selected.

## Secrets Management in CI/CD

No new secrets are required. Preservation and route evidence must not dump env files, service tokens, raw cookies, or secrets.

## Artifact Management

U05 evidence feeds `artifacts/w2-01-live/app-shell-auth/`: route compatibility transcript, edge-case route tests, no-backend-prefetch observation, preservation diff/path report, targeted verification results, and W1 waiver BLOCKED line.


# CI/CD Pipeline - U04 Sign-Out and Session Expiry Guard

## Source Context

This CI/CD pipeline design consumes U04 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U04 `business-logic-model.md`. It verifies sign-out and stale-call containment without adding auth infrastructure.

## Build Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Shell build | `apps-shell` user menu/protected routes. | Calls existing auth sign-out and compiles without prohibited libraries. |
| Auth build | `apps-auth` if touched. | Existing sign-out route behavior preserved. |
| Booking BFF build | `apps-booking` fan-in guards. | `proxyBooking`, `loadBookings`, `loadBooking` compile with actor guard. |
| Backend build | booking-service if touched. | Blank actor rejection preserved. |

## Test Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Auth route tests | `POST /api/auth/sign-out`. | Redirect and `lc_session` clear semantics. |
| Protected route tests | `/` and `/booking` after sign-out. | Login required; no stale protected content. |
| BFF stale-call tests | `proxyBooking`, `loadBookings`, `loadBooking`. | `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED` before backend fetch. |
| Backend safety tests | booking-service actor handling. | No blank actor to `local-user` conversion. |
| Live sign-out smoke | Nginx shell/auth path. | Full evidence with pre-sign-out subject and correlation ids. |

## Security Gates

- No client-only logout proof.
- No parallel auth provider.
- No raw token/cookie value in logs or evidence.
- No backend `local-user` request after sign-out.
- No Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Deployment Strategy

U04 deploys only to local Compose profiles. Rollback preserves U01 shell and U02/U03 authz fixtures while reverting sign-out UI or BFF guard changes if needed. No production, AWS, shared cache, or distributed session rollout is selected.

## Secrets Management in CI/CD

Use existing local env conventions. Logs and artifacts must omit raw cookie values, service tokens, OAuth/OIDC tokens, and secrets.

## Artifact Management

U04 evidence feeds `artifacts/w2-01-live/app-shell-auth/`: sign-out transcript, cookie-clear proof, protected-route reauth proof, stale-call early-return proof, backend no-`local-user` observation, correlation ids, and blocker records.


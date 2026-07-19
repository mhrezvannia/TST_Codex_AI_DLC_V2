# Reliability Design - U04 Sign-Out and Session Expiry Guard

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U04 reliability means sign-out, protected-route reauth, and stale-call rejection behave predictably and are evidenced independently.

## Resilience Patterns

| Condition | Design | Requirement coverage |
| --- | --- | --- |
| Sign-out succeeds | Clear `lc_session`, redirect through Keycloak logout, and make `/` and `/booking` require login. | REL-02, SEC-02, SEC-03 |
| Sign-out route errors | Surface recoverable error with correlation id; do not pretend the user is signed out. | REL-01 |
| Post-sign-out protected route | Re-check session server-side and redirect/require login. | REL-02 |
| Stale BFF call after sign-out | Return `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED` before backend fetch. | REL-03, SEC-06 |
| Backend no-call proof | Logs/request counters show no post-sign-out `local-user` request. | REL-04, SEC-07 |
| Runtime startup blocker | Record W2-01 blocker with dependency and observed failure; do not claim PASS from tests. | REL-05 |

## Retry and Fallback Policy

- No automatic reauth loop after sign-out.
- No retry as `local-user`, anonymous, or alternate subject.
- No client-only fallback that claims signed out before the auth route completes.
- User recovery is explicit sign-in through existing auth/Keycloak.

## Health and Evidence Design

U04 evidence distinguishes:

- Sign-out command request/response.
- `lc_session` clear/delete observation.
- Keycloak logout redirect with `/signed-out`.
- Protected-route reauth requirement for `/` and `/booking`.
- Stale-call early return in each covered BFF fan-in: `proxyBooking`, `loadBookings`, `loadBooking`.
- Backend no-`local-user` request observation.
- Correlation ids for sign-out and stale-call branches.

## Durability Boundary

U04 does not introduce durable session stores, shared logout state, or distributed cache. Reliability is limited to existing cookie/session behavior, protected route checks, BFF early return, and evidence artifacts.

## Operational Notes

Keep W1's live-proof waiver explicit as BLOCKED at `compose-start`; U04 must not rewrite sign-out or stale-call evidence into a real W1 PASS. U04 reliability work must also preserve W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation boundaries rather than modifying prior merged work to make the lifecycle proof easier.


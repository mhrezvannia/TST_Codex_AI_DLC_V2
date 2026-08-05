# Reliability Requirements - U04 Sign-Out and Session Expiry Guard

## Source Context

These reliability requirements consume U04 `business-logic-model.md`, U04 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U04 must make sign-out and stale-call behavior predictable.

## Reliability Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| REL-01 | Sign-out failure is surfaced as a recoverable error and not misrepresented as signed out. | Error-path test. |
| REL-02 | Successful sign-out reliably clears `lc_session` and makes `/` and `/booking` require login. | Live proof. |
| REL-03 | Stale Booking calls after sign-out fail closed with stable error codes and correlation id. | BFF tests/live proof. |
| REL-04 | Backend logs/request counters show no post-sign-out `local-user` request. | Evidence package. |
| REL-05 | Runtime blockers are recorded honestly as W2-01 blockers. | Evidence review. |

## Recovery Behavior

- User can sign in again through existing auth/Keycloak.
- Stale-call errors do not trigger automatic reauth loops.
- Missing/expired session is recovered by login, not bypass fallback.

## Observability

Evidence distinguishes sign-out command, cookie clear, protected-route reauth, stale-call early return, and backend no-`local-user` observation.

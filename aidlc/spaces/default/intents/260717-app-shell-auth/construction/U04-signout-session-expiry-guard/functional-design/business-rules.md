# Business Rules - U04 Sign-Out and Session Expiry Guard

## Source Context

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They govern sign-out and stale-session fail-closed behavior.

## Sign-Out Rules

| Rule | Statement |
| --- | --- |
| SIGNOUT-01 | Sign-out uses existing `POST /api/auth/sign-out`; W2-01 does not create a parallel auth mechanism. |
| SIGNOUT-02 | Sign-out clears the server-recognized `lc_session` cookie with `Path=/`, `HttpOnly`, `SameSite=Lax`, and `Max-Age=0`. |
| SIGNOUT-03 | After sign-out, `/` and `/booking` require authentication again. |
| SIGNOUT-04 | Sign-out redirects through Keycloak logout using `post_logout_redirect_uri=/signed-out`; signed-out UI must not display stale user identity or protected Booking data. |

## Stale Request Rules

| Rule | Statement |
| --- | --- |
| STALE-01 | `proxyBooking`, `loadBookings`, and `loadBooking` re-resolve or receive a current actor subject before `serviceHeaders`; they cannot trust stale client state. |
| STALE-02 | Missing actor after sign-out fails closed before any backend `fetch`; API calls return `401 AUTH_REQUIRED` or `403 BOOKING_ACTOR_REQUIRED` with correlation id. |
| STALE-03 | booking-service blank actor handling remains deny/error except explicit local/test bypass. |
| STALE-04 | No stale request may proceed as `local-user`. |

## Frontend Rules

| Rule | Statement |
| --- | --- |
| UI-01 | User menu places sign-out as a clear session-ending action. |
| UI-02 | Focus returns to a stable signed-out/auth-required state after sign-out. |
| UI-03 | User menu, protected-route status, and error states remain keyboard reachable. |
| UI-04 | Frontend code uses existing Next.js/React/TypeScript patterns and does not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |

## Evidence Rules

| Rule | Statement |
| --- | --- |
| EVID-01 | U04 evidence includes the `POST /api/auth/sign-out` call, Keycloak logout redirect, `lc_session` clear semantics, protected route requiring login, and stale Booking call fail-closed result. |
| EVID-02 | Evidence must show no post-sign-out call reached booking-service as `local-user`, using BFF early-return evidence plus backend logs/request counters where available. |
| EVID-03 | Docker/Compose blockers are recorded honestly as W2-01 blockers if live proof cannot run. |
| EVID-04 | W1 live-proof waiver remains BLOCKED at `compose-start`, not PASS. |

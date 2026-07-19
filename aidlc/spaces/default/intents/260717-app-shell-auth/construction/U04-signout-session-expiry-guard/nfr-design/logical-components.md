# Logical Components - U04 Sign-Out and Session Expiry Guard

## Source Context

This component map consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It bridges U04 NFR design to later infrastructure design for sign-out, protected-route reauth, and stale Booking BFF containment.

## Component Inventory

| Logical component | Boundary | NFR responsibility | Failure domain |
| --- | --- | --- | --- |
| Nginx edge | Browser edge in local Compose | Route shell/auth/sign-out/protected paths through accepted proof path. | Edge routing failure blocks live proof. |
| Shell user menu | `apps/shell` UI/server action boundary | Initiate sign-out by posting to existing auth endpoint. | Client-only logout would create false proof. |
| Existing auth sign-out route | `apps/auth/app/api/auth/sign-out/route.ts` | Build Keycloak logout redirect and clear `lc_session`. | Auth route failure blocks sign-out proof. |
| Keycloak logout | Existing auth runtime | Complete IdP logout redirect to `/signed-out`. | Keycloak unavailable creates W2-01 blocker or controlled error. |
| Protected shell route guard | `apps/shell` server boundary | Re-check session after sign-out for `/` and `/booking`. | Stale protected render fails U04. |
| Booking BFF actor resolver | `apps/booking` helper boundary | Fail stale calls before `serviceHeaders`/backend fetch. | Missing guard can call backend as stale actor. |
| booking-service safety net | Java/Spring booking-service | Reject blank actor and never convert post-sign-out request to `local-user`. | Backend fallback regression fails U04. |
| Evidence capture | Artifact package | Record sign-out, cookie clear, reauth, stale early return, backend no-call, and correlation. | Evidence gap blocks acceptance. |

## Blast Radius Mapping

| Failure | Blast radius | Containment |
| --- | --- | --- |
| Shell adds parallel logout | Session may remain valid server-side. | Use existing `POST /api/auth/sign-out` only. |
| Cookie clear missing attributes | Protected routes may still consider user authenticated. | Header/browser evidence for `lc_session` deletion. |
| Protected route uses stale client state | Signed-out user sees protected shell/Booking data. | Server-side route guard re-check. |
| BFF guard missing on one fan-in | Stale calls can reach booking-service. | Cover `proxyBooking`, `loadBookings`, and `loadBooking`. |
| Backend receives `local-user` after sign-out | False authorization path. | Backend no-call/request-counter evidence. |

## Isolation Strategy

- `apps/auth` remains auth/sign-out owner.
- `apps/shell` owns the user-menu initiation and protected route behavior.
- `apps/booking` owns BFF stale-call fan-in guards.
- booking-service remains the backend safety net and Booking owner.
- Shell does not own session invalidation internals or introduce a parallel auth provider.
- W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation remain protected prior-work boundaries; U04 consumes them through stable interfaces only and does not rewrite them for NFR convenience.

## Infrastructure Handoff

Later Infrastructure Design should consume this map to add or verify:

- Compose/Nginx routing for shell, auth sign-out, Keycloak logout redirect, `/signed-out`, `/`, and `/booking`.
- Environment variables for `authConfig.keycloakLogoutUrl`, session cookie behavior, Booking service URL/token, and correlation.
- Evidence collection for `Set-Cookie`, protected-route reauth, BFF early return, and backend no-`local-user` observation.
- No AWS/cloud resources for W2-01 unless a later approved scope change says otherwise.
- Evidence path under `artifacts/w2-01-live/app-shell-auth/`.


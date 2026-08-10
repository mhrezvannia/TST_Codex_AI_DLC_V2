# Logical Components - U01 Walking Skeleton

## Source Context

This component map consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It bridges U01 NFR design to later infrastructure design.

## Component Inventory

| Logical component | Boundary | NFR responsibility | Failure domain |
| --- | --- | --- | --- |
| Nginx edge | Browser edge in local Compose | Route shell/auth traffic and preserve entrypoint evidence. | Edge routing failure blocks live proof. |
| Shell protected-route guard | `apps/shell` server boundary | Session check, redirect, safe session summary, no token exposure. | Shell/auth failure blocks protected entry. |
| Existing auth/Keycloak flow | `apps/auth`, Keycloak, `packages/auth` | OIDC login/callback/session, HttpOnly `lc_session`. | Auth runtime failure blocks login proof. |
| Booking actor resolver | Shell/Booking BFF boundary | Derive non-blank actor from session and fail closed on absence. | Actor failure blocks Booking read. |
| Booking BFF read client | `apps/booking` helper/adapter | Build service headers, apply 2500 ms backend timeout, propagate correlation. | BFF failure blocks read but should be recoverable. |
| booking-service read API | Java/Spring service | Preserve existing read/list behavior and reject blank actor. | Backend failure renders recoverable error/blocker. |
| Evidence capture | Artifact package | Record timings, actor, correlation, and blockers. | Evidence gap blocks acceptance. |

## Blast Radius Mapping

| Failure | Blast radius | Containment |
| --- | --- | --- |
| Nginx route misconfiguration | Browser cannot reach shell/auth through accepted path. | Record runtime blocker; direct app-port tests are supporting only. |
| Shell session guard bug | Protected content may render incorrectly. | Server-side guard tests and no-session live proof. |
| Auth/Keycloak unavailable | Login cannot complete. | Record W2-01 blocker; do not bypass with `local-user`. |
| Actor resolver missing subject | Booking read stops before backend call. | Fail-closed BFF response with correlation id. |
| booking-service unavailable | Booking area shows recoverable error. | Bounded timeout and evidence. |

## Isolation Strategy

- `apps/shell` owns shell layout and protected route composition.
- `apps/auth` remains auth owner.
- `apps/booking`/booking-service remain Booking owners.
- `packages/auth` is shared session DTO/helper boundary.
- Shell does not own Booking domain data or identity-service policy.
- W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation remain protected prior-work boundaries; U01 consumes them through stable interfaces only and does not rewrite them for NFR convenience.

## Infrastructure Handoff

Later Infrastructure Design should consume this map to add or verify:

- Compose service and Nginx route for `apps/shell`.
- Environment variables for auth/session and Booking service URLs/tokens.
- No AWS/cloud resources for W2-01 unless a later approved scope change says otherwise.
- Evidence path under `artifacts/w2-01-live/app-shell-auth/`.

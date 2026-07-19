# Logical Components - U02 Booking Create Allow

## Source Context

This component map consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It bridges U02 NFR design to later infrastructure design for the authorized Booking create/detail path.

## Component Inventory

| Logical component | Boundary | NFR responsibility | Failure domain |
| --- | --- | --- | --- |
| Nginx edge | Browser edge in local Compose | Route shell/auth/create/detail traffic through accepted proof path. | Edge routing failure blocks live proof. |
| Shell protected create/detail routes | `apps/shell` server boundary | Require session, render `/booking/new`, navigate to `/booking/[id]`, and avoid raw token exposure. | Shell/auth failure blocks create/detail proof. |
| Existing auth/Keycloak flow | `apps/auth`, Keycloak, `packages/auth` | OIDC login/callback/session and safe session summary. | Auth runtime failure blocks real-subject create. |
| Booking BFF create/detail adapter | `apps/booking` helper/adapter | Validate command body, derive actor, attach correlation/idempotency, call backend with bounded behavior. | BFF failure blocks mutation or detail retrieval. |
| booking-service authorization adapter | Java/Spring booking-service | Call identity-service authorize before create mutation and fail closed on non-allow. | Authorization adapter failure blocks create. |
| identity-service catalog/authorize API | identity-service | Evaluate `local.booking.user` Booking permissions and preserve `local.reference.admin` deny fixture. | Identity failure blocks create. |
| booking-service command/detail API | Java/Spring booking-service | Preserve W1 create/idempotency/persistence/detail behavior. | Backend failure blocks create/detail proof. |
| Evidence capture | Artifact package | Record actor, action, authorization decision, created id, detail retrieval, timings, and correlation. | Evidence gap blocks acceptance. |

## Blast Radius Mapping

| Failure | Blast radius | Containment |
| --- | --- | --- |
| Missing session | User cannot submit create inside shell. | Redirect/fail closed before protected content or mutation. |
| Missing actor | Create stops at BFF/backend boundary. | Controlled error with correlation id; no `local-user` retry. |
| Missing `local.booking.user` permission | Allow proof cannot run. | Seed/catalog blocker; do not modify unrelated personas. |
| identity-service deny/error/timeout | Booking create does not mutate state. | Fail-closed backend response with correlation id. |
| Duplicate submit | Could create duplicate Booking if idempotency regresses. | Preserve existing idempotency key handling and tests. |
| Detail retrieval fails after create | U02 acceptance fails. | Record created id and detail failure; repair or blocker required. |

## Isolation Strategy

- `apps/shell` owns shell route composition and session protection.
- `apps/auth` remains auth owner.
- `apps/booking`/booking-service remain Booking UI/BFF/domain owners.
- identity-service owns authorization decisions and local permission catalog behavior.
- Shell does not own Booking domain persistence, create idempotency, or identity policy.
- W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation remain protected prior-work boundaries; U02 consumes them through stable interfaces only and does not rewrite them for NFR convenience.

## Infrastructure Handoff

Later Infrastructure Design should consume this map to add or verify:

- Compose/Nginx routing for shell `/booking/new` and `/booking/[id]`.
- Environment variables for auth/session, Booking service URLs/tokens, and identity-service authorization URL/timeout.
- Local seed/catalog path for `local.booking.user`, Booking permissions, and preserved `local.reference.admin` deny fixture.
- No AWS/cloud resources for W2-01 unless a later approved scope change says otherwise.
- Evidence path under `artifacts/w2-01-live/app-shell-auth/`.


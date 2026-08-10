# Logical Components - U03 Booking Deny

## Source Context

This component map consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It bridges U03 NFR design to later infrastructure design for the authenticated denied Booking path.

## Component Inventory

| Logical component | Boundary | NFR responsibility | Failure domain |
| --- | --- | --- | --- |
| Nginx edge | Browser edge in local Compose | Route shell/auth/Booking denied proof through accepted path. | Edge routing failure blocks live proof. |
| Shell protected Booking route | `apps/shell` server boundary | Require session and render denied state inside shell. | Shell/auth failure blocks denied proof. |
| Existing auth/Keycloak flow | `apps/auth`, Keycloak, `packages/auth` | Authenticate `local.reference.admin` and expose safe session summary. | Auth runtime failure blocks U03 proof. |
| Booking BFF denied-path adapter | `apps/booking` helper/adapter | Propagate actor/correlation and map 403/deny to shell state. | BFF failure can hide deny or fake success. |
| booking-service authorization adapter | Java/Spring booking-service | Call identity-service before protected read/action and fail closed on non-allow. | Adapter failure blocks Booking access. |
| identity-service catalog/authorize API | identity-service | Preserve `local.reference.admin` deny decision. | Identity failure maps to fail-closed denied/error state. |
| Denied UI component/state | Shell/Booking UI boundary | Display accessible denied state with safe recovery actions. | UI failure blocks acceptance. |
| Evidence capture | Artifact package | Record subject, action/resource, deny reason/reference, timings, and correlation. | Evidence gap blocks acceptance. |

## Blast Radius Mapping

| Failure | Blast radius | Containment |
| --- | --- | --- |
| `local.reference.admin` accidentally has Booking permission | U03 cannot prove deny. | Seed/catalog blocker; preserve deny fixture. |
| Booking BFF maps deny to empty list | Unauthorized access appears as success. | Explicit denied-state contract and tests. |
| identity-service timeout/unavailable | Booking access blocked for denied proof. | Fail closed with correlation id. |
| Denied UI is inaccessible or blank | User cannot recover or understand state. | H1, keyboard actions, responsive text constraints. |
| Shell nav hides route before backend check | Deny evidence is incomplete. | Backend identity authorization remains proof authority. |

## Isolation Strategy

- `apps/shell` owns shell route frame and denied-state presentation.
- `apps/auth` remains auth owner.
- `apps/booking`/booking-service remain Booking owners.
- identity-service owns authorization and permission catalog decisions.
- Shell navigation is not the authorization source of truth.
- W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation remain protected prior-work boundaries; U03 consumes them through stable interfaces only and does not rewrite them for NFR convenience.

## Infrastructure Handoff

Later Infrastructure Design should consume this map to add or verify:

- Compose/Nginx routing for shell `/booking` denied proof.
- Environment variables for auth/session, Booking service URL/token, and identity-service authorization URL/timeout.
- Local seed/catalog path that preserves `local.reference.admin` without Booking permissions.
- No AWS/cloud resources for W2-01 unless a later approved scope change says otherwise.
- Evidence path under `artifacts/w2-01-live/app-shell-auth/`.


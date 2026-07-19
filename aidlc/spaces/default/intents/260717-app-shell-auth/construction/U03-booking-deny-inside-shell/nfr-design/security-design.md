# Security Design - U03 Booking Deny

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U03 security design proves authenticated-but-unauthorized access fails closed without Booking data disclosure or mutation.

## Authentication and Actor Design

| Control | Design |
| --- | --- |
| Authenticated deny subject | `local.reference.admin` signs in through existing auth/Keycloak and reaches shell with a safe session summary. |
| Actor derivation | Booking BFF derives the actor subject from the server-side session; browser state is not authority. |
| Header construction | Service headers carry non-blank `X-LinerCore-Actor-Id` and correlation id to booking-service. |
| Token boundary | Raw tokens and secrets remain server-side and outside browser-visible state, logs, and evidence. |

## Authorization Design

| Control | Design |
| --- | --- |
| Deny fixture | Seed/catalog setup preserves `local.reference.admin` without Booking permissions, including after U02 adds `local.booking.user`. |
| Backend decision point | booking-service calls identity-service `POST /internal/identity/authorize` for resource `booking` and action `read` or requested action. |
| Deny mapping | Identity deny maps to 403/access denied and blocks data disclosure or mutation. |
| Non-allow outcomes | Missing actor, unknown subject, timeout, identity-service error, or malformed authorization response fail closed and never retry as `local-user`. |
| UI authority | Shell navigation and denied UI are not the source of authorization truth; backend identity authorization decides. |

## Data Protection

- Do not return partial Booking data, fake empty success, or mutation response for denied subjects.
- Evidence includes only QA-safe subject, resource/action, decision reason/reference, outcome, and correlation id.
- Denied state may show a correlation/reference value but not raw policy payloads, secrets, or tokens.

## Threat Controls

| Threat | Mitigation |
| --- | --- |
| Unauthorized data disclosure | Deny maps to explicit denied state and prevents Booking payload rendering. |
| Privilege drift | Seed/catalog review verifies `local.reference.admin` remains without Booking permissions. |
| Elevation through fallback | No `local-user`, alternate subject, or shell-only allow fallback. |
| Repudiation | Decision evidence includes subject, action/resource, decision, and correlation id. |
| Stale client authority | Deny state is request result, not durable browser authorization state. |

## Verification Design

- Backend integration tests cover deny, timeout/error, unknown subject, missing actor, and no mutation/data disclosure.
- UI tests cover in-shell access denied rendering and no fake empty-list success.
- Seed/catalog diff covers `local.reference.admin` preservation after U02 permission additions.
- Live proof captures the real subject, deny decision, and correlation id through Nginx.


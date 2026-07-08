# Shared Infrastructure - U05 Auth App

## Shared Dependencies

| Shared resource | U05 usage | Boundary |
|---|---|---|
| Nginx | Browser routing to auth app/BFF | Backend services are not browser-facing. |
| Keycloak | OIDC authentication provider | U05 does not store passwords. |
| `identity-service` | Session-safe roles/permissions | U05 does not own authorization policy. |
| Vault | Non-local secret references | No literal non-local secrets. |
| Observability stack | BFF logs, metrics, traces | Telemetry only. |
| `@erp/*` packages | UI/API/auth/shared types | No domain data ownership. |

## Access Boundaries

U05 handles internal auth entrypoint and session surface only. It does not expose tokens to browser JavaScript, implement customer identity, implement full role administration, or call backend services from browser-visible code.

## Cross-Unit Contracts

U02 supplies effective permissions/session summaries. U06 links to auth/access-denied behavior. U08 gates frontend quality and accessibility checks. U10 consumes auth BFF logs, metrics, traces, health, smoke, and correlation evidence.

## Ownership and Compliance

Auth errors, denied states, request-access submissions, and sign-out failures are logged with safe correlation evidence. Request-access submissions do not grant permissions and must avoid unauthorized policy detail.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

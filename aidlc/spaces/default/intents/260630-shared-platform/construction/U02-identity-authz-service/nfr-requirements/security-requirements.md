# Security Requirements - U02 Identity Authorization Service

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines Keycloak-authenticated subject translation, fail-closed authorization decisions, role assignment, audit, and BFF/service integration. `business-rules.md` fixes ownership of authorization decisions, role catalog, role assignments, audit, OpenAPI contracts, correlation propagation, and safe summaries. `requirements.md` fixes NFR-006 through NFR-010, NFR-012, C-004, C-006, and Keycloak/on-prem constraints.

## Security Control Objectives

| Objective | Requirement |
|---|---|
| Central authorization | `identity-service` is authoritative for platform authorization decisions. |
| Least privilege | Default authenticated users receive no administrative permissions unless explicitly assigned. |
| Fail closed | Protected decisions deny when token validation, subject resolution, policy lookup, persistence, or dependency access cannot complete. |
| Sensitive data minimization | No raw tokens, passwords, secret claims, or unauthorized role details leave U02. |
| Auditability | Role/permission changes and failed protected decisions produce structured audit/log evidence. |

## Authentication Boundary

- Keycloak 24 is the authentication provider.
- U02 must not store passwords or implement custom authentication.
- The Keycloak adapter validates issuer, audience, expiry, and signature through OIDC/JWKS metadata.
- Domain core sees `AuthenticatedSubject` and authorization value objects, not Keycloak SDK objects or token internals.

## Authorization Requirements

- Permission evaluation must consider subject, resource, action, scope, assignment status, and policy version.
- Reference-data mutations require explicit permission, normally through `reference-admin`.
- Role assignment and revocation require `security-admin`.
- Unknown roles and inactive assignments must not grant privileges.
- Repeated decisions for the same active assignment and policy version must be deterministic.

## Data Protection Requirements

- Authorization data is Confidential or Restricted where access-control sensitivity applies.
- U02 owns its PostgreSQL datastore; other services and BFFs must not read or write it directly.
- REST responses must use safe DTOs and standard error envelopes.
- Token material and secret claims must never be persisted in domain/audit records or returned to browser code.
- Transport security must support TLS 1.2 or stronger where the environment supports it.

## Audit and Logging Requirements

- Role assignment changes must capture actor, target user, role, operation, timestamp, before value, after value, reason where supplied, and correlation id.
- Assignment changes and audit records must persist transactionally where storage allows.
- Audit records must be append-only from the application perspective.
- Failed protected decisions and denied role-assignment attempts must emit structured access logs.
- Logs must mask secret claims and avoid exposing unauthorized role details.

## Threat Considerations

| Threat | Required mitigation |
|---|---|
| Caller embeds stale role logic | Require all callers to use U02 authorization API. |
| Token replay or invalid token | Validate issuer/audience/expiry/signature and fail closed on invalid token. |
| Privilege escalation through unknown role | Unknown role must not grant unexpected privileges. |
| Audit tampering | Append-only application model and restricted audit query access. |
| UI-only enforcement bypass | Backend services and BFFs must enforce U02 decisions at their own boundaries. |

## Non-Goals

- No customer-facing identity.
- No password management.
- No full permission-review administration UI.
- No downstream module runtime policy implementation.


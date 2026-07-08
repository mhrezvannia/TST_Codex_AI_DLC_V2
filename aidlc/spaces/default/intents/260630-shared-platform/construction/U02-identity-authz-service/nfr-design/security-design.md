# Security Design - U02 Identity Authorization Service

## Source Trace

This design derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

`security-requirements.md` requires central authorization, least privilege, fail-closed behavior, data minimization, auditability, Keycloak validation, safe DTOs, transport security, and append-only audit. `tech-stack-decisions.md` fixes Keycloak 24, Java/Spring, PostgreSQL, OpenAPI, Vault references, and no public-cloud IAM alternative.

## Security Architecture

| Boundary | Design |
|---|---|
| Authentication | Keycloak 24 validates identity through OIDC/JWKS adapter. |
| Authorization | `identity-service` owns role catalog, permission catalog, assignments, decisions, and audit. |
| Domain core | Receives `AuthenticatedSubject`, Role, Permission, RoleAssignment, AuthorizationRequest, and AuthorizationDecision value objects only. |
| Persistence | Service-owned PostgreSQL schema; no BFF/service direct database reads. |
| API | OpenAPI-defined internal APIs returning safe DTOs and platform error envelopes. |
| Browser | Browser receives only BFF-mediated safe summaries and decisions, never raw tokens or secret claims. |

## Fail-Closed Design

Protected authorization decisions deny when token validation, subject resolution, policy lookup, persistence, or required dependency access cannot complete.

Failure outcomes remain distinct:

| Condition | Result |
|---|---|
| Invalid token | `DENY_INVALID_TOKEN` or equivalent safe reason. |
| Unknown subject | `DENY_UNKNOWN_SUBJECT`. |
| Missing permission | `DENY_NO_PERMISSION`. |
| Dependency unavailable | `DENY_DEPENDENCY_UNAVAILABLE`; operationally distinct from business denial. |
| Stale assignment write | Conflict/stale-version response; no silent overwrite. |

## Data Protection Design

- Raw token material stays outside domain core, persistence, audit records, and API responses.
- Secret claims and hidden role assignments are not exposed to BFFs or UIs.
- Authorization and audit data are treated as Confidential or Restricted where access-control sensitivity applies.
- REST errors include code, safe message, correlationId, timestamp, and optional safe details.
- Vault references are used for non-local secrets in deployment descriptors.

## Audit and Compliance Design

Role assignment changes append an audit record transactionally with the assignment change where storage allows. Protected denials and sensitive authorization outcomes produce structured access logs with correlation id. Audit query APIs require authorization and filters/pagination.


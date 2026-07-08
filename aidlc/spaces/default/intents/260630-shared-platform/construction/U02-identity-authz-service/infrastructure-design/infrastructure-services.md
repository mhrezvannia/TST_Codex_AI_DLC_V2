# Infrastructure Services - U02 Identity Authz Service

## Database

PostgreSQL 15+ is the owned persistence service for U02. It stores role catalog, permission catalog, role assignments, assignment versions, and authorization/role-change audit records. Indexes are expected for subject, role, permission, policy version, assignment status, audit actor/target/action/result, and time range.

Audit-query workloads must be isolated from hot decision paths through query shape, indexes, pagination, and read-path separation.

## Keycloak Integration

Keycloak 24 is the authentication provider. U02 uses OIDC/JWKS metadata, issuer/audience/expiry/signature validation, and claim translation behind an adapter boundary. The domain core receives `AuthenticatedSubject`, not token material or Keycloak internals.

Provider metadata can be cached safely; protected decisions fail closed when required token/subject validation cannot complete.

## Secrets

Non-local DB credentials, Keycloak client secrets, JWKS/OIDC config, and operational credentials are Vault references. Local development may use local-only values. No token, secret, credential, or raw provider response is logged.

## Service Discovery

Local service discovery uses Compose names. Internal callers use the `identity-service` route. Nginx may route BFF/app traffic but does not expose identity APIs directly to browser code.

## Caching

No distributed shared cache is required for MVP. The service may cache Keycloak provider metadata and bounded policy/permission projections only when policyVersion correctness and fail-closed behavior are preserved.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

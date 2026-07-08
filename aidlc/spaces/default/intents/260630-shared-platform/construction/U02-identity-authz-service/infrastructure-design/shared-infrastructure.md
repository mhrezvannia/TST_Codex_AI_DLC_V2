# Shared Infrastructure - U02 Identity Authz Service

## Shared Dependencies

U02 uses shared platform infrastructure but owns its authorization data:

| Shared resource | U02 usage | Boundary |
|---|---|---|
| Keycloak | Authentication provider and OIDC/JWKS source | U02 authorizes; Keycloak authenticates. |
| Nginx | Edge route for BFF apps | Browser does not call U02 directly. |
| Vault | Non-local secret references | No literal non-local secrets. |
| Observability stack | Logs, metrics, traces | Telemetry only. |
| PostgreSQL host/container | Local physical service may be shared | Logical DB/schema is U02-owned. |

## Access Boundaries

`apps/auth`, `apps/reference-data`, and backend services call U02 through OpenAPI-defined APIs. They do not embed policy logic, read U02 tables, or consume token internals. U02 does not own auth UI routes or customer identity.

## Cross-Unit Contracts

U05 and U06 depend on effective-permission/session-safe APIs. U03 depends on authorization decisions for protected reference operations. U07 publishes contract evidence. U08 gates the OpenAPI and tests. U10 consumes U02 logs, metrics, traces, health, and audit signals.

## Ownership and Compliance

Role assignments, permission catalog, policy version, authorization decisions, and audit evidence are owned by U02. Access to audit/status surfaces is authorized and filterable; retention and tamper-evidence hardening are specialized later.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

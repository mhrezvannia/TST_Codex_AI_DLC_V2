# Deployment Architecture - U02 Identity Authz Service

## Compute Model

`identity-service` deploys as a stateless Java 21 / Spring Boot 3.3 container. Multiple instances may serve authorization decisions and effective-permission reads when backed by the same owned PostgreSQL datastore and Keycloak provider metadata/JWKS access.

The domain core remains infrastructure-independent; Keycloak, PostgreSQL, REST, telemetry, and Vault are adapters/configuration around the container.

## Network Topology

BFFs and backend services call `identity-service` through internal service routing. Browser JavaScript never calls `identity-service` directly. The service reaches Keycloak for OIDC/JWKS metadata and token/claim translation and reaches PostgreSQL for role, permission, assignment, and audit persistence.

Protected callers must propagate correlation id to `identity-service`; responses return safe decision reason codes and correlation id.

## Storage Strategy

`identity-service` owns its PostgreSQL schema/database for role catalog, permission catalog, role assignments, optimistic versions, and append-only audit records. No other service or app reads/writes this datastore directly.

Assignment changes and audit records are persisted transactionally where storage allows.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| Local | Compose service, local PostgreSQL, local Keycloak realm, local-only credentials. |
| Staging | Vault references, registry image tags, readiness/smoke evidence, internal routing. |
| Production | Placeholder only; final HA, retention, DR, and sizing remain deferred. |

## Resource Sizing

Initial sizing is conservative: stateless API containers scale horizontally; PostgreSQL handles durable writes and audit queries; Keycloak metadata caching reduces provider lookup overhead. Final CPU/memory/connection-pool values are validated later.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

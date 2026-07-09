# Infrastructure Services - shared-platform-identity-security

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Infrastructure service | Purpose | Profile |
|---|---|---|
| Keycloak | User authentication, realm/client import, local test users, roles, callbacks. | `core`, `full` |
| Keycloak database | Keycloak local state. | `core`, `full` |
| Identity Service | Subject resolution, capabilities, authorization, audit, service JWT validation. | `app`, `full` |
| Identity PostgreSQL database | Capability catalog, roles, assignments, effective permission data, authorization audit. | `core`, `full` |
| nginx reverse proxy | Auth callback and Identity API routing. | `app`, `full` |
| JWKS/issuer metadata cache | Bounded token validation support. | Identity Service runtime |
| CI security scanners | SAST, dependency scan, secret scan, denied-path and service-token tests. | CI |

## Storage And Indexes

| Data | Storage and index design |
|---|---|
| Capability catalog | Versioned module/action/resource identifiers indexed by module and capability id. |
| Role mappings | Role-to-capability and service-identity grants indexed by subject/role/capability version. |
| Effective permissions | Read-optimized cache keyed by subject, tenant/realm, capability version, role assignment version, and auth mode. |
| Audit records | Append-only records indexed by subject, action, resource, decision, reason, correlation id, and timestamp. |
| Keycloak bootstrap | Versioned import files and deterministic local seed users/clients. |

## Network And Access Controls

| Path | Control |
|---|---|
| Browser to Keycloak | Deterministic local callback URLs and secure cookie/session posture where applicable. |
| Enterprise Web to Identity | Authenticated route and safe permission summary only. |
| Services to Identity/JWKS | Service JWT/RS256 validation and least-privilege service subjects. |
| Identity to database | Dedicated identity database user; no cross-service domain database access. |
| Event identity hooks | Kafka producer/consumer identity requirements represented for event seams. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides indexed lookup, local JWT validation, compact audit writes, and shell context support. |
| `security-design.md` | Implements Keycloak, token validation, backend enforcement, denied paths, audit, service identity, and secret safety. |
| `scalability-design.md` | Sizes module, capability, role/service identity, audit, and lookup stores. |
| `reliability-design.md` | Supports fail-closed auth, cache invalidation, audit persistence, and local security determinism. |
| `logical-components.md` | Allocates infrastructure services to identity/security components. |
| `components.md` | Keeps Identity Service boundaries explicit. |
| `services.md` | Uses the approved identity service, Keycloak, database, and service-auth topology. |
| `business-logic-model.md` | Supports authenticate, authorize, manage capability catalog, and validate service-to-service workflows. |

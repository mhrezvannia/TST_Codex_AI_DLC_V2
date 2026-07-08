# Deployment Architecture - U03 Reference Domain API

## Compute Model

`reference-data-service` deploys as a stateless Java 21 / Spring Boot 3.3 container. It hosts provider APIs, admin APIs, validation-only endpoints, change history reads, and domain-fact creation. U04 publisher workers are separate infrastructure/runtime concerns even when they share the service boundary and datastore.

Multiple HTTP/API instances can run behind internal routing because canonical state is stored in owned PostgreSQL.

## Network Topology

`apps/reference-data` BFF and future internal consumers call provider/admin APIs through internal routing. Protected admin mutations call `identity-service` for authorization. The service writes PostgreSQL and hands durable domain facts/outbox rows to the U04 path.

Browser clients do not call `reference-data-service` directly and no component reads its database directly.

## Storage Strategy

PostgreSQL stores nine reference sets, relationship tables, audit/change history, versions, and U04 handoff records where applicable. Indexes support business-key uniqueness, active/default filters, status filters, relationship lookups, deterministic sorts, history queries, and stale-version checks.

Inactive records remain readable but are excluded by default list filters.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| Local | Compose service with local PostgreSQL, U02 dependency, seed/smoke path. |
| Staging | Vault references, registry tags, migrations, health/smoke evidence. |
| Production | Placeholder only; final sizing, replicas, retention, and DR are deferred. |

## Resource Sizing

Initial sizing prioritizes indexed PostgreSQL access and bounded API page sizes. Read replicas, materialized views, partitioning, and caches are deferred until measured load justifies them.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

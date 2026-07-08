# CI/CD Pipeline - U03 Reference Domain API

## Pipeline Stages

U03 uses Java 21 / Maven backend gates:

| Stage | Checks |
|---|---|
| Source hygiene | Formatting/lint/static checks and dependency rules. |
| Compile | Multi-module Maven compile. |
| Unit tests | Domain invariant, validation, conflict, and change-fact tests. |
| Adapter integration | PostgreSQL repository/API adapter tests and U02 contract stubs. |
| Coverage | Per-service 85 percent line coverage target. |
| Contracts | OpenAPI validation for provider/admin/status/history APIs. |
| Migration/schema | Database migration and index-shape checks where configured. |
| Smoke | One authorized mutation, provider read, audit/history visibility, and U04 handoff evidence. |

## Deployment Stages

Local deployment uses Compose with PostgreSQL and U02 dependencies. Non-local deployment uses registry tags, Vault references, migrations, readiness checks, and smoke evidence.

## Rollback

Rollback relies on immutable image tags, migration compatibility, OpenAPI compatibility, and durable database state. Published facts/outbox records must not be lost by container rollback.

## Secrets in CI/CD

CI and deployment use secret references for database credentials, U02 credentials, telemetry exporters, and service secrets. Logs/evidence redact secrets and sensitive Party/Customer values.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

# CI/CD Pipeline - U02 Identity Authz Service

## Pipeline Stages

U02 uses the backend quality-gate pattern for Java 21 / Maven service modules:

| Stage | Checks |
|---|---|
| Source hygiene | Formatting/lint/static checks and dependency rules. |
| Compile | Multi-module Maven compile. |
| Unit tests | Domain and application-service authorization tests. |
| Adapter integration | PostgreSQL and Keycloak adapter contract tests where configured. |
| Coverage | Per-service 85 percent line coverage target. |
| Contracts | OpenAPI validation for authorization, session/effective permission, role catalog, assignment, and audit APIs. |
| Container | Build image with deterministic tag and health endpoint. |
| Smoke | One allow, deny, and fail-closed protected decision path. |

## Deployment Stages

Local deployment uses Compose. Non-local deployment uses registry tags, Vault references, health/readiness checks, and smoke evidence. Production promotion automation remains outside this stage.

## Rollback

Rollback relies on immutable image tags, database migration boundaries, OpenAPI compatibility, and smoke evidence. Role/audit data is durable and must not be rolled back by replacing containers.

## Secrets in CI/CD

CI uses secret references and redaction. Logs must not print DB passwords, Keycloak client secrets, tokens, Vault values, or raw provider responses.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

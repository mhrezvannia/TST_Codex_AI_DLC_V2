# Infrastructure Design Questions - U03 Reference Domain API

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U03-reference-domain-api`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Deploy `reference-data-service` as one stateless Java 21 / Spring Boot 3.3 bounded-context container. Do not split one service per reference set and do not deploy a generic metadata service.

### Q2. Compute/storage/networking

[Answer]: Provide internal REST/OpenAPI access for BFFs and future consumers, owned PostgreSQL persistence, U02 authorization connectivity for protected workflows, and an internal handoff boundary for U04 outbox/event publication.

### Q3. Monitoring approach

[Answer]: Monitor provider/admin read latency, mutation latency, validation failures, duplicate/stale conflicts, U02 authorization latency, PostgreSQL query/write latency, change-history access, domain fact creation, and correlation propagation.

### Q4. CI/CD pipeline

[Answer]: Run Maven compile/test/coverage, domain-core purity, adapter integration tests, OpenAPI validation, migration/schema checks, and smoke for one authorized create/read/status path.

### Q5. Secrets management

[Answer]: Non-local PostgreSQL credentials, U02 client credentials, service secrets, and telemetry/export credentials are Vault references. Local Compose may use local-only values.

### Q6. Scaling policy

[Answer]: Scale HTTP/API containers horizontally. Scale data access through indexed queries, bounded pagination, deterministic sort, and separate history/status paths. U04 scales publisher workers separately.

## Ambiguity Analysis

No blocking ambiguity remains. Final production database sizing, retention, replicas, and partitioning are deferred to later validation.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

# Infrastructure Design Questions - U09 Local Seed Compose

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U09-local-seed-compose`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Use Docker Compose core and optional observability profiles for local and CI reproducibility. Core includes PostgreSQL, Keycloak, Kafka, Schema Registry, services, apps, Nginx, seed loader, and smoke runner.

### Q2. Compute/storage/networking

[Answer]: Compose service names provide local networking. Named volumes may support repeatability. Seed loader waits on health checks and uses approved service/admin paths or controlled bootstrap adapters.

### Q3. Monitoring approach

[Answer]: Seed and smoke emit duration, wait time, created/updated/skipped/failed counts, validation failures, dependency timeouts, and correlation id. Optional observability profile adds local log/metric/trace collection.

### Q4. CI/CD pipeline

[Answer]: Run seed schema validation, dependency-order checks, idempotency rerun checks, local smoke subsets through APIs/BFF paths, and event-enabled smoke when Kafka/SR is enabled.

### Q5. Secrets management

[Answer]: Local dev values only. Seed packs contain fictional local-only users and no production/customer/employee/credential data. Non-local descriptors use Vault references.

### Q6. Scaling policy

[Answer]: Keep seed data small and deterministic. Scale by target-service-specific seed packs, dependency planning, and `smokeTags`, not by production bulk-loading behavior.

## Ambiguity Analysis

No blocking ambiguity remains. Final seed values, production data migration, and observability depth are deferred.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

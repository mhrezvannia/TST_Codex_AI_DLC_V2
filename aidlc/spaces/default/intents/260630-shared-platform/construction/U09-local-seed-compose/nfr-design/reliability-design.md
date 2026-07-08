# Reliability Design - U09 Local Seed Compose

## Reliability Goals

U09 must make local startup, seed loading, reruns, and smoke checks predictable. It fails before unsafe writes for invalid inputs, preserves idempotency on repeat runs, and reports actionable diagnostics for dependency, validation, conflict, and smoke failures.

## Startup Reliability

Required Compose services declare health checks. The seed loader waits for PostgreSQL migrations, Keycloak import, Kafka, Schema Registry, `identity-service`, `reference-data-service`, BFF apps, and Nginx within bounded timeouts. Unhealthy dependencies fail with endpoint and health details.

Optional observability profile failures do not block the required core seed and smoke path.

## Validation and Idempotency

Missing seed packs and invalid seed schemas fail before writes. Parent dependency failures stop dependent records unless optional. Duplicate natural keys with incompatible immutable fields fail the run and do not silently mutate meaning.

Same seed version reruns create no duplicates and report skipped/current records. Older seed versions with allowed mutable differences update through approved service/admin paths or controlled migration paths that preserve domain validation, audit, and outbox behavior.

## Smoke Reliability

Smoke checks read seeded records through APIs and authorization paths, not database shortcuts. Event-enabled smoke verifies that Kafka/SR publication and event status visibility are true before claiming event smoke success.

Successful runs report pack id, seed version, created/updated/skipped/failed counts, smoke result, and correlation id.

## Failure Handling

Service unavailable, missing pack, invalid schema, missing parent, immutable conflict, and Kafka/SR event-smoke failure are distinct result categories. Diagnostics name the target service, seed file, validation path, key, endpoint, and correlation id where relevant.

## Source Trace

This design implements constraints from `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

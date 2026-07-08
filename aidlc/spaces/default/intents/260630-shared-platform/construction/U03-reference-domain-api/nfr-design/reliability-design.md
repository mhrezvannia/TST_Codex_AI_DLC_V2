# Reliability Design - U03 Reference Domain API

## Reliability Goals

U03 must make reference-data mutations reliable, explainable, and recoverable. A successful mutation persists aggregate state, appends change history, and creates exactly one domain change fact for U04 handoff. Failed validation, authorization, duplicate-key, conflict, stale-version, or dependency checks do not persist state and do not create facts.

Provider reads must fail predictably when dependencies are unavailable and must not return partial or mixed-version state.

## Consistency Model

Admin mutation application services execute authorization and validation before the database transaction. The transaction writes aggregate state, change history, and domain fact together through repository/outbox ports. The response returns the committed version and correlation id only after durable persistence succeeds.

Validation-only endpoints reuse rule evaluation and return findings without persistence, audit append, or fact creation.

## Failure Handling

If U02 is unavailable or returns uncertainty for a protected mutation, U03 fails closed with a dependency/authorization error before state changes. If PostgreSQL is unavailable, provider reads and admin writes return service dependency errors. Duplicate active keys, invalid relationships, orphan ports, inactive relationship references, invalid status transitions, and stale versions return explicit non-mutating errors.

If U04 is unavailable, U03 does not retry Kafka publication. The stored domain fact remains durable for U04's publication and recovery responsibilities.

## Health and Readiness

Readiness checks verify PostgreSQL connectivity and the configured U02 dependency path needed for protected operations. Liveness avoids expensive business queries. Health responses exclude sensitive record details and include correlation support for diagnostics.

## Recovery and Observability

Every mutation and failure path logs operation, reference set, result category, version where available, and correlation id. Domain facts include reference set, entity id, business key, operation, changed fields, version, occurredAt, and correlation id, allowing U04 to resume event publication and prove ordering by aggregate/version.

Change history keeps inactive records readable and supports admin investigation without relying on external events as the source of truth.

## Source Trace

This design implements constraints from `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

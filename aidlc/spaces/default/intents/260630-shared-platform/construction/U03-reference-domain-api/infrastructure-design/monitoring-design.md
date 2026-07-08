# Monitoring Design - U03 Reference Domain API

## Metrics and KPIs

U03 emits metrics for provider list/detail latency, admin create/update/status latency, validation-only latency, search/filter latency, history-read latency, U02 authorization latency, PostgreSQL latency, duplicate-key conflicts, stale-version conflicts, validation failures, domain fact creation, and API error categories.

p95 reference read latency is tracked for the common read target. Metric labels remain bounded by operation, set family, result, status, dependency, and environment.

## Logging Strategy

Structured logs include service, operation, reference set, result, error code, version where safe, dependency, and correlation id. Logs must not expose internal DB keys, unsafe Party/Customer payload details, secrets, stack traces, or unauthorized policy internals.

## Tracing Configuration

OpenTelemetry spans cover controllers, BFF/service request handling, authorization calls to U02, validation, repository queries/writes, audit append, domain fact creation, and error mapping. Correlation id propagates into audit/change history and domain facts.

## Alerts and Dashboards

Dashboards track p95 list/detail latency, write latency, validation error rate, duplicate/stale conflict rate, U02 dependency failures, PostgreSQL dependency health, history-query latency, and domain-fact handoff failures.

## Incident Response

Operators can trace a failed or delayed change by correlation id, record id, reference set, operation, and safe error code. Publication status investigation continues through U04 status signals.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

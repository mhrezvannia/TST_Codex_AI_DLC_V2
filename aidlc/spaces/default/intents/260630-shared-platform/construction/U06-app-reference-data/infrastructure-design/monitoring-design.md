# Monitoring Design - U06 Reference Data App

## Metrics and KPIs

U06 emits BFF metrics for list, detail, search/filter, form submit, deactivate/reactivate, event-status, identity-service latency, reference-data-service latency, validation conflicts, denied/read-only states, and error categories.

## Logging Strategy

Structured logs include app, route, reference set, operation, result, safe error code, dependency, and correlation id. Logs exclude tokens, secrets, internal database keys, stack traces, and unauthorized policy internals.

## Tracing Configuration

OpenTelemetry spans cover BFF route handling, identity-service calls, reference-data-service calls, event-status calls, validation/error mapping, and response rendering boundaries.

## Alerts and Dashboards

Dashboards track BFF error rate, service dependency failures, validation/conflict frequency, event-status unavailable rate, and app health/readiness.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

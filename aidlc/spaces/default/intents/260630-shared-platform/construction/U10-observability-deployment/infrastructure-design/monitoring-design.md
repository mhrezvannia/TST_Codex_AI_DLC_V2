# Monitoring Design - U10 Observability Deployment

## Metrics and KPIs

Dashboards cover health, smoke, request latency, error rate, authorization outcomes, outbox depth, oldest pending age, retry/failure counts, event freshness p95, publication attempts, and deployment readiness.

## Logging Strategy

JSON logs include timestamp, level, service/app, environment, operation, correlationId, result, safe error code, and safe actor/resource summary where applicable. Logs mask secrets, tokens, credentials, restricted payloads, and unsafe PII.

## Tracing Configuration

OpenTelemetry propagates trace/span context across BFF, service, identity, reference, outbox, Schema Registry, Kafka, and status boundaries, exporting to Jaeger.

## Alerts and Dashboards

Alerts cover readiness failure, smoke failure, freshness p95 breach, repeated publication failure, telemetry export degradation, and required dependency unavailability. Correlation ids are searchable in logs/traces/status, not metric labels.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

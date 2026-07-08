# Performance Design - U10 Observability Deployment

## Performance Goals

U10 provides observability for reference read p95 <= 300 ms, event freshness p95 <= 60 seconds, dependency timing, health/smoke duration, and operational diagnostics without adding unbounded telemetry overhead or high-cardinality metric labels.

## Signal Design

Services and BFF apps emit latency, error, authorization decision, outbox lag, event freshness, publication attempts, health, and smoke metrics. Metrics use bounded labels such as service, operation, result, status, and environment. Correlation id, event id, and record id remain in logs, traces, and status APIs.

Structured JSON logs include timestamp, level, service/app, environment, operation, correlation id, result, safe error code, and safe actor/resource summary where appropriate.

## Trace Design

OpenTelemetry context starts or joins at browser/BFF/service boundaries and continues across BFF-to-service calls, identity-service calls, reference-data-service calls, outbox publishing, Schema Registry, Kafka publish, and status updates. Trace spans record dependency timings and failure boundaries.

## Dashboard Design

Grafana, ELK, and Jaeger views are organized around health, smoke, request latency, error rate, authorization outcomes, outbox lag, event freshness, publication attempts, and correlation lookup. Views rely on bounded labels and indexed log fields.

## Telemetry Failure Handling

Telemetry export failures are tracked separately from application failures. Application behavior remains functional when telemetry export is degraded, while readiness/observability status reflects the degraded signal path.

## Source Trace

This design implements constraints from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

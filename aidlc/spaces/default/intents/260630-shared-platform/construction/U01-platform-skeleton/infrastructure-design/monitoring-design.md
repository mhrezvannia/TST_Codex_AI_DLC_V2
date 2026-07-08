# Monitoring Design - U01 Platform Skeleton

## Metrics and KPIs

U01 defines telemetry conventions rather than final dashboards. Services and apps expose Prometheus-compatible metrics for request latency, error rate, health, dependency status, and smoke status. Later units add authorization, reference read, outbox lag, and event freshness metrics.

Metric labels must stay bounded by service/app, operation, result, status, dependency, and environment. Correlation ids are not metric labels.

## Logging Strategy

All deployables emit structured JSON logs with timestamp, level, service/app, environment, operation, correlationId, result, and safe error code. Logs must mask tokens, secrets, credentials, restricted payload values, and unsafe PII.

## Tracing Configuration

The skeleton reserves OpenTelemetry wiring for BFF, backend service, and publisher paths. Correlation and trace context propagate through REST headers and later event envelopes. Jaeger is available in the optional observability profile.

## Alert and Dashboard Placeholders

Optional local Prometheus/Grafana, ELK, and Jaeger services provide proof-of-wiring dashboards/searches for:

| Area | Initial signal |
|---|---|
| Health | Liveness/readiness status by deployable. |
| Smoke | Last smoke result and failure boundary. |
| Latency | Request duration by service/app and operation. |
| Errors | Error count by safe error code and result. |
| Events | Placeholder for outbox lag/freshness once U04 exists. |

## Incident Response Hooks

U01 defines correlation id visibility in logs, health responses, smoke output, and safe error envelopes. Incident process, escalation, final SLOs, and DR targets are deferred.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

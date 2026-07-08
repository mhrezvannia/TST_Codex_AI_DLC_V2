# Scalability Requirements - U10 Observability Deployment

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines observability across services, BFF apps, outbox, Kafka, Compose profiles, Nginx, Vault references, and approved stack. `business-rules.md` requires bounded labels, on-prem descriptors, optional local observability profiles, and staging observability evidence. `requirements.md` fixes ELK, Prometheus/Grafana, Jaeger, Docker Compose, and local reproducibility.

## Scaling Model

U10 scales observability through standard signals and bounded dimensions across deployables rather than custom per-feature dashboards.

## Structural Requirements

| Area | Requirement |
|---|---|
| Logs | JSON fields include timestamp, level, service/app, environment, operation, correlationId, result, error code. |
| Metrics | Bounded labels by service, operation, result, and status; no correlation id label. |
| Traces | OpenTelemetry trace/span context across BFF/service/publisher boundaries. |
| Dashboards | Grafana/ELK/Jaeger organized around health, smoke, request latency, outbox lag, freshness, errors, and authorization decisions. |
| Compose profiles | Core services separated from optional local observability profile. |

## Growth Assumptions

- More apps/services can adopt the same signal conventions.
- Event and log volume grow with reference changes and auth decisions.
- Final production load profile remains open and must be supported by configurable retention/scrape/export settings.

## Non-Goals

- No per-consumer custom dashboard implementation.
- No public-cloud telemetry scaling model.
- No final retention/storage sizing in this stage.


# Scalability Design - U10 Observability Deployment

## Scalability Goals

U10 scales observability through standard signal conventions and bounded dimensions across deployables, not custom per-feature dashboards or a separate operations application.

## Log Model

JSON logs use stable fields: timestamp, level, service/app, environment, operation, correlationId, result, error code, safe actor/resource summary, event id where relevant, and record id where safe. Logs are ELK-compatible and searchable by indexed safe fields.

## Metric Model

Prometheus-compatible metrics use bounded labels: service, operation, result, status, dependency, and environment. Correlation id and event id are excluded from metric labels. Scrape/export settings and retention remain configurable for later load validation.

## Trace Model

OpenTelemetry trace/span context crosses BFF, service, identity-service, reference-data-service, outbox publisher, Schema Registry, Kafka, and status boundaries. More services can adopt the same conventions without custom tracing models.

## Dashboard Model

Grafana/ELK/Jaeger views are organized around health, smoke, request latency, outbox lag, freshness, errors, authorization decisions, and deployment readiness. Optional local observability profiles are separate from core Compose services.

## Growth Boundaries

The design does not define per-consumer custom dashboards, public-cloud telemetry scaling, final retention/storage sizing, or final production load profile.

## Source Trace

This design implements constraints from `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

# Infrastructure Services - U10 Observability Deployment

## Observability Stack

ELK-compatible collection handles structured JSON logs. Prometheus/Grafana handles metrics and dashboards. Jaeger/OpenTelemetry handles distributed tracing. The stack is on-prem/local and not public-cloud managed.

## Edge and Routing

Nginx provides route forwarding and readiness-aware app/BFF routing. Backend services are not exposed directly to browsers.

## Secrets and Registry

Vault references represent non-local secrets. Image registry names and tags are deterministic to support deployment traceability and rollback.

## Health and Smoke

Every deployable exposes liveness/readiness. Smoke runner exercises auth, reference BFF/API access, persistence, outbox/event evidence, correlation evidence, and basic observability signal presence.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

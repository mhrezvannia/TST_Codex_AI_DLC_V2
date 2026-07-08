# Infrastructure Design Questions - U10 Observability Deployment

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U10-observability-deployment`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Use on-prem Docker Compose descriptors for core and observability profiles, Nginx routing, deterministic image tags, Vault references, health/readiness endpoints, smoke commands, and deployment records.

### Q2. Compute/storage/networking

[Answer]: Core services run through Compose/Nginx. Observability profile provides ELK-compatible logs, Prometheus/Grafana metrics, Jaeger/OpenTelemetry traces, and collector wiring. No public-cloud managed observability or Kubernetes-only descriptors.

### Q3. Monitoring approach

[Answer]: Standardize JSON logs, bounded Prometheus labels, OpenTelemetry traces, Grafana dashboards, ELK searches, health/smoke status, outbox/freshness signals, and correlation lookup.

### Q4. CI/CD pipeline

[Answer]: Build-and-test/environment stages implement health/smoke commands, dashboard/search packs, deployment record generation, and readiness evidence using U08 gate outputs.

### Q5. Secrets management

[Answer]: Non-local secrets are Vault references. Telemetry, broker, database, Keycloak, and app credentials are not literal values and are never exposed to browser code or logs.

### Q6. Scaling policy

[Answer]: Scale by standard signal conventions, bounded labels, configurable retention/scrape/export settings, and optional profile separation. Final retention/storage sizing is deferred.

## Ambiguity Analysis

No blocking ambiguity remains. Final SLA/SLO, DR target, and production promotion automation are outside this unit.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

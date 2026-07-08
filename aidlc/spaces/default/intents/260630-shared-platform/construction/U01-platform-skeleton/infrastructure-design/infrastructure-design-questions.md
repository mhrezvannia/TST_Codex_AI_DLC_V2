# Infrastructure Design Questions - U01 Platform Skeleton

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U01-platform-skeleton`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Use containerized local/on-prem Docker Compose profiles for MVP scaffolding. The core profile includes backend services, frontend apps, PostgreSQL, Keycloak, Kafka, Schema Registry, and Nginx. Optional observability is behind a profile and must not block core smoke.

### Q2. Compute, storage, and networking

[Answer]: Define service container slots, named networks, health checks, service DNS names, and local ports only. PostgreSQL is the owned storage baseline for `identity-service` and `reference-data-service`; Kafka/SR are shared integration infrastructure. Final production sizing is deferred.

### Q3. Monitoring approach

[Answer]: Standardize JSON logs, Prometheus-compatible metrics, OpenTelemetry tracing, health endpoints, and correlation propagation placeholders. Optional local ELK/Prometheus/Grafana/Jaeger containers prove wiring without becoming required for local functional smoke.

### Q4. CI/CD pipeline shape

[Answer]: Define root script aliases and CI stages for backend Maven checks, frontend Yarn/Turborepo checks, contract/schema checks, seed/smoke hooks, and artifact tagging. Concrete workflow implementation belongs to later build-and-test/CI stages.

### Q5. Secrets management

[Answer]: Local Compose may use development-only values. Non-local descriptors must reference Vault paths rather than literal secrets. Browser-visible code must never receive service, broker, database, or observability credentials.

### Q6. Scaling policy

[Answer]: U01 only defines scale-ready boundaries: independent service/app containers, bounded health/smoke hooks, optional profiles, and shared infrastructure ownership. Autoscaling, final capacity, and production retention are deferred.

## Ambiguity Analysis

No blocking ambiguities remain. U01 intentionally records placeholders and conventions; later units provide concrete service behavior, schema details, and environment sizing.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

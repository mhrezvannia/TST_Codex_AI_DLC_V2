# Tech Stack Decisions - local-runtime-foundation

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The local runtime stack is reuse-first and aligned with the brownfield repository. This unit configures and verifies local orchestration rather than introducing production cloud infrastructure.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Runtime orchestration | Docker Compose profiles | Existing stack and requirement FR-RUN-001 require local Windows `docker compose --profile full up -d --build`. |
| Database | PostgreSQL 15 | Existing Compose service; supports separate logical databases/users. |
| Identity | Keycloak 24.0 | Existing local identity provider and required for Keycloak-backed auth. |
| Event broker | Confluent Kafka 7.7.1 | Existing local event broker for Booking/CMM/reference-data events. |
| Schema Registry | Confluent Schema Registry 7.7.1 | Existing local compatibility dependency for Avro schemas. |
| Reverse proxy | nginx 1.27 | Existing reverse-proxy technology for local service/frontend routing. |
| Observability substrate | Prometheus, Grafana, Jaeger, OpenTelemetry Collector, Elasticsearch, Kibana | Existing infrastructure services; final dashboards/SLOs remain with later units/stages. |
| Frontend/runtime tooling | Yarn 4.5.3 and Turbo 2.3.3 where commands cross workspaces | Fits current monorepo frontend/shared package tooling. |
| Backend runtime | Java 21, Spring Boot 3.3.7, Maven | Fits current backend services and health-test hooks. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Production cloud provisioning | Owned by Operation and infrastructure stages, not local-runtime foundation. |
| Business migrations and seed data | Owned by service/domain and `enterprise-seed-migrations-devex` units. |
| Final dashboards, alert thresholds, and SLOs | Owned by observability and NFR stages. |
| External provider adapters | Deferred until internal local flows pass. |

## Implementation Constraints

- Profiles must be `core`, `app`, `observability`, `devtools`, and `full`.
- `.env.example` must be secret-free.
- Local overrides must remain untracked.
- Commands must be Windows-friendly.
- Service URLs, callback URLs, and ports must be deterministic.
- Host IDE mode must use documented local-only overrides.

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines profile, command, health, IDE mode, and environment workflows. |
| `business-rules.md` | Defines profile, readiness, security, and boundary rules. |
| `requirements.md` | Supplies FR-RUN-001 through FR-RUN-006 and NFR-SEC requirements. |
| `technology-stack.md` | Provides the selected Docker Compose, PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, observability, Java/Spring, and Yarn/Turbo stack. |
| `nfr-requirements-questions.md` | Q1 through Q5 select startup, readiness, security, capacity, and reliability posture. |

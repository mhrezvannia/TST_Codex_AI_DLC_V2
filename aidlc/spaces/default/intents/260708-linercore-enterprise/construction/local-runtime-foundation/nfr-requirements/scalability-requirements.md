# Scalability Requirements - local-runtime-foundation

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Scalability for this unit means the local runtime can host the full first-release enterprise topology with deterministic profiles and room for module development modes.

## Local Capacity Baseline

| Runtime area | Required first-release capacity |
|---|---|
| Backend services | One local instance each for identity, reference data, charge, booking, and container movement as they are implemented. |
| Frontends | Enterprise Web plus retained module development apps where Delivery Planning keeps them. |
| Databases | Separate logical databases/users for identity, reference data, pricing, booking, container movement, Keycloak, and tooling where required. |
| Eventing | Kafka and Schema Registry for reference-data, booking, and CMM event flows. |
| Reverse proxy | Route all local service/frontend paths through deterministic URLs. |
| Observability | Prometheus, Grafana, Jaeger, OpenTelemetry Collector, and log/search foundation under profile control. |

## Profile Growth Requirements

- New services must join `app` and `full` profiles without breaking `core`.
- Optional tools must join `devtools` without becoming required for readiness.
- Observability services must join `observability` and `full` without blocking domain-only development profiles unless explicitly selected.
- Profile health output must remain readable as service count grows.
- Port conventions must prevent silent conflicts and identify owner on conflict.

## Scaling Triggers

| Trigger | Response |
|---|---|
| More than one service needs host IDE mode | Document per-service host override and prevent conflicting proxy routes. |
| Startup exceeds profile target | Split readiness phases, add parallel startup, or reduce unnecessary profile coupling. |
| Profile health output becomes too large | Group by infrastructure, backend, frontend, observability, and devtools. |
| Database count grows | Preserve separate logical owner naming and migration hooks. |

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines profile startup, health, IDE mode, and environment validation. |
| `business-rules.md` | Defines profile content and boundary rules. |
| `requirements.md` | Supplies FR-RUN-001 through FR-RUN-007 and no cross-service SQL constraint. |
| `technology-stack.md` | Supplies current Docker Compose and infrastructure stack. |
| `nfr-requirements-questions.md` | Q4 sets local capacity baseline. |

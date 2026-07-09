# Scalability Design - local-runtime-foundation

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Scalability for this unit means the local runtime can host the complete first-release enterprise topology while still supporting focused module development modes.

## Profile Topology

| Profile | Scales to | Dependency rule |
|---|---|---|
| `core` | PostgreSQL, Keycloak, Kafka, Schema Registry, shared network. | Must remain usable without application services. |
| `app` | Identity, Reference Data, Charge, Booking, CMM, Enterprise Web, reverse proxy, contract-test hooks as implemented. | Requires `core` dependencies but not observability/devtools. |
| `observability` | Prometheus, Grafana, Jaeger, OpenTelemetry Collector, Elasticsearch, Kibana. | Optional unless selected or `full` requires it. |
| `devtools` | Admin UIs and local developer utilities. | Optional and cannot block required readiness unless selected. |
| `full` | Complete local enterprise runtime. | Composes all implemented profile groups with honest missing-unit reporting. |

## Capacity Design

| Runtime area | Capacity design |
|---|---|
| Backend services | One local instance each for identity, reference data, charge, booking, and CMM, with host IDE override for one or more services when routes are distinct. |
| Frontends | Enterprise Web plus retained module dev apps as Delivery Planning permits. |
| Databases | Separate logical databases/users for identity, reference data, pricing, booking, container movement, Keycloak, and tooling. |
| Eventing | Kafka and Schema Registry cover reference-data, booking, and CMM event flows. |
| Reverse proxy | Deterministic local URLs route service and frontend paths and identify route owner on conflict. |
| Observability | Profile-controlled observability services scale with `observability` and `full`, not with basic domain-only development. |

## Growth Controls

| Growth trigger | Design response |
|---|---|
| New backend service | Add to `app` and `full`, declare database/env/health/proxy ownership, preserve `core`. |
| New frontend | Add deterministic route, port, and health check; avoid conflicting retained module app routes. |
| Multiple host IDE services | Use explicit host overrides and route ownership checks. |
| Startup exceeds target | Split readiness phases, parallelize independent services, or reduce unnecessary profile coupling. |
| Health output too large | Group by infrastructure, backend, frontend, observability, devtools, and evidence hooks. |
| Database count grows | Preserve logical owner naming and migration hook contracts. |

## Health Matrix Scaling

The `health` command produces grouped rows:

- Infrastructure: Docker, network, PostgreSQL, Keycloak, Kafka, Schema Registry, nginx.
- Backend: identity, reference data, charge, booking, CMM.
- Frontend: Enterprise Web and retained module apps.
- Observability: Prometheus, Grafana, Jaeger, OpenTelemetry Collector, log/search foundation.
- Devtools: optional tools selected by profile.
- Evidence hooks: contract validation, migrations, seed, and smoke checks when available.

Each row contains owner, state, endpoint or port, blocker, and remediation.

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements capacity baseline, profile growth, grouped health output, port ownership, and scaling triggers. |
| `performance-requirements.md` | Keeps profile groups and health output structured enough to preserve startup and command targets. |
| `security-requirements.md` | Scales secure defaults, Keycloak, JWT, bypass, port, callback, and service identity checks across profiles. |
| `reliability-requirements.md` | Uses grouped health states to prevent one profile or optional tool from falsely blocking another. |
| `tech-stack-decisions.md` | Maps the selected Compose, PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, observability, Java/Spring, and Yarn/Turbo stack. |
| `business-logic-model.md` | Implements profile startup, health/readiness, IDE mode, and environment validation workflows. |

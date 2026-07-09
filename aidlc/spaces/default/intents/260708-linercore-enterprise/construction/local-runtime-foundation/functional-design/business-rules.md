# Business Rules - local-runtime-foundation

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The accepted answers require Compose profiles `core`, `app`, `observability`, `devtools`, and `full`; local PostgreSQL, Keycloak, Kafka, Schema Registry, reverse proxy, shared network, and health hooks; secret-free `.env.example`; honest readiness checks; independent IDE mode; and strict separation from domain, seed, cloud, and observability-SLO ownership.

## Profile Rules

| Rule | Statement |
|---|---|
| LRF-001 | `full` must start the complete local enterprise runtime as far as implemented units allow. |
| LRF-002 | `core` must include PostgreSQL, Keycloak, Kafka, Schema Registry, shared network, and base runtime dependencies. |
| LRF-003 | `app` must wire backend services, frontends, reverse proxy, and contract-test support as those units are implemented. |
| LRF-004 | `observability` must wire telemetry services without deciding final SLOs or dashboards. |
| LRF-005 | `devtools` may include admin and inspection tools, but devtools must not be required for production-like readiness claims. |

## Environment Rules

- `.env.example` must contain no secrets.
- Local defaults must be deterministic and Windows-friendly.
- Unsafe auth bypass must be explicit, development-only, and impossible to enable accidentally in non-local modes.
- Service URLs and callback URLs must be documented.
- Ports must be stable and conflict failures must be visible.

## Readiness Rules

| Rule | Statement |
|---|---|
| LRF-010 | `container_started` is not the same as `application_ready`. |
| LRF-011 | Docker, PostgreSQL, Keycloak, Kafka, and Schema Registry blockers must be reported as blockers, not warnings hidden by green status. |
| LRF-012 | A profile readiness report must list each included service and its status. |
| LRF-013 | Application readiness requires service health endpoints where the service exists. |
| LRF-014 | Evidence readiness requires profile-specific commands, logs, health, and contract/test hooks where applicable. |

## Boundary Rules

- This unit does not implement business behavior.
- This unit does not own domain migrations; it invokes migration hooks owned by service/domain units.
- This unit does not own business seed data; it invokes seed hooks owned by `enterprise-seed-migrations-devex`.
- This unit does not provision production cloud infrastructure.
- This unit does not define final observability dashboards, alerts, or SLOs.
- This unit does not claim local enterprise completion without real services, APIs/events, UI, contracts, tests, runtime, and observability evidence from dependent units.

## Security Rules

- Keycloak local realm/client bootstrap must be deterministic.
- JWT/RS256 validation settings must be available to services through local configuration.
- Service-to-service auth settings must be locally testable.
- Kafka ACL design hooks must exist where service identities are required.
- No local secret values may be committed.

## Developer Mode Rules

- A developer may run infrastructure in Docker and one selected service/frontend from the host IDE.
- Host-run services must use the same contract URLs, auth URLs, Kafka endpoints, and database endpoints as container-run services unless explicitly documented.
- Reverse proxy routing to host-run services is allowed only through documented local-only configuration.
- IDE mode readiness must be reported separately from full-container readiness.

## Completion Guardrails

- FR-RUN-001 is incomplete until `docker compose --profile full up -d --build` has a documented path.
- FR-RUN-002 is incomplete until required infrastructure services have health checks.
- FR-RUN-003 is incomplete until all five profiles exist or are intentionally stubbed with visible status.
- FR-RUN-006 is incomplete until setup/start/stop/reset/logs/health commands and `.env.example` exist.

## Traceability

| Source | Business-rule coverage |
|---|---|
| `unit-of-work.md` | Defines U01 runtime responsibilities and boundaries. |
| `unit-of-work-story-map.md` | Maps runtime rules to US-SP-001, US-RUN-001, and US-RUN-002. |
| `requirements.md` | Supplies FR-RUN, NFR-SEC, and no-fake-readiness constraints. |
| `components.md` | Defines Local Runtime Platform responsibilities. |
| `component-methods.md` | Provides runtime method expectations for health/configuration paths. |
| `services.md` | Defines infrastructure services and orchestration topology. |


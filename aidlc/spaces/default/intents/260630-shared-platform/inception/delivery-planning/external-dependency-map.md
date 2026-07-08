# External Dependency Map - Shared Platform MVP

## Source Trace

This dependency map is based on `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`, and `delivery-planning-questions.md`.

## Dependency Register

| Dependency | Owner | Lead time | Blocks | Mitigation / workaround |
|---|---|---|---|---|
| Keycloak 24 dev/staging realm, clients, JWKS/OIDC metadata | Security / IT | Medium | Bolt 1, Bolt 2, Bolt 5, Bolt 6 | Use local Keycloak realm for development; keep auth adapter configurable. |
| Kafka broker and Confluent Schema Registry | Platform operations | Medium | Bolt 1, Bolt 4, Bolt 7, Bolt 9 | Use local Docker Compose Kafka/SR for dev; contract schemas versioned in repo. |
| PostgreSQL 15+ instances/schemas | Platform DBA / operations | Low-Medium | Bolt 1, Bolt 2, Bolt 3, Bolt 8 | Use local Compose Postgres; migrations define schema repeatably. |
| GitHub Actions self-hosted runners | Platform / CI team | Medium | Bolt 1, Bolt 9 | Run local scripts until runner is available; keep workflows runner-label configurable. |
| Vault and service secrets | Platform security / operations | Medium | Bolt 1, Bolt 8, Bolt 10 | Use local dev secrets only in Compose; production secrets reference Vault paths. |
| Nginx edge routing and TLS baseline | Platform operations | Medium | Bolt 5, Bolt 6, Bolt 10 | Local reverse proxy config for dev; deployment descriptors keep route assumptions explicit. |
| ELK, Prometheus/Grafana, Jaeger/OpenTelemetry Collector | Operations | Medium | Bolt 1, Bolt 10 | Local telemetry exporters/log capture for dev; production endpoints configurable. |
| Harbor container registry and Nexus/Artifactory package registry | Platform operations | Medium | Bolt 9, Bolt 10 | Build local images/packages first; publish steps remain registry-configurable. |
| Exact MVP trade lanes, regions, ports, operating sites | Product / operations | Medium | Bolt 3, Bolt 8 | Seed configurable placeholder Regions/TradeLanes; do not hard-code final footprint. |
| Data residency and DR site decisions | Architecture / compliance / operations | Medium-High | Bolt 10 | Keep deployment descriptors environment-parametric; avoid site-specific code. |
| Downstream contract reviewers | Future module representatives | Medium | Bolt 7, Bolt 9 | Provide review packet; do not block Shared Platform runtime work on downstream implementation. |
| OWASP/API/CIS evidence expectations | Security / compliance | Medium | Bolt 9, Bolt 10 | Maintain security evidence checklist and map unresolved items to NFR/security stages. |

## Gated Items by Bolt

| Bolt | Gated dependency checks |
|---|---|
| Bolt 1 | Local Keycloak/Kafka/Postgres availability or approved local substitutes; smoke CI path. |
| Bolt 2 | Keycloak realm/client metadata; role catalog approval. |
| Bolt 3 | PostgreSQL schema/migration path; initial seed-data assumptions. |
| Bolt 4 | Kafka/SR availability; Avro compatibility rules. |
| Bolt 5 | BFF/session and Keycloak callback settings. |
| Bolt 6 | Reference APIs and identity authorization API availability. |
| Bolt 7 | Downstream reviewer availability and contract-review window. |
| Bolt 8 | Local Compose service availability; seed-data decisions. |
| Bolt 9 | Self-hosted runner and registry access. |
| Bolt 10 | Nginx/Vault/observability endpoints and staging promotion checks. |

## Fully AI-Contained Work

The following can proceed locally without external approval once templates and local services are available:

- Backend module skeletons and domain/application interfaces.
- Frontend App Router/BFF scaffolds.
- Local contract artifacts and sample schemas.
- Local Docker Compose and seed scripts.
- Unit tests, local integration tests, and lint/type checks.

## Scope Guardrail

External dependency tracking does not add Charge, Booking, or Container Movement runtime scope. Downstream representatives are involved only for contract review.

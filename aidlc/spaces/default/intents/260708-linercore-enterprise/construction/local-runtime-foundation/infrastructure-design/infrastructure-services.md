# Infrastructure Services - local-runtime-foundation

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This design selects the local infrastructure services required to run and prove the enterprise topology during Construction.

## Service Inventory

| Infrastructure service | Purpose | Profile |
|---|---|---|
| PostgreSQL | Local logical databases/users for identity, reference data, pricing, booking, CMM, Keycloak, and tools. | `core`, `full` |
| Keycloak | Local identity provider, realm/client/user/role/capability bootstrap. | `core`, `full` |
| Kafka | Local event broker for reference data, booking, CMM, and contract/event checks. | `core`, `full` |
| Schema Registry | Avro compatibility and contract compatibility evidence. | `core`, `full` |
| nginx | Reverse proxy for backend services, frontends, callbacks, and host IDE overrides. | `app`, `full` |
| Prometheus | Metrics collection. | `observability`, `full` |
| Grafana | Dashboards. | `observability`, `full` |
| Jaeger | Trace viewing. | `observability`, `full` |
| OpenTelemetry Collector | Telemetry pipeline. | `observability`, `full` |
| Log/search foundation | Local log access and search where enabled. | `observability`, `full` |
| Optional devtools | Admin UIs and developer utilities. | `devtools`, `full` |

## Database And Volume Design

| Data surface | Design |
|---|---|
| Service databases | Separate logical database and user per service; no cross-service SQL ownership. |
| Keycloak state | Dedicated Keycloak database and deterministic import assets. |
| Kafka/registry state | Local volumes scoped to the Compose project; resettable only by explicit reset scope. |
| Observability data | Optional volumes with bounded local retention. |
| Reset behavior | Prints affected volumes before destructive action and only touches workspace-owned local volumes. |

## Networking And Ports

The `PortAndRouteRegistry` owns deterministic local URLs, ports, callback URLs, and host override routes. Port conflicts fail preflight with the exact owner and remediation. Reverse proxy routes must distinguish:

- service API routes,
- frontend routes,
- Keycloak callback routes,
- host IDE overrides,
- health and readiness endpoints.

## Secrets And Configuration

| Configuration surface | Control |
|---|---|
| `.env.example` | Safe placeholders only; committed and validated. |
| `.env` | Local, ignored, and never required to contain production secrets. |
| Auth bypass flags | Explicitly local-only; health output marks bypass visibly. |
| JWT/service settings | Issuer, audience, JWKS, and service identity settings appear in config checks. |
| Callback URLs | Validated against Keycloak clients and reverse proxy routes. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides service grouping and profile startup controls. |
| `security-design.md` | Implements environment validation, deterministic auth bootstrap, local-only bypass, and JWT visibility. |
| `scalability-design.md` | Supports complete first-release service, frontend, eventing, database, and observability topology. |
| `reliability-design.md` | Preserves reset safety, blocker evidence, and grouped health states. |
| `logical-components.md` | Maps services to DatabaseBootstrapper, EventingBootstrapper, KeycloakBootstrapper, ReverseProxyConfigurator, and RuntimeHealthCollector. |
| `components.md` | Implements Local Runtime Platform and supports Observability, Contract, Seed, Migration, and Enterprise Web components. |
| `services.md` | Provides the enterprise infrastructure services and service orchestration topology. |
| `business-logic-model.md` | Implements profile startup, reset, health, IDE mode, and environment validation workflows. |

# Logical Components - local-runtime-foundation

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical component model defines the local runtime foundation that Infrastructure Design and Code Generation will turn into Compose profiles, scripts, health checks, and developer documentation.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| ProfileOrchestrator | Starts, stops, and composes `core`, `app`, `observability`, `devtools`, and `full` profiles. | Profile dependency and Compose invocation. |
| EnvironmentValidator | Validates `.env.example`, local `.env`, placeholders, unsafe bypass flags, and deterministic URLs. | Environment and security preflight. |
| PortAndRouteRegistry | Owns local ports, reverse-proxy routes, callback URLs, and host IDE overrides. | Port conflict and route ownership. |
| RuntimeHealthCollector | Produces grouped readiness matrix for infrastructure, backend, frontend, observability, devtools, and evidence hooks. | Readiness truthfulness. |
| LogCollector | Streams or captures bounded logs by profile and service. | Failure diagnosis evidence. |
| ResetCoordinator | Performs explicit scoped local volume reset and invokes later migration/seed hooks. | Destructive local state operations. |
| KeycloakBootstrapper | Imports deterministic realm, clients, users, roles, capabilities, and callback URLs. | Auth-enabled readiness. |
| DatabaseBootstrapper | Creates or validates logical databases and users for service ownership. | Database isolation. |
| EventingBootstrapper | Starts Kafka and Schema Registry and exposes readiness to event and contract checks. | Event integration readiness. |
| ReverseProxyConfigurator | Maps deterministic local service/frontend routes through nginx. | Local routing and callback consistency. |
| HostIdeModeAdapter | Supports running one service or frontend on the host while infrastructure stays in Docker. | Host/container route split. |

## Boundary Model

Local Runtime owns:

- Compose profile topology.
- Shared networks and local ports.
- Environment examples and local override rules.
- Start, stop, reset, logs, setup, and health command surfaces.
- Keycloak, Kafka, Schema Registry, PostgreSQL, nginx, and observability substrate wiring.
- Independent IDE mode wiring.

Local Runtime does not own:

- Domain service business behavior.
- Provider or consumer contract implementation.
- Business migrations and seed fixtures.
- Production cloud provisioning.
- Final dashboards, alerts, SLO thresholds, or incident response.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Docker unavailable | No profile starts. | Fast preflight failure with remediation. |
| Port conflict | Affected route or service blocked. | Port owner report and deterministic route registry. |
| Keycloak import failure | Auth-enabled readiness blocked. | Preserve logs and keep non-auth infrastructure status visible. |
| PostgreSQL failure | Database-backed service readiness blocked. | Report affected databases and services. |
| Kafka/Schema Registry failure | Event and contract compatibility readiness blocked. | Static profile health remains visible. |
| Optional devtool failure | Selected devtool unavailable. | Optional tools do not block unselected profiles. |
| Reset misuse | Local data loss risk. | Explicit scope, affected volume report, workspace-owned volume constraint. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Startup timing | ProfileOrchestrator and RuntimeHealthCollector. |
| Health matrix | RuntimeHealthCollector with ProfileOrchestrator inputs. |
| Secret-free local config | EnvironmentValidator. |
| Keycloak and JWT readiness | KeycloakBootstrapper and EnvironmentValidator. |
| Port and callback validation | PortAndRouteRegistry and ReverseProxyConfigurator. |
| Host IDE mode | HostIdeModeAdapter and PortAndRouteRegistry. |
| Scoped reset | ResetCoordinator. |
| Log preservation | LogCollector. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support startup, setup, health, logs, stop, reset, and benchmark evidence targets. |
| `security-requirements.md` | Components enforce secret-free config, deterministic Keycloak, JWT/service identity settings, bypass controls, and callback validation. |
| `scalability-requirements.md` | Components support complete first-release topology, profile growth, grouped health, and port ownership. |
| `reliability-requirements.md` | Components preserve blocker state, logs, reset safety, and honest readiness categories. |
| `tech-stack-decisions.md` | Components map to Docker Compose, PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, observability, Java/Spring, Yarn/Turbo, and Maven. |
| `business-logic-model.md` | Components implement start, stop/reset, health/readiness, independent IDE mode, and environment validation workflows. |

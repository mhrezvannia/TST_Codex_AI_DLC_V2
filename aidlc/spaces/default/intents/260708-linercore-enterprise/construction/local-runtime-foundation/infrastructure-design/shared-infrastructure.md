# Shared Infrastructure - local-runtime-foundation

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This file is produced because the local runtime foundation provides shared infrastructure for every service, frontend, contract check, observability asset, seed, and migration workflow.

## Shared Resource Inventory

| Shared resource | Shared by | Ownership boundary |
|---|---|---|
| Compose project network | All local containers and selected host override routes. | Local Runtime owns network and route conventions. |
| PostgreSQL container | Identity, Reference Data, Charge, Booking, CMM, Keycloak, tools. | Local Runtime owns container; services own logical databases and migrations. |
| Keycloak container | Identity, Enterprise Web, backend auth checks. | Local Runtime owns bootstrap; Identity owns authorization semantics. |
| Kafka and Schema Registry | Reference Data, Booking, CMM, Contract Platform. | Local Runtime owns broker/registry availability; domain units own event behavior and schemas. |
| nginx reverse proxy | Frontends, backend APIs, callbacks, host IDE routes. | Local Runtime owns route map; services/apps own endpoints. |
| Observability stack | Services, frontends, Contract Platform, readiness evidence. | Observability Platform owns dashboards/alerts; Local Runtime starts optional substrate. |
| Local volumes | Runtime state, logs, registry data, observability data. | Local Runtime owns reset scope and safety checks. |

## Access Boundaries

| Boundary | Rule |
|---|---|
| Database ownership | Separate logical databases/users; no cross-service SQL joins. |
| Auth bypass | Development-only, explicit, visible in health, and rejected outside local profile mode. |
| Host IDE routes | Explicit owner; route conflicts block preflight. |
| Optional tools | Do not block required profiles unless selected. |
| Reset | Only workspace-owned local volumes named by selected scope may be removed. |

## Shared Network Flow

```text
[Browser / Host IDE]
        |
        v
[nginx Reverse Proxy] ---> [Enterprise Web]
        |
        +--> [Backend Services]
        +--> [Keycloak]
        +--> [Host-run Override]

[Backend Services] --> [PostgreSQL]
[Backend Services] --> [Kafka] --> [Schema Registry]
```

Text fallback: local browser and host IDE traffic flows through nginx to frontends, services, Keycloak, or host-run overrides. Services use PostgreSQL and Kafka/Schema Registry through the shared Compose network.

## Lifecycle Rules

| Resource | Lifecycle rule |
|---|---|
| `core` services | Start before app services and remain reusable for host IDE mode. |
| App services | Can be restarted independently where dependencies are healthy. |
| Observability services | Optional unless selected by `observability` or `full`. |
| Devtools | Optional and isolated from required readiness. |
| Volumes | Persist by default; reset only with explicit scope and affected-resource report. |
| Ports/routes | Deterministic defaults with preflight conflict detection. |

## Security And Compliance Controls

| Control | Shared-infrastructure implication |
|---|---|
| Least privilege | Local database users are per service; CI/local scripts avoid broad secret access. |
| Secret protection | `.env.example` is safe; local `.env` is ignored; logs redact sensitive values. |
| Auditability | Setup, health, reset, and benchmark reports include command, profile, timestamp, owner, status, and blocker. |
| Production separation | Local runtime evidence cannot bypass production approval or stand in for production cloud readiness. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares resources through profiles without forcing full runtime startup for every task. |
| `security-design.md` | Enforces local-only bypass, secret-free config, Keycloak/JWT visibility, and route validation. |
| `scalability-design.md` | Supports complete first-release topology and future service/frontend growth. |
| `reliability-design.md` | Preserves layered readiness, reset safety, logs, and blocker evidence. |
| `logical-components.md` | Maps shared resources to ProfileOrchestrator, PortAndRouteRegistry, DatabaseBootstrapper, EventingBootstrapper, ReverseProxyConfigurator, and ResetCoordinator. |
| `components.md` | Provides shared substrate for Local Runtime, Contract, Observability, Seed/Migration, Enterprise Web, and domain services. |
| `services.md` | Implements the infrastructure service list and orchestration topology. |
| `business-logic-model.md` | Implements shared start, stop, reset, health, logs, IDE mode, and environment validation workflows. |

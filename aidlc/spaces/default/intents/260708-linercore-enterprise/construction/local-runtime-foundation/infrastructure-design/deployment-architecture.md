# Deployment Architecture - local-runtime-foundation

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

`local-runtime-foundation` deploys the enterprise development runtime on a Windows workstation with Docker Compose profiles, deterministic local routes, secure environment validation, and honest readiness reporting.

## Deployment Model

| Profile | Purpose | Required substrate |
|---|---|---|
| `core` | PostgreSQL, Keycloak, Kafka, Schema Registry, and shared network. | Docker daemon, Compose, local volumes, deterministic ports. |
| `app` | Backend services, frontends, reverse proxy, and contract-test hooks as implemented. | `core`, service images or host overrides, nginx route map. |
| `observability` | Prometheus, Grafana, Jaeger, OpenTelemetry Collector, and log/search foundation. | Shared network, telemetry ports, bounded storage. |
| `devtools` | Optional admin and developer tools. | Explicit profile selection; does not block unselected profiles. |
| `full` | Complete local enterprise runtime composition. | All implemented profile groups plus honest missing-unit reporting. |

The deployment is local-only. It is not a production cloud topology and must not be used to claim production readiness.

## Runtime Topology

```text
[Developer Workstation]
        |
        v
[Docker Compose Project]
        |
        +--> [core: PostgreSQL, Keycloak, Kafka, Schema Registry]
        +--> [app: services, Enterprise Web, nginx]
        +--> [observability: Prometheus, Grafana, Jaeger, OTel, logs]
        +--> [devtools: optional admin utilities]
        |
        v
[Health Matrix + Logs + Benchmark Evidence]
```

Text fallback: a developer starts selected Compose profiles. Infrastructure, application, observability, and optional tools report separate health states into a local readiness matrix with logs and timing evidence.

## Environment Strategy

| Environment | Design |
|---|---|
| Local profile execution | Primary delivery runtime for this unit; supports `setup`, `start`, `stop`, `reset`, `logs`, and `health`. |
| Independent IDE mode | Keeps `core` in Docker while one service or frontend runs on the host, with explicit route ownership. |
| CI smoke path | CI can run setup/health or selected profile checks when runner capacity supports Docker. |
| Production | Out of scope; production deployment is handled by later Operation stages and cannot be inferred from local Compose. |

## Infrastructure-as-Code Approach

Docker Compose files and repository scripts are the infrastructure-as-code surface for this unit. They must:

- use profile-specific service declarations,
- keep service, volume, network, and port names deterministic,
- avoid hardcoded secrets,
- expose health checks for infrastructure and application services,
- keep local reset scoped to workspace-owned volumes,
- document Windows-friendly commands.

If a later AWS path is introduced, it must remain separate from this local runtime and follow CDK/IaC security, tagging, and environment-parity practices.

## Resource Sizing

| Resource | Local sizing rule |
|---|---|
| PostgreSQL | One container with separate logical databases/users for identity, reference data, pricing, booking, CMM, Keycloak, and tooling. |
| Kafka and Schema Registry | Single local broker/registry sufficient for contract and event integration checks. |
| Keycloak | One local realm import with deterministic clients, users, roles, capabilities, and callback URLs. |
| Backend services | One container each by default, host override allowed for focused IDE work. |
| Frontends | Enterprise Web and retained module dev apps as Delivery Planning permits. |
| Observability | Optional profile to protect core/app startup time and workstation resource use. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Implements profile startup, command budgets, benchmark evidence, and independent IDE mode. |
| `security-design.md` | Implements secret-free defaults, Keycloak/JWT checks, local-only bypass constraints, and callback validation. |
| `scalability-design.md` | Supports complete first-release topology while preserving profile isolation and grouped health. |
| `reliability-design.md` | Separates preflight, container, infrastructure, application, and evidence readiness states. |
| `logical-components.md` | Maps deployment responsibilities to ProfileOrchestrator, EnvironmentValidator, PortAndRouteRegistry, RuntimeHealthCollector, and reset/log components. |
| `components.md` | Implements Local Runtime Platform responsibilities and hosts shared infrastructure dependencies. |
| `services.md` | Provides PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, observability, and service topology support. |
| `business-logic-model.md` | Implements start profile, stop/reset, health/readiness, independent IDE mode, and environment validation workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps local runtime scope separate from production cloud provisioning and does not overclaim production readiness.
- Profile boundaries align with the approved `core`, `app`, `observability`, `devtools`, and `full` topology.
- Readiness is modeled as layered evidence rather than container startup alone.
- Security controls cover local secret handling, deterministic Keycloak, JWT/service settings, callback routes, and local-only bypass constraints.

Residual risks:

- Code Generation must choose exact Compose files, commands, port values, route map, health endpoints, and Windows wrappers.
- Build/Test must prove the documented startup and command budgets on a real Windows developer workstation.

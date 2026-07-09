# Performance Design - local-runtime-foundation

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

`local-runtime-foundation` makes the complete LinerCore enterprise runtime usable on a Windows developer workstation without remote runtime servers. Performance is measured through profile startup, command responsiveness, health feedback, log access, and reset duration.

## Profile Startup Architecture

| Profile | Purpose | Startup target | Design control |
|---|---|---|---|
| `core` | PostgreSQL, Keycloak, Kafka, Schema Registry, shared network. | <= 5 minutes. | Start infrastructure services in dependency order with health checks and parallelizable independent services. |
| `app` | Backend services, frontends, reverse proxy, contract-test hooks as implemented. | <= 10 minutes with images already built. | Reuse built images, separate service health from container start, and keep domain services independently restartable. |
| `observability` | Prometheus, Grafana, Jaeger, OpenTelemetry Collector, log/search foundation. | <= 5 minutes. | Keep observability optional unless profile explicitly selected. |
| `devtools` | Optional admin and developer tools. | <= 5 minutes. | Tools cannot block `core` unless selected by profile. |
| `full` | Complete local enterprise composition. | <= 15 minutes when dependent unit implementations exist. | Start profile groups in phases: infrastructure, services, frontends, observability, evidence hooks. |

The startup runner prints phase progress and current blocker instead of waiting silently. Build and dependency download time is measured separately from steady-state profile startup.

## Command Performance

| Command class | Budget | Design control |
|---|---|---|
| `setup` preflight | <= 30 seconds excluding Docker daemon startup. | Validate Docker, Compose, ports, `.env`, and prerequisites without starting services. |
| `health` | <= 15 seconds. | Read Compose status and bounded HTTP/CLI checks into a readiness matrix. |
| `logs` | <= 10 seconds to stream or collect bounded window. | Profile and service filters avoid collecting all logs by default. |
| `stop` | <= 2 minutes. | Stop only selected profile services unless `full` is requested. |
| `reset` | <= 5 minutes excluding migrations and seed hooks owned by later units. | Require scoped volumes and print affected resources before execution. |

## Independent IDE Mode

Independent IDE mode starts `core` in Docker while one service or frontend runs on the host. Performance controls are:

- Host-run service bypasses container build time.
- Reverse proxy routes or environment URLs identify host service endpoints explicitly.
- Health output marks `host_run` separately from `container_started`.
- Only one host-run override can own a proxy route at a time unless routes are distinct.

## Benchmark Evidence

Each benchmark emits a timing report with profile, command, Docker version, Compose version, selected services, start/end time, status, and blocker list.

| Benchmark | Evidence artifact |
|---|---|
| `core` startup | Compose timing, health matrix, blocker-free infrastructure status. |
| `full` startup | Compose timing, service/frontend route status, and evidence hooks where implemented. |
| Independent IDE mode | Host-run service route status and profile health output. |
| Health command | Timing, state categories, owner, and remediation text. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements startup targets, command budgets, resource constraints, and benchmark evidence. |
| `security-requirements.md` | Keeps preflight and health checks aware of `.env`, Keycloak, JWT, callback, and bypass controls. |
| `scalability-requirements.md` | Supports full first-release service, database, eventing, frontend, reverse proxy, and observability topology. |
| `reliability-requirements.md` | Distinguishes container, infrastructure, application, evidence, and blocked states in timing output. |
| `tech-stack-decisions.md` | Uses Docker Compose profiles, PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, observability services, Java/Spring, Yarn/Turbo, and Maven. |
| `business-logic-model.md` | Implements start, stop/reset, health/readiness, independent IDE mode, and environment validation workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design maps every approved startup and command budget to an execution control and evidence artifact.
- Readiness is separated from container startup, reducing false-green local runtime claims.
- Independent IDE mode is explicitly supported without weakening profile readiness semantics.
- Residual implementation risk belongs to Infrastructure Design and Code Generation: exact Compose service graph, port map, scripts, and Windows timing verification.

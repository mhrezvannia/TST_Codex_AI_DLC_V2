# Monitoring Design - local-runtime-foundation

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

Monitoring for this unit is local readiness evidence: profile timing, service state, blocker diagnosis, logs, reset evidence, and benchmark reports.

## Metrics And KPIs

| Metric | Target |
|---|---|
| `core` startup | <= 5 minutes. |
| `app` startup | <= 10 minutes with images already built. |
| `observability` startup | <= 5 minutes. |
| `devtools` startup | <= 5 minutes. |
| `full` startup | <= 15 minutes when dependent unit implementations exist. |
| `setup` preflight | <= 30 seconds excluding Docker daemon startup. |
| `health` command | <= 15 seconds. |
| `logs` command | <= 10 seconds to stream or collect bounded window. |
| `stop` command | <= 2 minutes. |
| `reset` command | <= 5 minutes excluding later migration/seed hooks. |

## Health Matrix

The health command emits grouped rows:

| Group | Rows |
|---|---|
| Infrastructure | Docker, network, PostgreSQL, Keycloak, Kafka, Schema Registry, nginx. |
| Backend | identity, reference data, charge, booking, CMM. |
| Frontend | Enterprise Web and retained module apps. |
| Observability | Prometheus, Grafana, Jaeger, OpenTelemetry Collector, log/search foundation. |
| Devtools | Selected optional tools. |
| Evidence hooks | Contracts, migrations, seed, smoke, and readiness checks when available. |

Each row includes owner, state, endpoint or port, blocker, and remediation.

## Log Strategy

| Log source | Access rule |
|---|---|
| Compose service logs | Stream or collect by profile and service; avoid collecting all logs by default. |
| Keycloak import logs | Preserve on auth-enabled blocker. |
| Kafka/Schema Registry logs | Preserve on event/contract blocker. |
| Reverse proxy logs | Include route owner and host override details. |
| Setup/health/reset output | Save command result and blocker list for evidence. |

Sensitive values from `.env`, tokens, passwords, and secrets must be redacted from logs and reports.

## Alerts And Readiness Signals

| Signal | Severity | Behavior |
|---|---|---|
| Docker unavailable | P1 local blocker | Fail setup/start with daemon remediation. |
| Port conflict | P1 for selected profile | Report port, service owner, and route conflict. |
| Keycloak import failure | P1 for auth-enabled profiles | Block application readiness and preserve logs. |
| Kafka/Schema Registry unavailable | P1 for event/contract profiles | Block event and compatibility readiness. |
| Optional devtool missing | P3 unless selected | Do not block unselected profiles. |
| Auth bypass outside local | P1 security blocker | Fail preflight. |

## Benchmark Evidence

Each benchmark report includes profile, command, Docker version, Compose version, selected services, runtime mode, start/end time, status, blocker list, and remediation. This evidence supports Build/Test and Operation readiness without claiming production availability.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Implements startup, command, logs, reset, and benchmark evidence targets. |
| `security-design.md` | Reports unsafe environment, auth, callback, JWT, and bypass blockers. |
| `scalability-design.md` | Groups health output so full topology remains inspectable as services grow. |
| `reliability-design.md` | Uses layered readiness states and preserves failure evidence. |
| `logical-components.md` | Monitoring maps to RuntimeHealthCollector, LogCollector, EnvironmentValidator, and ProfileOrchestrator. |
| `components.md` | Feeds Observability Platform and Enterprise Web operations readiness without owning their final dashboards. |
| `services.md` | Covers PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, services, frontends, and observability services. |
| `business-logic-model.md` | Implements health/readiness, logs, reset, setup, and benchmark workflows. |

# Business Logic Model - local-runtime-foundation

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

The unit is U01 `local-runtime-foundation`: the infrastructure foundation for local Windows execution. It supports US-SP-001, US-RUN-001, US-RUN-002, FR-SP-002, FR-RUN-001 through FR-RUN-006, NFR-SEC-001 through NFR-SEC-004, and the local runtime responsibilities in `components.md` and `services.md`.

## Functional Scope

`local-runtime-foundation` owns the local Compose substrate, profiles, shared networks, port conventions, environment examples, start/stop/reset/log/health command surfaces, reverse proxy foundation, and independent IDE runtime mode.

It does not implement domain behavior, service migrations, business seed fixtures, production cloud provisioning, or observability dashboard semantics. It exposes hooks that later units consume.

## Core Workflows

### Workflow 1 - Start profile

1. User runs a documented Compose command for `core`, `app`, `observability`, `devtools`, or `full`.
2. Runtime loader reads `.env.example` defaults and local `.env` overrides.
3. Compose starts profile services in dependency order.
4. Health checks wait for infrastructure readiness.
5. Readiness command reports container status, application health endpoint status where available, exposed ports, and blocking failures.

Profile intent:

| Profile | Purpose |
|---|---|
| `core` | PostgreSQL, Keycloak, Kafka, Schema Registry, shared network, and base runtime dependencies. |
| `app` | Backend services, frontends, reverse proxy, and contract-test hooks as they are implemented. |
| `observability` | Prometheus, Grafana, Jaeger, OpenTelemetry Collector, and log/search support. |
| `devtools` | Optional local tooling such as admin UIs and contract/dev utilities. |
| `full` | Complete local enterprise runtime composition. |

### Workflow 2 - Stop and reset

1. User runs documented stop command.
2. Runtime stops profile containers without deleting persistent state by default.
3. User runs reset command when a clean local state is needed.
4. Reset removes selected volumes and calls migration/seed hooks owned by later units.
5. Runtime reports which volumes and services were reset.

Reset must not silently delete state outside the workspace-owned local volumes.

### Workflow 3 - Health and readiness

1. Runtime checks Docker daemon availability and Compose support.
2. Runtime checks profile services.
3. Runtime distinguishes `container_started`, `infrastructure_ready`, `application_ready`, and `evidence_ready`.
4. Runtime reports Keycloak, PostgreSQL, Kafka, Schema Registry, reverse proxy, service endpoints, and frontend routes.
5. Runtime returns non-green status if Docker/Kafka/Schema Registry/Keycloak blockers exist.

### Workflow 4 - Independent IDE mode

1. Developer starts `core` infrastructure in Docker.
2. Developer chooses one service or frontend to run from the host IDE.
3. Runtime docs provide environment variables, service URLs, callback URLs, and ports.
4. Reverse proxy or service URLs route to the host-run service where supported.
5. Health output marks the host-run service separately from container-run services.

### Workflow 5 - Environment validation

1. Validate `.env.example` contains no secrets.
2. Validate required variables have safe local defaults.
3. Validate unsafe auth bypass cannot be enabled outside local mode.
4. Validate ports do not conflict with documented defaults.
5. Validate service URLs are deterministic and Windows-friendly.

## Runtime State Model

```text
not_started
  |
  v
starting_profile
  |
  +--> failed_preflight
  |
  v
containers_started
  |
  +--> infrastructure_unhealthy
  |
  v
infrastructure_ready
  |
  +--> application_unhealthy
  |
  v
application_ready
  |
  v
evidence_ready
```

Text fallback: runtime starts from no containers, passes preflight, starts containers, checks infrastructure health, checks app health, then marks evidence ready only when the profile-specific readiness checks pass.

## Command Surface

| Command class | Behavior |
|---|---|
| setup | Prepare `.env`, validate Docker, validate ports, and print prerequisites. |
| start | Start selected profile and wait for health. |
| stop | Stop selected profile without destructive cleanup. |
| reset | Recreate selected local volumes and call migration/seed hooks. |
| logs | Tail or collect logs by profile/service. |
| health | Print readiness matrix and blocking failures. |
| contract hooks | Invoke contract-platform checks when available. |

## Error Handling

- Missing Docker daemon is a failed preflight.
- Missing `.env` uses `.env.example` defaults only when no secret is required.
- Port conflicts fail with exact port and service owner.
- Keycloak realm/client import failures are blocking for auth-enabled profiles.
- Kafka or Schema Registry failures block event-driven integration readiness.
- Application health failures are not hidden behind container-up status.

## Traceability

| Source | Functional design coverage |
|---|---|
| `unit-of-work.md` | U01 responsibilities, boundaries, deployment model, and implementation notes become profiles, commands, and readiness workflows. |
| `unit-of-work-story-map.md` | US-RUN-002 precedes US-RUN-001 and US-SP-001 support is represented through Keycloak/runtime substrate. |
| `requirements.md` | FR-RUN-001 through FR-RUN-006 and NFR-SEC requirements drive local execution, env, auth, and readiness behavior. |
| `components.md` | Local Runtime Platform responsibilities define Compose, databases, Kafka, Schema Registry, Keycloak, reverse proxy, and observability hooks. |
| `component-methods.md` | Runtime methods and service interfaces constrain health, proxy, and configuration expectations. |
| `services.md` | Infrastructure service list and orchestration topology define profile contents. |


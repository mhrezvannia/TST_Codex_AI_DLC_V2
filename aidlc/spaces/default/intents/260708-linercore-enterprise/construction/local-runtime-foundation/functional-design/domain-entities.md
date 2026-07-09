# Domain Entities - local-runtime-foundation

## Source Context

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

`local-runtime-foundation` is an infrastructure unit, so its entities model runtime configuration, profiles, services, health, environment variables, command outcomes, and developer modes. It does not introduce carrier business entities.

## Entity Overview

| Entity | Purpose |
|---|---|
| `RuntimeProfile` | Defines a Compose profile and included services. |
| `RuntimeService` | Represents one local infrastructure, backend, frontend, proxy, or tool service. |
| `RuntimeDependency` | Defines startup/readiness dependency between services. |
| `EnvironmentVariableSpec` | Defines required or optional local configuration. |
| `PortBinding` | Defines host/container port ownership and conflict behavior. |
| `HealthCheck` | Defines readiness probe type and expected result. |
| `RuntimeCommand` | Defines setup/start/stop/reset/logs/health command behavior. |
| `RuntimeStatusSnapshot` | Captures latest profile/service readiness evidence. |
| `IdeModeConfiguration` | Defines one-service or one-frontend host-run mode. |

## Entity Details

### RuntimeProfile

Attributes:

- `profileName`: `core`, `app`, `observability`, `devtools`, or `full`
- `description`
- `includedServices`
- `requiredForFull`
- `startupOrder`
- `readinessPolicy`

Invariants:

- `full` includes all profile groups needed for complete local runtime.
- `core` must be startable without domain service code.
- Profiles must be documented and callable through stable commands.

### RuntimeService

Attributes:

- `serviceName`
- `serviceType`: `database`, `identity`, `broker`, `schema_registry`, `proxy`, `backend`, `frontend`, `observability`, `tool`
- `imageOrBuild`
- `profiles`
- `networkAliases`
- `portBindings`
- `healthChecks`
- `envSpecs`
- `volumes`

Core services:

- PostgreSQL
- Keycloak
- Kafka
- Schema Registry
- nginx or equivalent reverse proxy
- Prometheus
- Grafana
- Jaeger
- OpenTelemetry Collector
- log/search support where adopted

### RuntimeDependency

Attributes:

- `upstreamService`
- `downstreamService`
- `dependencyType`: `startup`, `readiness`, `network`, `auth`, `schema`, `database`
- `blocking`
- `failureMessage`

### EnvironmentVariableSpec

Attributes:

- `name`
- `description`
- `defaultValue`
- `required`
- `secret`
- `localOnly`
- `unsafeOutsideLocal`
- `consumerServices`

Rules:

- Secret values are never committed.
- Unsafe local auth bypass variables must be guarded by local-only mode.

### PortBinding

Attributes:

- `serviceName`
- `hostPort`
- `containerPort`
- `protocol`
- `conflictBehavior`
- `documentation`

### HealthCheck

Attributes:

- `serviceName`
- `checkType`: `container`, `tcp`, `http`, `cli`, `contract_hook`
- `target`
- `timeout`
- `retries`
- `readyState`
- `failureCategory`

Readiness states:

- `not_started`
- `container_started`
- `infrastructure_ready`
- `application_ready`
- `evidence_ready`
- `failed`

### RuntimeCommand

Attributes:

- `commandName`
- `profile`
- `operation`: `setup`, `start`, `stop`, `reset`, `logs`, `health`
- `destructive`
- `preflightChecks`
- `outputFormat`

### RuntimeStatusSnapshot

Attributes:

- `snapshotId`
- `profile`
- `generatedAt`
- `overallStatus`
- `serviceStatuses`
- `blockingFailures`
- `warnings`
- `evidenceLinks`

### IdeModeConfiguration

Attributes:

- `targetService`
- `hostPort`
- `containerDependencies`
- `envOverrides`
- `callbackUrls`
- `proxyOverrides`
- `statusReportingMode`

## Relationships

```text
RuntimeProfile
  |
  +--> RuntimeService
           |
           +--> PortBinding
           +--> EnvironmentVariableSpec
           +--> HealthCheck
           +--> RuntimeDependency

RuntimeCommand --> RuntimeStatusSnapshot
IdeModeConfiguration --> RuntimeService
```

Text fallback: profiles include services; services have ports, env specs, health checks, and dependencies; commands produce status snapshots; IDE mode maps host-run services onto the same runtime.

## Persistence Model

Design-level persistence is file-based:

- Compose YAML files.
- `.env.example`.
- Runtime command scripts.
- Generated status snapshots.
- Logs and health output.
- Optional profile metadata JSON for documentation and UI consumption.

## Traceability

| Source | Entity coverage |
|---|---|
| `unit-of-work.md` | U01 responsibilities become runtime profile, service, env, health, and command entities. |
| `unit-of-work-story-map.md` | US-RUN-001 and US-RUN-002 drive profile and IDE-mode entities; US-SP-001 drives Keycloak support. |
| `requirements.md` | FR-RUN and NFR-SEC requirements drive local runtime, env, auth, and readiness models. |
| `components.md` | Local Runtime Platform and Observability Platform define service categories. |
| `component-methods.md` | Runtime method expectations inform command and health entities. |
| `services.md` | Infrastructure service list defines initial `RuntimeService` inventory. |


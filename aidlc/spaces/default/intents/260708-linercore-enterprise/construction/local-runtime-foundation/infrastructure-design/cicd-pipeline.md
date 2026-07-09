# CI/CD Pipeline - local-runtime-foundation

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

The pipeline validates local runtime definitions and blocks false readiness claims.

## Pipeline Stages

| Stage | Trigger | Gate |
|---|---|---|
| Compose lint | Pull request and main. | Compose files are syntactically valid and profile references resolve. |
| Environment validation | Pull request and local setup. | `.env.example` is secret-free and required variables have safe local defaults. |
| Secret detection | Pull request and main. | Blocks secrets, tokens, and unsafe values in committed config. |
| Profile smoke | CI where Docker is available. | Selected `core` or reduced profile starts and health command reports layered readiness. |
| Auth config check | Pull request and profile smoke. | Keycloak realm/client/callback/JWT settings are deterministic. |
| Port/route check | Pull request and local setup. | Ports and reverse-proxy routes have unique owners. |
| Reset safety check | Pull request. | Reset command is scoped to workspace-owned local volumes and prints affected resources. |
| Evidence publication | Main/release candidate. | Store setup/health/timing reports as internal evidence artifacts. |

## Quality Gates

| Gate | Blocking rule |
|---|---|
| Secret-free config | Fail if committed runtime config contains real credentials or secret-like values. |
| Local-only bypass | Fail if bypass can be enabled without explicit local profile mode. |
| Compose profile integrity | Fail if service dependencies, profiles, networks, volumes, or health checks are inconsistent. |
| Readiness truthfulness | Fail if health output can mark container startup as application or evidence readiness. |
| Reset safety | Fail if reset can delete arbitrary host paths, external volumes, or unspecified resources. |

## Promotion And Rollback

Local runtime changes do not deploy to production. They promote through repository merge only after blocking checks pass. Rollback is normal git revert plus rerunning setup/health to prove the prior Compose/scripts still converge.

## Artifact Management

| Artifact | Retention |
|---|---|
| Compose lint report | CI artifact for pull request and main. |
| Secret scan report | CI security evidence. |
| Setup/health timing report | CI/local readiness evidence. |
| Profile smoke logs | Failure diagnosis evidence. |
| Reset safety report | Review evidence for destructive command behavior. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Enforces setup, health, startup, logs, stop, reset, and benchmark timing checks where practical. |
| `security-design.md` | Implements environment validation, secret scanning, local-only bypass, and auth/JWT checks. |
| `scalability-design.md` | Validates profile growth and route ownership. |
| `reliability-design.md` | Blocks false-green readiness and unsafe reset behavior. |
| `logical-components.md` | Maps pipeline checks to EnvironmentValidator, PortAndRouteRegistry, ProfileOrchestrator, RuntimeHealthCollector, and ResetCoordinator. |
| `components.md` | Supports Local Runtime Platform, Contract Platform hooks, Observability Platform hooks, and Enterprise Web routes. |
| `services.md` | Validates enterprise infrastructure service topology used by backend, frontend, and eventing services. |
| `business-logic-model.md` | Implements setup, start, health, stop, reset, logs, and independent IDE workflows. |

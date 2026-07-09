# Drift Report

## Inputs

This report consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`.

## Drift Summary

Overall drift status: DETECTED.

The intended local runtime inventory differs from actual workstation state. This is environment drift, not application-code drift. The code-level checks for Reference Data UI/BFF, auth guards, contracts, seed dry-run, and readiness scripts passed where prerequisites were available.

## Expected Versus Actual

| Component | Expected state | Actual state | Drift |
| --- | --- | --- | --- |
| Node.js | Available | `v24.18.0` ready | No |
| Yarn | Available | Corepack works; direct `yarn` missing | Yes |
| Java 21 | Available | `java` unavailable | Yes |
| Maven 3.9+ | Available | `mvn` unavailable | Yes |
| Docker Desktop/Compose | Docker daemon available | Docker daemon unavailable | Yes |
| Postgres | Port `5432` listening | Listening | No |
| Keycloak | Port `8080` listening | Not listening | Yes |
| Identity service | Port `8082` listening | Not listening | Yes |
| Reference Data service | Port `8083` listening | Not listening | Yes |
| nginx | Port `8088` listening | Not listening | Yes |
| Kafka | Port `9092` listening | Not listening | Yes |
| Schema Registry | Port `8081` listening | Not listening | Yes |

## Configuration Drift

The Compose and local environment files expect:

- `APP_ENV=local`
- `AUTH_BYPASS=true`
- `REFERENCE_DATA_AUTH_BYPASS=true`
- `IDENTITY_SERVICE_URL=http://localhost:8082`
- `REFERENCE_DATA_SERVICE_URL=http://localhost:8083`

This is acceptable only for the local profile. Auth bypass guard tests confirm bypass is denied outside local/test profiles.

## Operational Drift From Observability

`dashboards` and `alarms` define readiness, BFF, auth bypass, outbox, contracts, and seed signals, but only file-based evidence is available right now. Runtime metrics are missing because the services are not running.

## Remediation Plan

1. Install or expose Java 21.
2. Install or expose Maven 3.9+.
3. Start Docker Desktop and verify the Linux engine.
4. Expose direct `yarn` or update scripts to consistently use Corepack.
5. Build local service and app images.
6. Start Compose dependencies and apps.
7. Re-run readiness, live contracts, seed apply, UI smoke, and load tests.

## Decision

Do not proceed as though the environment is provisioned. Close this drift first, then repeat deployment execution and performance validation with live runtime evidence.

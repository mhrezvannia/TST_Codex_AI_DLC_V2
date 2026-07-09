# Health Check Report

## Inputs

This health report consumes `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`.

## Health Summary

Overall health: BLOCKED

| Check | Status | Detail |
| --- | --- | --- |
| Node | Ready | `v24.18.0` |
| Postgres | Ready | `127.0.0.1:5432` listening |
| Yarn command | Blocked | Direct `yarn` not on PATH; Corepack works |
| Java | Blocked | `java` unavailable |
| Maven | Blocked | `mvn` unavailable |
| Docker | Blocked | Docker Desktop Linux engine unavailable |
| Keycloak | Blocked | `127.0.0.1:8080` not listening |
| Identity service | Blocked | `127.0.0.1:8082` not listening |
| Reference Data service | Blocked | `127.0.0.1:8083` not listening |
| nginx | Blocked | `127.0.0.1:8088` not listening |
| Schema Registry | Blocked | `127.0.0.1:8081` not listening |
| Kafka | Blocked | `127.0.0.1:9092` not listening |

## Required Recovery

1. Install Java 21.
2. Install Maven 3.9+.
3. Start Docker Desktop and verify the Linux engine.
4. Build local service/app images.
5. Start Compose dependencies and app profile.
6. Re-run deployment execution checks.

## Gate Decision

Do not proceed to live deployment smoke until readiness returns `passed`.

# Health Check Report - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`.

## Health Endpoints

| Component | Endpoint | Expected Healthy Response | Current Status |
| --- | --- | --- | --- |
| Backend | `GET /api/charge-agreements/module-info` on `8084` | Module metadata with `serviceName` = `charge-agreement-service` | Not running |
| Frontend | `GET /api/health` on `3002` | Healthy JSON response | Not running |
| Proxy | `GET /charge-agreements/` on proxy port | Charge Agreement workbench page | Not running |

## Dependency Health

No database, Kafka, schema registry, Secrets Manager, Parameter Store, VPC, or external cloud dependency is required by U01. Dependency health is therefore limited to local Java, Maven, Node/Yarn, and process port availability.

## Evidence Used

`build-test-results` provides the current health proxy evidence:

- Backend targeted test passed.
- Frontend typecheck passed.
- Frontend unit test passed.
- Frontend build passed.

## Health Decision

The deployment health state is `ready-not-running`. Live health status must be reclassified after the local runtime is intentionally started and the smoke commands pass.


# Health Check Report - W1-01

## Upstream Inputs

Health checks use `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results` as the deployment and acceptance baseline.

## Current Docker Status

`docker compose ps --services --filter status=running` reported these running services from the existing local stack:

```text
apps-booking
apps-charge-agreements
apps-container-movement
apps-reference-data
booking-service
charge-agreement-service
container-movement-service
identity-service
kafka
keycloak
postgres
reference-data-service
schema-registry
```

## Health Findings

| Check | Status | Notes |
|---|---|---|
| Fresh deployment manifest | BLOCKED | `compose-start` blocked on Docker image pull |
| PostgreSQL host port assertion | PASS | preflight asserts `55432` |
| Real messaging assertion | PASS | preflight asserts `MESSAGING_REQUIRE_REAL=true` |
| Compose descriptor | PASS | `docker compose config --quiet` passed |
| Booking service direct health | PASS | HTTP 200 on `127.0.0.1:8085/actuator/health` |
| Booking app direct page | PASS | HTTP 200 on `127.0.0.1:3001/bookings` |
| nginx Booking path | FAIL | `http://localhost:8088/bookings` probe failed |
| Full live journey | NOT RUN | downstream gates skipped after blocked `compose-start` |

## Release Health Verdict

Release health is BLOCKED.

The current machine has enough running services for direct Booking diagnostics, but it does not have a complete freshly deployed full profile and does not satisfy the nginx user-path smoke gate.

## Required Remediation

1. Restore Docker Desktop HTTPS/proxy access to `docker.elastic.co`, or pre-pull/cache `docker.elastic.co/kibana/kibana:8.16.1` and related observability images.
2. Rerun `node scripts/w1-live-acceptance.mjs --run-id <new-id>`.
3. Confirm the manifest status is `PASS`.
4. Review audit detector LEADS before accepting release completion.

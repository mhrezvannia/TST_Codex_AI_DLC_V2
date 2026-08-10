# Drift Report - W1-01

## Configuration Drift

| Check | Expected | Observed | Status |
|---|---|---|---|
| PostgreSQL host port | `55432` | Preflight PASS | OK |
| Real messaging | `MESSAGING_REQUIRE_REAL=true`; noop rejected | Preflight PASS | OK |
| Compose descriptor | Valid full profile config | `docker compose config --quiet` PASS | OK |
| Observability source config | W1 Booking/CMM/Charge dashboard and scrape config present | `dashboards.md` and source JSON/YAML updated | OK |
| Full observability image access | Docker can pull required images | `deployment-log.md` reports Kibana pull timeout | DRIFT |
| nginx Booking user path | `http://localhost:8088/bookings` passes during live proof | `incident-plan.md` records probe failed after blocked start | DRIFT |
| Performance evidence | `load-test-results.md` should contain measured workloads | Workloads not executed | DRIFT |

## Drift Impact

The active drift is environment/runtime drift, not a known source-code drift in the W1 service implementation. Source-level configuration for dashboards and alarms is present, but the machine cannot prove the full profile until Docker image access to `docker.elastic.co` is restored or the required images are cached.

## Required Correction

1. Restore Docker Desktop registry access or cache `docker.elastic.co/kibana/kibana:8.16.1` and any remaining observability images.
2. Start a new live acceptance run ID.
3. Require PASS manifest before clearing drift.
4. Update `load-test-results.md` and `slo-report.md` with measured values only after the PASS run.

## Source Coverage

This drift report consumes `dashboards.md`, `alarms.md`, `slo-config.md`, `deployment-log.md`, `load-test-results.md`, and `incident-plan.md`.

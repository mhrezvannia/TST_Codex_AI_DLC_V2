# Health Check Report - W2-01 App Shell and Auth

## Upstream Inputs

This health-check report consumes `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`.

## Health Check Summary

| Component | Expected check | Status | Detail |
| --- | --- | --- | --- |
| Nginx | `GET http://127.0.0.1:8088/health` | PASS | HTTP 200 |
| `apps-shell` | Protected shell route through Nginx | PASS | Browser acceptance reached mounted Booking routes |
| `apps-auth` and Keycloak | Login/session/sign-out | PASS | Real OIDC subjects and role claim observed; stale call returned 401 |
| `apps-booking` and `booking-service` | Booking lifecycle | PASS | Create, validate, price, and confirm completed with matching audit subject |
| `identity-service` | Allow and deny decisions | PASS | Booking user allowed; reference admin denied inside shell |
| PostgreSQL | Existing persistence and restart | PASS | Existing volumes preserved; Charge schema restart defect fixed and verified |
| Elasticsearch | `GET :9200/_cluster/health` | PASS | Green, one node, official 8.16.1 image |
| Kibana | `GET :15601/api/status` | PASS | Available, official 8.16.1 image |
| Prometheus/Grafana/Jaeger | Readiness endpoints | PASS | HTTP 200 on 9090, 3003, and 16686 |
| OTel Collector | Container state/log | PASS | Running on 0.114.0 after `debug` exporter migration |
| Application metric targets | Prometheus target health | BLOCKED | Seven targets down: JSON health is not Prometheus text; Spring metrics endpoints return 404 |

## Readiness Criteria

W2-01 local release acceptance now satisfies:

1. `erp-fidelity-audit` and `aidlc-audit` execute under Git Bash and exit `0`.
2. The regenerated manifest truthfully sets `finalDecision=PASS` and passes `--require-pass` validation.
3. The explicit W1 waiver remains BLOCKED at compose-start and is not reused as W2 evidence.

Application metrics, traces, and log shipping still need wiring before any production observability claim.

## Result

Runtime health, W2 browser scenarios, detector 6d, and both required audits PASS. W2-01 local release acceptance is PASS. Observability infrastructure health does not imply application telemetry coverage.

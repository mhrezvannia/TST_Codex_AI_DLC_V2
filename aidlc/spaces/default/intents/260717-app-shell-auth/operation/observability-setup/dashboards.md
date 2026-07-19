# Dashboards - W2-01 App Shell and Auth

## Upstream Inputs

This dashboard plan consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Dashboard Layout

| Row | Panels | Source |
| --- | --- | --- |
| Edge and shell | Nginx `/`, `/booking*`, `/bookings*` request count, p95 latency, 4xx/5xx | Nginx logs/metrics from `monitoring-design` |
| Auth and session | Login redirects, callback status, sign-out status, expired-session redirects | `apps-auth`, Keycloak, shell session guard |
| Booking actor path | Booking list/create/detail calls, actor-present rate, `local-user` count | `apps-shell`, `apps-booking`, booking-service |
| Authorization | identity-service authorize allow/deny/error/timeout counts | booking-service and identity-service |
| Evidence package | `manifest.finalDecision`, scenario PASS/BLOCKED counts, detector/audit statuses | `artifacts/w2-01-live/app-shell-auth/` |
| Runtime dependencies | PostgreSQL, Keycloak, booking-service, identity-service, observability services health | `infrastructure-services` full Compose profile |

## Runtime Verification

Grafana 11.4.0 and Prometheus 2.55.1 are running and their readiness endpoints return HTTP 200. The existing Shared Platform overview dashboard is provisioned, but no W2-specific panel set is claimed live because all seven configured application scrape targets are down. Frontend targets expose JSON health rather than Prometheus text, and Spring targets return 404 from `/actuator/prometheus`.

## Delivery Status

The dashboard layout above is the accepted W2 target. Base dashboard infrastructure is deployed; W2 application panels remain BLOCKED on metrics instrumentation and corrected scrape endpoints.

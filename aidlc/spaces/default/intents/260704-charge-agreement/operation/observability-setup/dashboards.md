# Dashboards - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Local Readiness Dashboard

| Panel | Signal | Source | Target |
| --- | --- | --- | --- |
| Backend health | HTTP status and latency | `GET http://127.0.0.1:8084/actuator/health` | 2xx within 2 seconds |
| Backend module-info | HTTP status, latency, expected service name | `GET http://127.0.0.1:8084/api/charge-agreements/module-info` | 2xx within 2 seconds |
| Frontend health | HTTP status and latency | `GET http://127.0.0.1:3002/api/health` | 2xx within 2 seconds |
| Proxy route | HTTP status and page reachability | `GET http://127.0.0.1:3001/charge-agreements/` | 2xx/3xx within 3 seconds |
| Build evidence | Latest package checks | `build-test-results` | All pass |

## Security View

The dashboard must not display secrets or sensitive customer agreement data. This follows `security-design`, which limits module-info to non-sensitive metadata and treats local auth bypass as a visible development-only state.

## Status

No live dashboard process or CloudWatch dashboard is provisioned for U01. This dashboard definition becomes executable when local runtime smoke is re-enabled.


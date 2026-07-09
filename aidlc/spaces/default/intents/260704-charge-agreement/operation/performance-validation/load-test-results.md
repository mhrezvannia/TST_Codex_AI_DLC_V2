# Load Test Results - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `performance-requirements`, `scalability-requirements`, `performance-design`, `scalability-design`, and `dashboards`.

## Result Summary

| Test | Result | Reason |
| --- | --- | --- |
| Backend health latency | Not run | Backend local server intentionally stopped |
| Module-info latency | Not run | Backend local server intentionally stopped |
| Frontend shell readiness | Not run | Frontend local server intentionally stopped |
| Proxy route readiness | Not run | Reverse proxy intentionally stopped |
| Build/test readiness | Pass | Prior construction `build-test-results` passed |

## Evidence Position

No live performance measurement is claimed. The current validated evidence is build/test readiness, not runtime latency. This aligns with the stopped-localhost instruction and avoids false performance claims.

## Follow-Up Execution

When the project is started locally again, run the load-test plan and record:

- P50/P95/P99 for backend health.
- P50/P95/P99 for module-info.
- Frontend health response latency.
- Proxy route response latency.
- Any startup or port conflict failures.


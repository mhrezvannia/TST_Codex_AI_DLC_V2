# Load Test Plan - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `performance-requirements`, `scalability-requirements`, `performance-design`, `scalability-design`, and `dashboards`.

## Scope

The U01 walking skeleton has no data workload and no downstream dependencies. The plan validates readiness latency and stateless runtime behavior only.

## Test Scenarios

| Scenario | Endpoint / Action | Target |
| --- | --- | --- |
| Backend health latency | `GET http://127.0.0.1:8084/actuator/health` | Under 200 ms locally |
| Module-info latency | `GET http://127.0.0.1:8084/api/charge-agreements/module-info` | Under 200 ms locally |
| Frontend shell readiness | `GET http://127.0.0.1:3002/api/health` and page load | Does not depend on reference-data or identity |
| Proxy route readiness | `GET http://127.0.0.1:3001/charge-agreements/` | Reachable under dashboard threshold |

## Execution Method

Use a bounded local smoke script with repeated requests after the local runtime is intentionally started. Suggested minimum:

```powershell
1..10 | ForEach-Object { Measure-Command { Invoke-RestMethod http://127.0.0.1:8084/api/charge-agreements/module-info | Out-Null } }
```

Do not run production-style load tests for U01. Load and capacity testing should start after U05 REST/API behavior and U04 persistence exist.

## Pass Criteria

- Backend health and module-info stay under the `performance-requirements` 200 ms local target.
- UI shell remains independent of reference-data and identity service availability per `performance-design`.
- Statelessness from `scalability-design` remains intact.
- Dashboard smoke thresholds remain green.


# SLO Config - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## SLIs

| SLI | Measurement | Source |
| --- | --- | --- |
| Backend readiness availability | Percentage of local smoke runs where backend health and module-info return 2xx | Smoke evidence |
| Backend readiness latency | P95 latency for backend health and module-info during local smoke | Smoke evidence |
| Frontend readiness availability | Percentage of local smoke runs where frontend health returns 2xx | Smoke evidence |
| Proxy readiness availability | Percentage of local smoke runs where `/charge-agreements/` is reachable | Smoke evidence |
| Sensitive metadata correctness | Percentage of module-info responses with no sensitive fields | Smoke evidence and review |

## SLOs

| SLO | Target | Window |
| --- | --- | --- |
| Local smoke readiness | 100% pass before promotion | Per validation run |
| Backend smoke latency | P95 under 2 seconds | Per validation run |
| Frontend smoke latency | P95 under 2 seconds | Per validation run |
| Proxy route latency | P95 under 3 seconds | Per validation run |
| Sensitive metadata exposure | 0 violations | Per validation run |

## Error Budget Policy

Any local smoke failure consumes the entire walking-skeleton error budget for that validation run. Promotion is blocked until the failure is fixed and the smoke run passes.


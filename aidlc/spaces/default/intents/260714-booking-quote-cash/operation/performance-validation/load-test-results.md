# Load Test Results - W1-01

## Execution Summary

| Check | Command | Result |
|---|---|---|
| Acceptance dry run | `node scripts/w1-live-acceptance.mjs --dry-run --run-id performance-validation-dry-run` | PLANNED |
| Preflight | `node scripts/w1-live-acceptance.mjs --preflight` | PASS |
| Compose descriptor | `docker compose config --quiet` | PASS |
| Fresh live acceptance | `node scripts/w1-live-acceptance.mjs --run-id operation-deployment-execution` | BLOCKED at `compose-start` |

## Runtime Result

Performance workloads were not executed in this stage because the latest fresh full-stack deployment remains blocked before the live harness can start the complete Compose profile. The blocking evidence is retained in `artifacts/w1-01-live/operation-deployment-execution/` and documents the Docker pull failure for `docker.elastic.co/kibana/kibana:8.16.1`.

Direct Booking diagnostics from `deployment-execution` are not performance evidence. They show partial stack health only and do not replace the nginx user path or the full workload gates.

## Measured Results

| Workload | Target | Actual | Status | Evidence |
|---|---|---|---|---|
| Charge pricing | 1,000 measured, concurrency 10, p99 <=800 ms | Not executed | BLOCKED | Fresh full stack did not reach workload phase |
| Booking to CMM returned status | 100 measured, concurrency 5, p95 <=5 s | Not executed | BLOCKED | Fresh full stack did not reach workload phase |
| Lag and saturation | lag zero <=30 s, pool wait p95 <100 ms, RSS <=768 MiB | Not executed | BLOCKED | Fresh full stack did not reach workload phase |

## Source Coverage

The results compare against `performance-requirements.md` and `scalability-requirements.md`, preserve the execution model from `performance-design.md` and `scalability-design.md`, and rely on `dashboards.md` for the intended observability surfaces once the full profile starts.

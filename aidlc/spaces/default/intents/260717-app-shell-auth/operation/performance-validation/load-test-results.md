# Load Test Results - W2-01 App Shell and Auth

## Upstream Inputs And Evidence

These results validate the local targets in per-unit `performance-requirements` using the seams defined by `performance-design`. They preserve the single-user limits in `scalability-requirements` and `scalability-design`. The operation `dashboards` artifact is not used as a measurement source because its application targets remain down.

Evidence root: `artifacts/w2-01-performance/`. `summary.json` contains aggregate results and each `run-01` through `run-10` directory contains the complete browser evidence for one sample. One separate `warmup` run passed and is excluded from percentiles.

## Execution Result

| Item | Result |
| --- | --- |
| Overall status | PASS |
| Measured runs | 10 |
| Semantically passing runs | 10 |
| Completion rate | 100% |
| Missing timing samples | 0 |
| Measured-run duration sum | 141010.26 ms |
| Observed sequential completion rate | 0.0709 full journeys/second; 4.26/minute |
| Full-journey p50 | 14330.82 ms |
| Full-journey p95/max | 16873.83 ms |

The observed completion rate is descriptive only. It includes launching a fresh browser process per run, two OIDC sessions, asynchronous Booking lifecycle work, evidence queries, and screenshots; it is not a throughput gate.

## Latency Results

| Seam | Samples | Target p95 | p50 | p95 | Max | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Authenticated Booking read | 10 | 3000 ms | 112.56 ms | 454.24 ms | 454.24 ms | PASS |
| Booking create | 10 | 5000 ms | 224.48 ms | 608.48 ms | 608.48 ms | PASS |
| Created Booking detail ready | 10 | 3000 ms | 14.75 ms | 39.69 ms | 39.69 ms | PASS |
| Authenticated deny render | 10 | 3000 ms | 131.12 ms | 579.98 ms | 579.98 ms | PASS |
| Sign-out | 10 | 3000 ms | 433.71 ms | 669.90 ms | 669.90 ms | PASS |
| Post-sign-out route guard | 10 | 3000 ms | 253.12 ms | 441.54 ms | 441.54 ms | PASS |
| Stale BFF fail-closed | 10 | 1000 ms | 26.79 ms | 228.98 ms | 228.98 ms | PASS |
| `/bookings` redirect | 10 | 1000 ms | 81.29 ms | 173.13 ms | 173.13 ms | PASS |
| `/bookings/new` redirect | 10 | 1000 ms | 15.59 ms | 41.64 ms | 41.64 ms | PASS |
| `/bookings/{id}` redirect | 10 | 1000 ms | 33.99 ms | 168.76 ms | 168.76 ms | PASS |

## Bottleneck Findings

- No directly gated seam is close to its local limit. The highest observed gated p95 is sign-out at 669.90 ms against 3000 ms.
- The full journey is dominated by browser process startup, two OIDC login flows, asynchronous validate/price/confirm work, screenshots, and audit evidence queries. The raw allowed-journey lifecycle p95 is 4097.54 ms, but no Construction target exists for that combined lifecycle.
- Compatibility redirects are lightweight and do not duplicate canonical Booking data loading before redirect.
- The 2500 ms BFF abort remains present in `proxyBooking`; stale-call p95 of 228.98 ms confirms the missing-session guard returns well before that external-fetch bound.
- No CPU, memory, pool, PostgreSQL, Identity, Charge, or Nginx saturation conclusion is possible. The missing application metric targets and spans in `dashboards` prevent resource attribution.

## Scalability And Capacity Result

Autoscaling validation is NOT APPLICABLE because W2-01 provisions no autoscaling policy, replica controller, cloud load balancer, or production traffic profile. Concurrent-user capacity is NOT VALIDATED. Before production capacity planning, instrument application metrics/traces, define a production workload and data model, set throughput/concurrency targets, and execute staged concurrency tests in a production-like environment.

## Integrity Notes

Every measured run retained all four scenario PASS outcomes. No performance workaround bypassed OIDC, Identity authorization, actor propagation, route compatibility, or the W1-01 waiver. W1 remains explicitly waived/BLOCKED at compose-start and is not a performance PASS.

# Load Test Plan - W2-01 App Shell and Auth

## Upstream Inputs And Scope

This plan consumes per-unit `performance-requirements`, `scalability-requirements`, `performance-design`, `scalability-design`, and the operation `dashboards` artifact. Those inputs define local single-user p95 targets and explicitly defer production concurrency, throughput, autoscaling, and capacity claims.

The test executes against the running `linercore-w2-01` local Compose/Nginx stack at `http://127.0.0.1:8088`. It does not represent a production-like environment. The `dashboards` artifact records that application Prometheus targets, application traces, and log ingestion are not live, so timings come from monotonic Playwright/Node measurements at the browser/request seams rather than dashboard percentiles or trace spans.

## Workload

1. Run one excluded warm-up journey to verify readiness and remove first-container/browser cold-start effects.
2. Run ten measured journeys sequentially. Each journey uses fresh browser contexts and performs:
   - OIDC login as `local.booking.user`.
   - Warm authenticated `/booking` read.
   - Booking create and created-detail render.
   - Validate, price, and confirm using the approved deterministic Charge agreement.
   - Three `/bookings*` compatibility redirects.
   - Sign-out, stale BFF call, and post-sign-out protected-route check.
   - OIDC login as `local.reference.admin` and authenticated deny render.
3. Preserve semantic correctness: every measured run must pass all four live acceptance scenarios and retain the real actor.
4. Preserve volumes and prior work. The workload creates test Bookings through the real API and does not delete data or alter W1 waiver evidence.

Command:

```powershell
node scripts/w2-01-performance-validation.mjs --iterations 10 --output-root artifacts/w2-01-performance --compose-project linercore-w2-01
```

## Metrics And Gates

| Metric | Existing target | Source |
| --- | --- | --- |
| Authenticated Booking read | p95 <= 3000 ms | U01 `performance-requirements` and `performance-design` |
| Booking create | p95 <= 5000 ms | U02 inputs |
| Created Booking detail ready | p95 <= 3000 ms | U02 inputs |
| Authenticated deny render | p95 <= 3000 ms | U03 inputs |
| Sign-out | p95 <= 3000 ms | U04 inputs |
| Post-sign-out protected-route guard | p95 <= 3000 ms | U04 inputs |
| Stale BFF fail-closed response | p95 <= 1000 ms | U04 inputs |
| Each compatibility redirect | p95 <= 1000 ms | U05 inputs |

For ten samples, p50 and p95 use the nearest-rank method. The p95 rank is sample ten, so it is conservatively the maximum observed value. No p99 gate is calculated from this sample size. A metric is PASS only when all ten samples exist and p95 is within the existing target. Overall PASS also requires ten of ten semantically correct journeys.

## Throughput And Scalability Boundaries

There is no throughput acceptance target. The runner reports only observed sequential completion rate and full-journey duration. It does not validate concurrent users, saturation, horizontal scaling, load balancing, queue behavior, or autoscaling because `scalability-requirements` and `scalability-design` add none of those mechanisms for W2-01.

## Bottleneck Analysis

Analyze edge/shell navigation, OIDC/session transitions, Identity authorization, Booking persistence/lifecycle, Charge pricing, PostgreSQL access, and route compatibility. Compare direct seam timings and full-journey duration. Resource saturation and cross-service attribution remain blocked until the `dashboards` telemetry gaps are fixed.

## Stop Conditions

Stop and mark BLOCKED on any scenario failure, actor mismatch, `local-user`, timeout, missing timing, p95 breach, secret leakage, runtime instability, or evidence inconsistency. Do not weaken auth/authorization or increase a target during the run.

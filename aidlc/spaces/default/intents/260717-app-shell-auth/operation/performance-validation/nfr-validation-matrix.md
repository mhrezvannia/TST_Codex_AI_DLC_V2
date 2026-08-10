# NFR Validation Matrix - W2-01 App Shell and Auth

## Upstream Inputs

This matrix evaluates per-unit `performance-requirements`, `scalability-requirements`, `performance-design`, and `scalability-design` against the direct evidence produced by the local test. It also records the measurement limits from the operation `dashboards` artifact.

## Performance Validation

| Unit / requirement | Target or invariant | Actual evidence | Status |
| --- | --- | --- | --- |
| U01 PERF-01/02 | Protected/authenticated shell and Booking read p95 <= 3000 ms | Booking read p95 454.24 ms; 10/10 scenario runs PASS | PASS |
| U01 PERF-03 | Booking BFF timeout <= 2500 ms | `proxyBooking` uses a 2500 ms abort; fail-closed path remains tested | PASS |
| U01 PERF-04 | No broad client state/styling dependency expansion | Existing focused quality gates and dependency review remain green | PASS |
| U02 PERF-01 | Booking create p95 <= 5000 ms | p95 608.48 ms | PASS |
| U02 PERF-02 | Created detail p95 <= 3000 ms | p95 39.69 ms | PASS |
| U02 PERF-03/04 | Bounded Identity call; preserve payload/idempotency guards | 10/10 authorized lifecycles PASS; existing timeout/guard tests remain green | PASS |
| U03 PERF-01 | Authenticated deny p95 <= 3000 ms | p95 579.98 ms | PASS |
| U03 PERF-02/03 | Bounded deny; no repeated polling/retry | 10/10 deny journeys PASS with one controlled render | PASS |
| U04 PERF-01 | Sign-out p95 <= 3000 ms | p95 669.90 ms | PASS |
| U04 PERF-02 | Post-sign-out route check p95 <= 3000 ms | p95 441.54 ms | PASS |
| U04 PERF-03 | Stale BFF call p95 <= 1000 ms | p95 228.98 ms | PASS |
| U04 PERF-04 | No post-sign-out polling/retry | Ten runs complete with controlled reauthentication and no retry loop | PASS |
| U05 PERF-01 | Each compatibility redirect p95 <= 1000 ms | Worst p95 173.13 ms | PASS |
| U05 PERF-02 | Canonical route retains U01/U02 timing | Booking read/create/detail all PASS after compatibility proof | PASS |
| U05 PERF-03 | Deterministic preservation evidence | Existing W2 package and focused checks remain deterministic | PASS |
| U06 PERF-01/02 | Scenario/command status and timing evidence retained | Per-run evidence carries scenario timings; W2 manifest command evidence remains PASS | PASS |
| U06 PERF-03 | No invented production SLO | Results are explicitly local and single-user | PASS |

## Scalability Validation

| Requirement group | Expected design | Evidence | Status |
| --- | --- | --- | --- |
| Request-scoped shell/BFF state | No shared mutable actor/session cache | Existing implementation and ten isolated contexts preserve real subjects | PASS |
| No unbounded reload/polling | One canonical load/action flow | Browser journeys complete without repeated client polling loops | PASS |
| Compatibility load | Redirect before canonical data load | All redirects PASS; no duplicate pre-redirect Booking load is claimed | PASS |
| Production concurrency | Deferred by `scalability-requirements` | No production traffic profile or concurrency target exists | NOT VALIDATED |
| Horizontal scaling | Preserve future feasibility; no new mechanism | Request-scoped design preserved; multiple replicas not exercised | NOT VALIDATED |
| Autoscaling | No W2 autoscaling resource | No policy exists to test | NOT APPLICABLE |
| Production capacity | Requires telemetry and workload model | App Prometheus targets/traces remain unavailable per `dashboards` | BLOCKED |

## Overall Decision

Local W2-01 performance validation is PASS: ten of ten warm sequential journeys and every defined p95 seam meet the existing Construction targets. Production concurrency, autoscaling, saturation, and capacity remain unvalidated and must not be inferred from this result.

## Follow-Up Gate

Before any production performance claim: fix application metrics/traces/log ingestion, define production p50/p95/p99 and throughput/concurrency targets, provide representative data and topology, then run staged concurrency, soak, failure, and scaling tests. Preserve OIDC, Identity authorization, real actors, and W1 waiver integrity throughout those tests.

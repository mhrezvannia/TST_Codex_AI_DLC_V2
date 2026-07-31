# W2-03 Load Test Results

## Outcome and upstream basis

Overall result: **BLOCKED - NOT EXECUTED**.

These results consume `performance-requirements`, `scalability-requirements`,
`performance-design`, `scalability-design`, and `dashboards`. No measured
performance run occurred because Deployment Execution stopped before mutation
and the dashboards remain uninstalled/unobserved.

No latency, throughput, error-rate, resource, capacity, bottleneck, soak,
stress, or auto-scaling PASS is claimed.

## Execution record

| Field | Actual |
|---|---|
| Candidate | none deployed |
| Environment | no active verified `linercore-wave-a` candidate |
| Edge | not exercised |
| Test start/end | not run |
| Host/runtime metadata | not captured for a load run |
| Fixture cardinality | not seeded/verified live |
| Concurrency | not started |
| Warm-up | not started |
| Raw samples | none |
| Prometheus/Grafana | configuration only; not observed |
| OpenTelemetry/Jaeger | configuration only; not observed |
| Manager guard | not rerun for a performance mutation because no mutation was attempted |

## Blocking prerequisites

- candidate frontend Vitest and production build cannot spawn the required
  process;
- Booking Maven cannot resolve the approved Resilience4j dependency from the
  available offline cache;
- Docker/default-manager guard capability and isolated candidate readiness are
  not established;
- the locked native evidence writer cannot commit required records;
- live PostgreSQL/restore, browser, performance, security, coverage, and final
  audit evidence are not PASS;
- required dashboard metrics and traces are not installed or observed.

These are capability/environment blockers. They are not measured threshold
failures.

## Target-versus-actual summary

| Area | Target | Actual | Status |
|---|---|---|---|
| Rate reads/mutations | p95 <=500/750 ms | not measured | BLOCKED |
| BFF overhead | p95 <=100 ms; p99 <=200 ms | not measured | BLOCKED |
| Agreement reads/commands | p95 <=750/1,000 ms | not measured | BLOCKED |
| Pricing scenarios | p99 <=800 ms | not measured | BLOCKED |
| Booking capture/completion/history | p95 <=500/750 ms | not measured | BLOCKED |
| Booking fresh end-to-end | p99 <=1,500 ms | not measured | BLOCKED |
| Readiness | <=120 s service; <=10 min aggregate | not measured | BLOCKED |
| Large-fixture boundedness | all approved fixture cardinalities | not measured | BLOCKED |
| Contention/recovery | exact winners, no deadlock/pool timeout | not measured | BLOCKED |
| Resource stability | three-cycle heap/RSS and leak gates | not measured | BLOCKED |

## Throughput and errors

Measured requests: **0**.  
Measured duration: **0 - run not started**.  
Achieved throughput: **NOT MEASURED**.  
Unexpected error rate: **NOT MEASURED**.

Build/test execution times and evaluator counts are excluded because they are
not authenticated live request samples.

## Bottleneck analysis

No bottleneck was observed. The following remain hypotheses for the next run:

- Charge/Agreement query shape or N+1 at large history cardinality;
- PostgreSQL pool/lock contention under independent and same-key work;
- Reference fan-out/BFF/client permit saturation;
- pricing selection and manual-case indexed-query behavior;
- Booking receipt/snapshot/history and retry/circuit resource release;
- evidence-writer, disk, trace, heap/RSS, socket/thread, or retained-body
  pressure.

Ranking or recommending infrastructure changes without measured telemetry would
be speculative.

## Capacity and scaling

Current local capacity: **UNMEASURED**.  
Production capacity forecast: **NOT AUTHORIZED**.  
Auto-scaling validation: **NOT APPLICABLE - NO SCALING TOPOLOGY**.  
Stress/spike/soak result: **NOT RUN**.

The fixed local fixtures and ten-client workloads are acceptance boundaries,
not production forecasts.

## Re-run criteria

Re-run the full plan from preflight after:

1. all deployment prerequisites and candidate builds pass;
2. the exact isolated stack is deployed and semantically ready;
3. the locked writer and required browser/database capabilities pass;
4. dashboards/metrics/traces are installed and label/redaction contracts pass;
5. exact fixtures and test identities are available;
6. a release reviewer approves the window.

Do not resume midway or reuse stale warm-up, sample, fixture, or dashboard
evidence.


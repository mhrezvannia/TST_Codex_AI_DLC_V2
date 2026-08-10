# W2-03 Anomaly Detection Configuration

## Status and upstream basis

Status: **DETERMINISTIC RULES DEFINED; LEARNED BASELINES DISABLED**.

The anomaly posture consolidates `performance-design`, `security-design`,
`reliability-design`, `monitoring-design`, and `infrastructure-services`.
There is no deployed candidate, continuous telemetry history, or representative
production baseline. CloudWatch anomaly detection and other ML detectors are
therefore not configured. Static acceptance gates remain authoritative.

## Deterministic detectors

| ID | Signal | Detection rule | Result |
|---|---|---|---|
| `ANOM-TERMINAL-MIX` | pricing terminal distribution | observed required outcomes/counts differ from manifest | FAIL |
| `ANOM-NO-RATE` | no-rate consistency | manual terminal lacks exactly one persisted/reused case | FAIL |
| `ANOM-REPLAY` | receipt/replay | replay changes canonical result or produces extra provider call/write | FAIL |
| `ANOM-BFF-DELTA` | BFF overhead | missing/duplicate child, correlation mismatch, clock mismatch, or negative delta | FAIL |
| `ANOM-POOL` | datasource/client pool | acquisition >2 s, leaked permit, unbounded pending work, or limit exceeded | FAIL |
| `ANOM-LOCK` | database | any deadlock or unexpected lock-timeout under accepted workload | FAIL |
| `ANOM-QUERY` | query behavior | query count/plan differs from approved bounded shape or N+1 appears | FAIL |
| `ANOM-READINESS` | startup/restart | service >120 s or aggregate >10 min | FAIL |
| `ANOM-MANAGER` | protected manager | before/after fingerprint or semantic probe differs | P1 FAIL |
| `ANOM-DISCLOSURE` | evidence | prohibited content detected in logs/traces/screenshots/reports | P1 BLOCKED/FAIL |
| `ANOM-EVIDENCE` | ledger | missing, duplicate, dangling, corrupt, or hash-invalid record | BLOCKED |

## Latency drift detectors

During a valid acceptance run, annotate early warnings at 90% of each final
threshold after at least half the required population:

| Journey | Warning | Final |
|---|---:|---:|
| Rate read p95 | 450 ms | 500 ms |
| Rate mutation p95 | 675 ms | 750 ms |
| Agreement read p95 | 675 ms | 750 ms |
| Agreement command p95 | 900 ms | 1,000 ms |
| Pricing p99 | 720 ms | 800 ms |
| Manual read p95 | 675 ms | 750 ms |
| BFF overhead p95/p99 | 90/180 ms | 100/200 ms |
| Booking capture p95 | 450 ms | 500 ms |
| Booking completion/detail p95 | 675 ms | 750 ms |
| Booking fresh journey p99 | 1,350 ms | 1,500 ms |

Warnings do not change the final verdict and cannot compensate for missing raw
samples.

## Resource drift detectors

Capture three identical post-warm-up cycles. For heap and RSS:

```text
cycle_2 <= max(1.20 * cycle_1, cycle_1 + 32 MiB)
cycle_3 <= max(1.20 * cycle_1, cycle_1 + 32 MiB)
growth(cycle_1 -> cycle_2) <= 5%
growth(cycle_2 -> cycle_3) <= 5%
```

An OOM, process restart, deadlock, pool timeout, full-history load, retained
socket/body/permit, or monotonic growth beyond these bounds fails the resource
gate. Also capture GC, CPU within the declared one-core container limit,
Hikari/client occupancy, PostgreSQL locks, query plans, artifact bytes, and
trace caps.

## Learned anomaly admission

A learned or seasonal detector may be proposed only after:

1. a production-like environment and stable metric schema exist;
2. at least two to four weeks of representative telemetry are available;
3. deployments, tests, incidents, and planned load are annotated;
4. the service owner approves false-positive and false-negative tolerance;
5. the detector is shadowed against static gates before alerting;
6. cardinality, privacy, retention, and cost are approved.

Initial candidates would be latency, error rate, terminal-outcome mix, manual
fallback rate, retry/circuit rate, pool pressure, and resource drift. No
standard-deviation band is selected without a baseline.

## Evaluation and routing

- Static P1/P2 conditions write to the bounded evidence ledger.
- Early drift creates a P3 dashboard annotation.
- No external notification or automated remediation is enabled.
- An anomaly may diagnose a failure but may not authorize, mutate, reset
  outbox/receipt state, suppress required evidence, or redefine a typed
  business outcome.

Current evaluation: **NOT RUN - NO DEPLOYED CANDIDATE**.


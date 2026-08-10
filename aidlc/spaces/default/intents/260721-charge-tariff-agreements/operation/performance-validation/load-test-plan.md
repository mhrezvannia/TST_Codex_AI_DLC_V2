# W2-03 Load and Performance Test Plan

## Status and upstream basis

Status: **EXECUTABLE PLAN DEFINED; EXECUTION BLOCKED**.

This plan consumes every Unit's `performance-requirements`,
`scalability-requirements`, `performance-design`, and `scalability-design`,
plus the approved `dashboards`. It preserves the exact local acceptance
contracts rather than inventing production traffic, CloudWatch/X-Ray evidence,
auto-scaling, or a generic load profile.

## Entry criteria

All must be PASS before load begins:

1. immutable candidate identity and complete build/test release gates;
2. `npm run demo:guard` before mutation;
3. exact `linercore-wave-a` rendered config, loopback edge 18088, and no
   manager port 8088 exposure;
4. Docker/wrapper, database backup/restore, browser, and locked native
   evidence-writer capabilities;
5. authenticated readiness for every required service;
6. Prometheus/Grafana metric names and bounded labels verified;
7. safe OpenTelemetry/Jaeger trace linkage available where decomposition is
   required;
8. exact large fixtures seeded with isolated run namespaces;
9. sufficient disk, CPU/RAM, and bounded log/trace/sample capacity;
10. release reviewer approves the performance window.

Any missing required capability is `BLOCKED`. Do not fall back to manager
ports, direct service ports, mocks, unit timing, alternate Compose projects, or
an unlocked evidence writer.

## Environment and fixtures

| Domain | Required local fixture |
|---|---|
| Rate | 10,000 Rates and 50,000 RateVersions |
| Agreement | 10,000 Agreements, 50,000 versions, 150,000 exact links |
| Pricing | at least 100,000 terminal receipts and 10,000 OPEN manual cases |
| Booking | 10,000 Bookings, 50 typed snapshots for each of 1,000 deep-history Bookings, 100,000 PRICE receipts |
| Clients | exactly 10 concurrent clients for measured administrative/pricing workloads |
| Isolation | unique run, fixture, request, receipt, correlation, and sample identities; no fresh-sample replay |

Record commit, candidate/image/config hashes, host OS/CPU/RAM, Java/Node/
PostgreSQL versions, Compose project/network/containers, seed, fixture counts,
warm-up counts, concurrency, and clock source.

## Measurement rules

- Measure at the authenticated edge with monotonic start/end timestamps.
- Discard only the declared warm-up population; never discard a measured slow
  or unexpected result.
- Compute nearest-rank p50/p95/p99/max from raw JSONL/CSV.
- Report sample count, elapsed test duration, achieved requests/second,
  expected/unexpected outcome counts, and bytes.
- Keep component spans diagnostic. Direct command-to-serialized-response
  samples decide end-to-end objectives.
- Separate healthy percentiles from explicit dependency-fault ceilings.
- Stream samples incrementally through the locked ordered writer; one worker
  failure is retained and cannot be silently retried into green.

## Ordered workload

### Phase 0 - safety, readiness, and warm-up

1. Run manager/sibling guards and exact config checks.
2. Start only the approved candidate through the wrapper.
3. Enforce <=10-minute aggregate readiness and <=120-second service semantic
   readiness.
4. Verify fixture cardinality and observability panels.
5. Execute the declared 20 discarded warm-up calls per operation/route in a
   namespace excluded from measured identities.

### Phase 1 - U01 Rate authority

| Test | Population | Gate |
|---|---|---|
| Rate reads | 50 list + 50 detail, 10 clients | each and aggregate p95 <=500 ms |
| Rate mutations | 25 each create/edit/approve/successor, 10 clients | each and aggregate p95 <=750 ms |
| bounded query | full 10k/50k fixture and bounded page/filter mix | no full history or N+1; bounded rows/heap |
| reference fault | healthy provider plus explicit two-second timeout | healthy mutation target; timeout typed 503/no write |
| contention | 20 independent approvals and >=20 fresh same-key approval/successor rounds across two contexts | exact winners/losers/activity; no deadlock/pool timeout |

### Phase 2 - U02 BFF and routing

| Test | Population | Gate |
|---|---|---|
| read forwarding | 25 each Rate list/detail and Agreement list/detail | each/aggregate overhead p95 <=100 ms, p99 <=200 ms |
| mutation forwarding | 10 calls for each of ten policies, 100 total | each/aggregate overhead p95 <=100 ms, p99 <=200 ms |
| route/assets/health | >=100 each root 308, deep link, asset, health | zero routing/schema failures |
| bounded transport | 32 KiB request, 512 KiB response, limit+1/slow stream | early rejection; no retained request/socket growth |
| two-process statelessness | alternate approved read and deliberate mutation contexts | identical auth/policy/correlation/key behavior |

### Phase 3 - U03 Agreement authority

| Test | Population | Gate |
|---|---|---|
| vendor reads | 50 list + 50 detail | each/aggregate p95 <=750 ms |
| W2 mutations | 20 each create/edit/approve/successor/suspend/expire, 120 total | each/aggregate p95 <=1,000 ms |
| legacy compatibility | fixed 100-call search/detail/active mix | zero drift; report percentiles without inventing SLO |
| contention | 20 independent approvals and >=20 fresh same-key approval/successor/terminal races | exact winner/loser/activity/outbox; no partial state |
| relay recovery | controlled 100-event publish fault | all publish-confirmed <=120 s after recovery; stable identities |

### Phase 4 - U04 pricing and manual cases

| Test | Population | Gate |
|---|---|---|
| Agreement success | 25 each shallow, deep selected, `valid_from`, `valid_to` | each/aggregate p99 <=800 ms; exactly 3 lines + receipt |
| Tariff success | 100 unique requests | p99 <=800 ms; exactly 3 lines + receipt |
| no-rate | 25 each BASE, SURCHARGE, LOCAL, multiple missing | each/aggregate p99 <=800 ms; one manual receipt/OPEN case |
| ambiguity | 25 each Agreement, BASE, SURCHARGE, LOCAL | each/aggregate p99 <=800 ms; exact 422/manual semantics |
| manual read | 10k OPEN cases, bounded page <=100 | list/detail p95 <=750 ms |
| claim/case races | >=20 fresh same-key rounds | one terminal/canonical case; no stale-owner write/deadlock |

### Phase 5 - U05 Booking consumption and repricing

| Test | Population | Gate |
|---|---|---|
| capture/claim | 20 warm-ups +100 fresh, 10 clients | p95 <=500 ms |
| completion | 20 warm-ups +100 unique, 10 clients | p95 <=750 ms |
| detail/history | 20 warm-ups +100 shallow/deep/legacy | each/aggregate p95 <=750 ms |
| cursor next page | 100 equal/different timestamp calls | p95 <=750 ms; no gaps/duplicates |
| fresh end-to-end | 50 first Agreement, 50 first Tariff, 50 successor-Agreement Reprice, 50 changed-Tariff Reprice | each subtype p99 <=1,500 ms |
| retry/circuit | typed timeout/503 and non-retry outcomes | <=2 two-second calls; bounded five-operation circuit and one half-open probe |

### Phase 6 - U06 integrated acceptance

| Test | Population | Gate |
|---|---|---|
| fresh known rate | exactly 50 Agreement +50 Tariff, 10 clients | each subtype/aggregate p99 <=800 ms |
| fresh no-rate | exactly 25 each BASE/SURCHARGE/LOCAL/multiple missing | each subtype/aggregate p99 <=800 ms |
| terminal replay | separate exactly 100 calls | byte/idempotency proof; excluded from fresh latency |
| readiness/restart | every required service and stack | <=120 seconds service; <=10 minutes aggregate |
| closed evidence | required performance/observability/security/preservation IDs | every required cell exactly once; unavailable BLOCKED |

## Resource and bottleneck evidence

Capture:

- Hikari/client active, pending, wait, timeout, and permits;
- PostgreSQL query plans/counts/rows, lock waits, deadlocks, table/index/vacuum
  evidence;
- JVM heap/GC, Node heap/event-loop, process/container RSS/CPU;
- open sockets/threads, retained bodies/requests, error counts;
- outbox age/attempts, retry/circuit state, evidence-writer queue/caps;
- edge/BFF/Booking/Charge span completeness.

Likely bottlenecks to test, not assume:

1. Rate/Agreement list history N+1 or unbounded materialization;
2. Hikari pool 10 acquisition and database lock contention;
3. Reference fan-out 50 permits and BFF protected/selector limits;
4. pricing candidate query/index shape at large fixtures;
5. Booking receipt/snapshot/history cursor and HTTP client permits;
6. evidence writer, trace, disk, heap/RSS, and retained-request growth.

## Three-cycle resource gate

Run three identical post-warm-up cycles, quiesce 60 seconds, and measure minimum
heap/median RSS over the last 30 seconds:

```text
cycle_3 <= max(1.20 * cycle_1, cycle_1 + 32 MiB)
growth(cycle_1 -> cycle_2) <= 5%
growth(cycle_2 -> cycle_3) <= 5%
```

OOM/restart, pool timeout, deadlock, N+1, full-history load, cursor
gap/duplicate, retained provider body/socket/thread, or bound breach is FAIL.

## Stop, teardown, and evidence

Stop immediately on manager drift, auth bypass, unsafe telemetry, durable
integrity failure, evidence-writer failure, unexpected topology, or resource
exhaustion. Run the incident-response runbook and unconditional preservation
lane. Teardown/cleanup uses only approved wrapper-owned resources and always
ends with manager/sibling guards.

## Deferred capacity exercises

Stress, spike, soak, breaking-point, auto-scaling, 12-month capacity, and cost
validation are deferred until representative traffic, a production-like
topology, scaling mechanisms, owners, and observability history are approved.
No production RPS or scaling recommendation is derivable from this local plan.


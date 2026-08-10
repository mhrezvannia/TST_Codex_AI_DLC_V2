# W2-04 Load and Performance Test Plan

## Scope and Upstream Trace

This plan validates the local-only targets in `performance-requirements`, the
bounded contention cases in `scalability-requirements`, the measurement model
in `performance-design`, the locking/ordering boundaries in
`scalability-design`, and the evidence contract in `dashboards`.

It is an acceptance plan, not a production load, stress, soak, throughput,
autoscaling, capacity, or cost test.

## Environment Preconditions

Testing may start only when:

- one committed source SHA is bound to immutable image/config/contract/Flyway
  digests;
- the exact W2-02 synchronization prerequisite is recorded;
- all static gates and current-image builds pass;
- one serialized controller owns an isolated `linercore-wave-a` project;
- pre-run `npm run demo:guard` passes;
- current Booking/CMM UI and backend images are deployed without fallbacks;
- Prometheus/log/trace evidence required by `dashboards` is live and validated;
- fixture creation, evidence hashing, and scoped `always()` cleanup are wired.

If another session owns the Wave A project, this session waits; it never adopts
or cleans the stack.

## Measurement Rules

- One labelled warm-up is excluded from every 20-sample population.
- Each measured population has exactly 20 successful outcomes of its specified
  class.
- Nearest-rank p95 is the 19th ascending value for N=20.
- Record sample count, p50, p95, max, status/outcome, correlation, run ID,
  source/image identity, and environment.
- API timing uses one controller monotonic clock.
- UI timing uses browser `performance.now()` from action to focused result.
- Propagation/recovery uses one controller monotonic start with independent
  500 ms database and UI observations.
- Broker/service wall clocks are correlation evidence only.
- Failed/denied calls are reported separately and never improve an accepted
  latency population.

## U01 Journey Populations

| Population | Warm-up | Measured samples | Target |
|---|---:|---:|---|
| Journey list GET | 1 | 20 | p95 <= 2 s; max <= 5 s |
| Journey detail GET | 1 | 20 | p95 <= 2 s; max <= 5 s |
| Booking-reference journey GET | 1 | 20 | p95 <= 2 s; max <= 5 s |
| Accepted GTOT POST | 1 unique fixture | 20 unique run-scoped fixtures | p95 <= 2 s; max <= 5 s |
| GTOT to Booking DB/UI | none beyond the accepted fixtures | 20 independently observed propagations | each endpoint <= 30 s |

Every GTOT sample uses a unique real `booking.confirmed`/container fixture.
HTTP 409, 403, validation, or reused accepted identities do not count.

## U02 Conflict, Recovery, and Ordering Populations

Run four independent rejection populations:

| Population | Warm-up | Measured samples | Target |
|---|---:|---:|---|
| Duplicate direct API | 1 | 20 | p95 <= 2 s; max <= 5 s |
| Wrong-next direct API | 1 | 20 | p95 <= 2 s; max <= 5 s |
| Duplicate Playwright UI | 1 | 20 | p95 <= 2 s; max <= 5 s |
| Wrong-next Playwright UI | 1 | 20 | p95 <= 2 s; max <= 5 s |

Each attempt must append only its permitted rejection evidence and preserve
accepted journey/version/history/outbox/projection hashes.

Additional U02 tests:

- accepted LOAD, DISC, and GTIN propagation to Booking DB/UI within 30 seconds;
- one event-targeted CMM publisher failure with database-clock due predicate,
  500 ms polling, and CMM/Booking/UI recovery within 30 seconds;
- one event-targeted Booking consumer failure with conditional
  event/state/worker/token/version fence and health/UI recovery within 30
  seconds;
- exact serialized ten-delivery fixture: nine immutable receipts, separate
  duplicate evidence, APPLIED=2, STALE=5, REJECTED=2, strongest P4 projection,
  and four endpoints within one 30-second window.

## U03 Authorization and Degradation Populations

For each outcome below, run a separate 20-request API population and a separate
20-request Playwright UI population, each with one excluded warm-up:

1. authorized fresh read;
2. read DENY;
3. Identity unavailable;
4. authorized Reference Data last-known read.

Every population targets p95 <= 2 seconds and max <= 5 seconds and asserts
safe-envelope/protected-data semantics. After dependency recovery, API and UI
must independently become fresh within 30 seconds after user-triggered Retry.

Run the exact ten-request concurrent authorization matrix and assert every
HTTP result, lookup ordering, denial-audit delta, and prohibited/business
write set.

## Bounded Contention

- Publish the same Booking intake event with ten contenders: one durable winner,
  nine replay audits, no duplicate journey/plan/outbox effects.
- Submit the same GTOT capture with ten contenders: one accepted immutable
  winner and nine attempt/rejection/audit-only losers.
- Record duration, disposition, correlation, database counts/hashes, pool
  symptoms, deadlock/timeout errors, and resource observations.

These are correctness/lock-pressure tests, not concurrent-user capacity.

## Resource and Bottleneck Evidence

Capture CPU/memory, JVM/Node memory, database pool symptoms, query latency,
Kafka/consumer lag, outbox/receipt age, error rate, and UI/browser timing.
Likely investigation seams are fresh Identity/Reference Data calls, indexed
journey/request lookups, row locks, outbox relay, consumer fencing, and frontend
render/polling. No bottleneck is declared until measured.

## Stop and Cleanup

Any product, security, data-integrity, evidence, target-isolation, or threshold
failure stops the run. One retry is permitted only for a proven environmental
failure. Cleanup uses only the serialized Wave A controller, preserves
evidence/volumes as required, and finishes with the manager guard.


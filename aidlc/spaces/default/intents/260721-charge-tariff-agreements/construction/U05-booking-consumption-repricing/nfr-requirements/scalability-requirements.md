# Scalability Requirements - U05 Booking Consumption and Repricing

## Capacity boundary

U05 extends the existing Booking service, Booking PostgreSQL database, and
existing pricing region. It introduces no service, shared database, cache,
broker, queue, distributed circuit, or global client state. Local evidence uses
10,000 Bookings, exactly 50 typed snapshots for each of 1,000 deep-history
Bookings, 100,000 PRICE receipts, and 10 concurrent clients. This is not a
production traffic forecast.

## Bounded data and concurrency

| ID | Requirement | Pass condition |
| --- | --- | --- |
| SCALE-U05-001 | Current Booking plus history is cursor/page bounded. | default 20/max100, indexed DESC tuple cursor, no gaps/duplicates/full-history materialization/N+1; PERF-U05-003/004 pass |
| SCALE-U05-002 | Capture/claim is unique indexed lookup and row-locked CAS on `P|<ChargeKey>`. | PERF-U05-001 and 20-round live/takeover tests pass without cross-key serialization |
| SCALE-U05-003 | Completion locks one Booking/receipt and appends one snapshot/audit atomically. | PERF-U05-002 and race matrix pass; no remote call while a Booking transaction is open |
| SCALE-U05-004 | Independent Price/Reprice operations proceed at 10 clients through existing service instances. | each fresh subtype meets p99 <=1,500 ms; no affinity/JVM lock dependency or duplicate local/Charge receipt |
| SCALE-U05-005 | Retry/circuit work is bounded. | at most two raw two-second calls; five-operation process-local window; one half-open probe after 30 seconds; exact receipt due policy (1 second timeout/503, normalized provider in-progress, circuit probe instant, 30 seconds denied/malformed, pricing-input changed NULL/non-reclaimable old key, revision-only changed immediately due same key); no automatic retry or unbounded queue/thread/socket growth |

PostgreSQL owner/fence/revision/sequence predicates—not process-local locks—own
receipt and snapshot correctness. Resilience4j circuit state is intentionally
per instance and may reset on restart; no distributed threshold is claimed.

## Growth and degradation

No cache is selected because current price markers, history and confirmation
eligibility require authoritative read-after-write. No async pricing queue is
selected because the existing synchronous command plus durable bilateral
receipts provides bounded recovery. U05 adds no pricing outbox event.

Capacity review triggers are a local p95 or healthy p99 breach after query/index/
serialization tuning, receipt/snapshot index-plan degradation, independent-key
pool contention, three-cycle resource failure, or cursor instability. Any cache,
archive/partition, distributed circuit, or async workflow requires a later
consistency, ordering, retention, recovery and operations design.

On timeout/503/circuit, Booking persists bounded RETRYABLE/manual outage evidence
without a Charge case or fake total. Provider in-progress uses bounded retry
guidance. Denied/malformed/validation/conflict/changed outcomes stay distinct.
Automatic UI retry and unbounded history loading are prohibited.

## Validation and upstream coverage

Validation uses two Spring contexts sharing PostgreSQL, large fixtures, query
plans, connection/lock/heap telemetry, deterministic clock/provider faults, and
the three-cycle gate from `performance-requirements.md`. This artifact consumes
`business-logic-model.md`, `business-rules.md`, `requirements.md`, and
`technology-stack.md`; it leaves provider authority to U04 and live closure to
U06.

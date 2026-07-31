# Scalability Requirements - U03 Agreement Authority

## Capacity boundary

U03 extends the existing Charge service, Charge PostgreSQL database, and
transactional outbox. It is not a new service, cache, broker, database, or
pricing authority. The accepted local capacity is 10,000 stable Agreements,
50,000 versions, 150,000 exact links, 10 concurrent administrative clients, and
a burst of 20 independent approvals. No production traffic forecast is claimed.

## Data growth and concurrency

| ID | Requirement | Pass condition |
| --- | --- | --- |
| SCALE-U03-001 | Vendor list/detail remains page-bounded as W2 and LEGACY history grows. | size <=100; no full-history materialization or N+1 link/activity fetch; PERF-U03-001 passes. |
| SCALE-U03-002 | Search/order/selection and candidate checks use deterministic indexed predicates for authority model, customer/lane/lifecycle/window, stable order, draft, and overlap key. | query-plan and large-fixture evidence retain bounded rows/work and exact results. |
| SCALE-U03-003 | Approval serialization is canonical-key scoped and DB-backed, not JVM-local. | 20 independent approvals all commit through two contexts; no cross-key lock or pool failure. |
| SCALE-U03-004 | Same-key approval, same-header successor, and suspend-versus-expire races remain correct across processes. | 20+ barrier rounds each have one valid winner; approval loser is 409 `AGREEMENT_AUTHORITY_CONFLICT`, successor loser is 409 `AGREEMENT_DRAFT_EXISTS`, and terminal-transition loser is 409 `AGREEMENT_STALE_VERSION`; one activity/outbox and no duplicate/partial state. |
| SCALE-U03-005 | Outbox relay handles a bounded recovery backlog without changing commercial rows. | after a controlled 100-event publish fault, all 100 rows become publish-confirmed within 120 seconds of healthy broker restoration; none remain pending/lost and event/dedupe identities are unchanged. A separate ack-before-outbox-mark crash test permits duplicate publication only with the identical event/dedupe identity and no second commercial/activity row. |

The API/application layer is stateless between requests. PostgreSQL locks,
constraints, and optimistic versions—not process memory—provide multi-instance
correctness. Kafka delivery is at least once; stable dedupe keys allow consumers
to suppress duplicates. U03 does not claim broker-level exactly once.

## Scaling model and triggers

No cache is selected because Agreement eligibility, Draft state, overlap, and
authorization must be authoritative. No partition, shard, replica, async command
queue, or new event type is selected. The existing outbox decouples post-commit
publication without weakening transactional business state.

Later capacity review is triggered by a fixed-query p95 breach after query/index
tuning, connection acquisition failure on independent keys, excessive rows or
heap for one bounded page, or a relay backlog that misses SCALE-U03-005. At that
point, profile query shape and relay batching first. Any cache/partition/broker
change requires a separate consistency, ordering, dedupe, recovery, and
operations design.

## Overload and degradation

There is no stale or legacy fallback for W2 authority. Identity/Reference/rate
validation timeout returns typed 503/422 as defined and writes nothing. DB/pool
failure leaves a command absent or wholly committed. Broker failure after commit
leaves the outbox pending/retryable and never rolls back, rewrites, or republishes
commercial state inline.

Queries reject invalid/unbounded pages. Callers may explicitly retry typed
transient reads; mutation recovery begins with authoritative detail/activity/
outbox reconciliation and expected-version rules, not blind duplication.

## Validation and upstream coverage

Validation uses PostgreSQL rather than an in-memory authority repository, two
independently wired Spring contexts, deterministic large fixtures, query plans,
pool/lock/heap telemetry with the three-cycle bounded-resource gate from
`performance-requirements.md`, and controlled relay/broker faults. This artifact
consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and
`technology-stack.md` while leaving integrated pricing scale to U04/U06.

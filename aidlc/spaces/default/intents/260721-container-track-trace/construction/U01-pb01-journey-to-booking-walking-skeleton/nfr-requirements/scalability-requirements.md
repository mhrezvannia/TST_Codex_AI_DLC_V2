# Scalability Requirements - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

This bounded capacity requirement derives from U01 `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and the Compose/Kafka/PostgreSQL seams
in `technology-stack.md`. It intentionally does not create a production growth
forecast or cloud autoscaling requirement.

## Acceptance Capacity

Two independent 10-contender probes cover uniqueness/locking pressure, not
user-load capacity:

1. **Intake:** publish the identical registered `booking.confirmed` envelope/
   event ID 10 times in one window. One unique intake receipt transaction wins
   and creates one journey, two expected-plan rows, one accepted intake audit,
   and one seq-0 outbox row. Nine losers load the winner's immutable stored
   disposition and append one replay audit each; they add no receipt, journey,
   plan, lifecycle/version, or outbox effect.
2. **Capture:** send 10 simultaneous identical GTOT requests with the same
   idempotency key/fingerprint/occurrence. One winner completes the immutable
   accepted request disposition and commits one attempt, movement, version/
   lifecycle advance, accepted audit, and seq-1 outbox row. Each of nine losers
   appends attempt + rejection + audit only, returns the stored duplicate result,
   and never changes the winner disposition or accepted state/outbox.

Both probes must finish without connection-pool exhaustion, deadlock, unbounded
retry, or partial rows, and record per-contender result/timing/correlation.

## Scaling Characteristics

CMM and Booking remain separately persisted bounded contexts. Kafka partition
ordering and Booking durable receipts tolerate transport redelivery. Stateless
HTTP containers may be replicated by the existing runtime later, but this intent
does not validate horizontal scaling, rebalancing, read replicas, partitioning,
or multi-region behavior.

Indexes/unique constraints must support booking/container lookup, request/event
identity, pending outbox claim, and latest Booking projection without a full-table
correctness dependency. Query plans may be inspected during implementation if
the local latency target fails; no speculative index or new cache is mandated.

## Capacity Evidence and Non-Claims

Record contender count, success/disposition counts, duration, database row
hashes/counts, outbox count, and container resource observations. Do not report
the result as production RPS, maximum users, annual data growth, autoscaling
capacity, or cost forecast. Sustained/spike/soak tests and multi-container fleet
scale remain outside W2-04.

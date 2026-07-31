# Scalability Design - U01 Rate Authority

## Capacity model and constraints

This design maps `scalability-requirements.md` to concrete patterns while
honoring `performance-requirements.md`, `security-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. U01 remains an additive capability in the existing
Charge service and service-owned PostgreSQL database. No new deployable,
load-balancer rule, cache, replica, shard, queue, broker, or cloud resource is
authorized.

The accepted local design point is 10,000 stable Rates, 50,000 versions, 10
concurrent administrative clients, and a burst of 20 independent approvals.
These are acceptance capacities, not production demand forecasts.

## Stateless application and authoritative data

The HTTP and application layers hold no request-to-request commercial state and
require no session affinity. Any existing service instance can process a
command because concurrency correctness resides in PostgreSQL transactions,
advisory/row locks, predicates, and constraints rather than JVM-local locks.
For Approved-window authority specifically, advisory-lock serialization plus
the authoritative overlap query decides the winner; generic constraints alone
are not claimed to encode the full inclusive overlap rule.

PostgreSQL remains the single write/read authority for Draft and Approved
history. No application cache is introduced: cache invalidation would have to
preserve read-after-write, overlap authority, one-Draft uniqueness, derived
lifecycle, and immutable attribution without evidence of a current bottleneck.
The design favors reversible query/index tuning over new distributed state.

## Bounded read architecture

List queries first identify a bounded page of stable Rate IDs using deterministic
ordering and indexed filter predicates, then load only the required summary and
history projection for that page. Detail loads one stable Rate and its bounded
version/activity history. API/BFF code never materializes the full 10k/50k
fixture.

Query plans are validated for category, lifecycle/window, applicability,
latest-update ordering, overlap candidates, and free-text cases. Any N+1 query,
unbounded result, or memory growth across repeated bounded pages is a failure.
Page size has one enforced maximum at the service boundary; the browser's one-
based page maps explicitly to the service's zero-based convention.

## Concurrency, pools, and blast radius

The local Hikari pool is bounded at 10 connections with two idle and a two-
second acquisition timeout. The two-context test starts 20 independent
approvals behind one barrier, assigns exactly 10 to each independent pool, and
records every acquisition wait; every request must acquire within two seconds.
Identity has 10 HTTP permits and Reference Data has 50, with at most five
Reference permits held per command. The healthy design point is exactly
`10 commands x 5 checks = 50 calls`: every check receives a permit, completes
within the 250 ms provider budget, and the command's fan-out completes within
300 ms. Higher bursts have a 100 ms maximum permit wait inside the two-second
command deadline, so a slow dependency cannot consume unbounded threads,
sockets, or queued requests.
Permit exhaustion returns the same typed unavailable boundary and commits no
mutation.

Approval locks only the normalized authority key and candidate rows. Successor
creation locks only its stable Rate. Twenty independent keys therefore remain
concurrent; a same-key race serializes by design. A PostgreSQL advisory hash
collision may reduce throughput but cannot create invalid authority because
advisory-lock serialization and the authoritative overlap query remain
decisive. Row-state and one-Draft constraints are supplementary guards.

The blast radius of a pool or database failure is the Charge service's Rate
paths, not Identity, Reference Data, Booking storage, the shared shell, or the
manager demo. No cross-database read or duplicate reference authority is used as
a fallback.

## Scaling decision path

Capacity changes follow evidence in this order:

1. Verify fixture, percentile calculation, query count, pool wait, lock wait,
   heap, and CPU evidence.
2. Remove N+1 work and tune query shapes/indexes while preserving exact
   lifecycle/applicability semantics.
3. Adjust the existing service/pool scale only when PostgreSQL and dependency
   capacity support it and the active deployment topology already permits it.
4. Consider a cache, read replica, partition, shard, or CQRS model only through
   a later architecture decision that proves consistency, invalidation,
   recovery, security, cost, and operational ownership.

Triggers are a failed accepted percentile on the fixed fixture, independent-
key pool/lock saturation, excessive examined rows/heap for a bounded page, or
real production observations establishing a materially different load. A
trigger initiates review; it is not automatic infrastructure expansion.

## Overload behavior and validation

Invalid or excessive page sizes are rejected. There is no fetch-all fallback.
Dependency/pool exhaustion fails closed with a typed result; it does not serve a
stale Draft as Approved, skip validation, invent a rate, or enqueue an unknown
mutation. Callers may explicitly retry only after reading current state and
only for documented transient outcomes.

Validation uses the fixed 10k/50k dataset, two independently wired Spring
contexts, one PostgreSQL Testcontainer, 20 concurrent independent approvals,
and at least 20 fresh same-key rounds. Evidence records latency, query plans,
pool and permit saturation, locks/deadlocks, heap/RSS/CPU, exact activity counts,
and winner/loser codes.

This artifact explicitly consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

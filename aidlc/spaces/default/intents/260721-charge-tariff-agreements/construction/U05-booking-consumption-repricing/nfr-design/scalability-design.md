# Scalability Design - U05 Booking Consumption and Repricing

## Capacity posture

U05 stays in existing Booking instances/PostgreSQL and the current pricing
region. Local proof covers 10,000 Bookings, 50,000 typed snapshots, 100,000
PRICE receipts, and 10 clients; it is not a production forecast. No cache,
queue, broker, distributed circuit, shared database, or new service is added.

## Bounded data paths

Capture is one indexed receipt lookup plus one Booking read/conditional claim.
Completion locks one Booking and receipt, appends at most one snapshot/audit,
and updates one current pointer. History is 20/default, 100/max with a stable
descending tuple cursor and no full materialization.

Canonical codecs are linear in a bounded request/response. Provider itemization
is fixed to three lines. Manual/error evidence is bounded and never embeds raw
provider payloads.

## Concurrency and fencing

PostgreSQL uniqueness, row locks, owner/fence CAS, revision, pricing sequence,
and fingerprint—not affinity or JVM locks—own correctness. Capture and
completion are separate transactions; remote I/O is between them. Independent
keys proceed concurrently, while same-key contenders converge on one owner and
one immutable outcome.

Pricing-input changes permanently retire the old key with NULL due. Revision-
only changes make the same key immediately reclaimable at a higher fence,
allowing Charge replay while preserving newer non-pricing fields.

## Resilience bounds

Plain Resilience4j core decorators allow at most two identical two-second raw
calls. A process-local count window 5/minimum 5/100% opens for 30 seconds and
admits one half-open probe. Only timeout/503 is retried; there is no queue,
automatic UI retry, distributed counter, or unbounded thread/socket growth.

The retry predicate accepts only typed provider timeout and HTTP 503. The outer
circuit records failure only when either remains after retry exhaustion. It
ignores HTTP 4xx, valid Charge domain outcomes, provider denied/malformed,
Booking validation/conflict/changed, and caller cancellation. A rejected
concurrent half-open command records `nextAttemptAt = probeStartedAt + 5s`;
the admitted probe has at most two two-second attempts plus one second to release
resources and publish the resulting breaker state.

The existing client enforces connect/read and overall attempt deadlines at two
seconds. Timeout cancels the in-flight operation, closes any response stream,
and releases its permit/socket before retry. Retry is synchronous on the caller
path and creates no detached executor, orphan future, or accumulating task.

Exact receipt due times bound timeout/503, provider in-progress, circuit,
denied/malformed, and changed states. Restart may reset circuit state but not
durable receipt truth.

## Growth and degradation

Immutable snapshots grow by accepted pricing outcomes only. Typed indexes,
receipt covering access, vacuum/table statistics, cursor plans, pool pending,
and heap/RSS are recorded. Archive/partition policy requires later approved
retention and consistency design.

Dependency outage persists bounded local evidence without a fake total/Charge
case. Capacity escalation requires measured plan, latency, pool, resource, or
cursor failure after local tuning.

## UI scaling

Server-render current Booking and first history page; use focused client state
only for amend, Price/Reprice, page cursor, and selected history. Stable
Skeleton dimensions prevent layout shift. At narrow widths the existing money
table uses an intentional contained scroll/compact representation, never page-
level overflow. No RTK/global store or shared primitive change is introduced.

## Verification and traceability

Two contexts, large fixtures, plans, pool/lock telemetry, deterministic
resilience clocks, 20 race rounds per subtype, and three resource cycles prove
the bounds.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

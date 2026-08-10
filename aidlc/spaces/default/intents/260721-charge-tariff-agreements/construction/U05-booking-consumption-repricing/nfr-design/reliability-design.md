# Reliability Design - U05 Booking Consumption and Repricing

## Durability and boundaries

Committed aggregate pricing fields, immutable snapshots/evidence, audit, and
local PRICE receipt have local RPO 0. Capture and completion are separate public
transactional beans; Charge I/O occurs between them without a Booking
transaction. Completion atomically locks/revalidates and commits all local
effects.

## Receipt state machine

Absent claims IN_PROGRESS with 15-second lease and next fence. Same key/hash
under live lease returns clipped 1-15 second in-progress; different identity/
body/operation conflicts. Expired IN_PROGRESS or due RETRYABLE takes a higher
fence. Completion/release matches owner/fence/state and clears ownership.
COMPLETED replay is immutable and reauthorized.

Retryable due rules are exact: timeout/503 +1s; provider in-progress normalized
1-30s; circuit exact probe instant; denied/malformed +30s; pricing-marker change
NULL/non-reclaimable; revision-only change immediate/same-key. Only a deliberate
authorized command reclaims.

Retry and circuit classify only typed timeout and HTTP 503 as failures. After at
most two raw calls, the outer circuit records one exhausted failure. HTTP 4xx,
valid domain outcomes, denied/malformed responses, Booking-local outcomes, and
caller cancellation are ignored by the breaker. When one half-open probe is in
flight, concurrent rejection persists exact due time
`probeStartedAt + 5 seconds`; the admitted probe's two two-second attempts and
one-second cleanup margin must finish before that instant.

## Completion and race outcomes

Under stable Booking-then-receipt lock order, completion compares frozen
revision, sequence, fingerprint, owner, and fence. Success appends once and
advances current pointer; manual terminal writes evidence without total;
transient/circuit writes retry evidence. Identical snapshot bytes replay and
divergent bytes conflict.

Pricing-input race returns `BOOKING_CHANGED`, no append, NULL due, and requires
new sequence/key. Revision-only race returns changed, immediate due; subsequent
same-key takeover consumes Charge terminal replay and preserves newer
non-pricing fields.

## Failure and bilateral recovery

Failure before local completion leaves an IN_PROGRESS/retryable local receipt
and possible Charge terminal receipt. After lease/due, the same frozen Charge
key/body obtains exact provider replay and a higher local fence. Response loss
after local commit returns authorized stored command outcome assembled with the
current Booking view. There is no XA, blind retry, saga, or pricing outbox.

Malformed legacy receipts/typed rows fail closed. Applied migrations are never
edited; U06 restores into a new isolated DB and validates Flyway, legacy, typed
history, receipts, audit, replay, and confirmation.

Every raw provider attempt has a two-second connect/read/overall deadline.
Timeout cancellation closes the response body, releases the client
permit/socket, and finishes before another attempt begins. No detached future or
retry executor survives the request; fault tests assert stable permits, sockets,
threads, and heap after repeated timeouts.

## Restart and readiness

Within 120 seconds of normal isolated restart, readiness is true, one lost-
response replay is exact, and current plus first 20 history entries load.
Readiness is false for DB/catalog/migration, authoritative receipt/snapshot
wiring, required credentials, or bypass posture. Liveness is process-local;
Resilience4j state reset is expected and disclosed.

## Observability

One correlation joins UI/BFF authorization, local claim, Charge request/receipt/
sources, completion, snapshot/evidence/audit, and response. Metrics separate
outcome, replay/retry/fence/circuit and transaction/pool failures with bounded
labels. Recovery evidence hashes canonical bytes and normalizes timestamps;
owner tokens and money are omitted.

## Verification and traceability

Fault injection covers capture, each raw call, circuit transition, completion
lock/revalidation, snapshot insert, audit/receipt commit, and response loss.
Twenty two-context rounds prove every race, exact outcome, one append/current
pointer, no partial state, and no Charge call in a DB transaction.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

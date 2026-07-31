# Performance Design - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Budgets

This design implements U02 `performance-requirements.md`,
`business-logic-model.md`, and `tech-stack-decisions.md`. Duplicate and
out-of-sequence API/UI populations use the specified monotonic clocks and
nearest-rank p95; accepted publication and retry use the independent 30-second
DB/UI observer.

## Conflict and Retry Paths

Capture conflict evaluation uses indexed journey/request identity lookup and a
single local transaction, so rejection evidence is durable without accepted
state mutation. The relay and Booking consumer remain asynchronous; bounded
polling, existing pools, and bounded relay/consumer batches avoid unbounded
retry or connection pressure. Event-targeted acceptance seams fail once and
auto-disarm; production backoff remains configuration-owned.

## Guardrails

No rejected 409 is included in accepted latency samples. Acceptance runs use
run-scoped fixtures, `npm run demo:guard` pre/post, isolated `linercore-wave-a`,
and a single live Compose controller protecting port 8088.

## Executable Recovery Evidence

The publisher seam targets one event ID, fails its first send, persists
`lastAttemptAt`/`nextAttemptAt` from the service clock, auto-disarms, and exposes
the due predicate. A single controller starts monotonic time zero at the later
of observed seam/broker readiness and observed row due; it polls every 500 ms
and independently requires CMM PUBLISHED, Booking receipt/projection APPLIED,
and Booking UI APPLIED within 30 seconds. Booking's fail-once seam inserts
PROCESSING, conditionally claims event + worker + token + version, records
RETRYABLE attempt/next-at plus consumer health, then conditionally completes
APPLIED under the same fence; DB and UI endpoints use the same cadence/bound.

The deterministic ten-delivery fixture uses the exact identities/order from
`scalability-requirements.md`; it awaits each durable disposition, records nine
unique immutable receipts, separate duplicate-delivery evidence, APPLIED=2,
STALE=5, REJECTED=2, comparator inputs, and unchanged final projection hash,
then independently observes all receipts and Booking UI convergence.

All acceptance payloads/identifiers are bounded, timeline reads are paginated,
dependency calls time out, and 409/audit/UI output redacts secrets and raw
payloads. W1 remains a BLOCKED waiver; no evidence relabels it as PASS.

## Review Iteration 1

**Verdict: NOT-READY**

1. The design only says “bounded polling” and “event-targeted acceptance
   seams”; it must restate the executable publisher and Booking-consumer
   recovery contracts: controller-observed monotonic time zero, database-clock
   due predicates, 500 ms cadence, <=30 s CMM/Booking/UI endpoints, and the
   Booking receipt PROCESSING/RETRYABLE claim/completion fence
   (event + worker + token + version).
2. The ten-delivery proof is absent. Specify the exact ten identities and
   delivery order (or await each durable disposition), nine unique immutable
   receipts, duplicate-delivery evidence separate from the original receipt,
   STALE/REJECTED/APPLIED counts, comparator inputs, unchanged projection
   hash, and explicit DB/UI convergence observations.
3. Name the owned persistence seam for redelivery evidence (for example
   `appendDuplicateDeliveryEvidence`) and align it with the functional
   Booking contract so an APPLIED receipt is never mutated to DUPLICATE and
   duplicate evidence cannot be silently dropped.
4. Add explicit bounded security/performance acceptance evidence: payload and
   identifier limits, pagination/timeline bounds, timeout behavior, and
   redaction of secrets/raw payloads in 409/audit/UI output. Keep W1 as a
   BLOCKED waiver and retain the single isolated Compose controller/demo guard
   constraints.

## Review Iteration 2

**Verdict: READY**

The remediated design now specifies controller-observed recovery time zero,
database-clock due predicates with 500 ms polling, bounded 30-second CMM/
Booking/UI convergence, and event/worker/token/version receipt and relay
fences. The ten-delivery fixture is deterministic (`E-{run}-L0A`, `P4`, its
redelivery, `P4E`, `P3`, `P2`, `P1`, `BADBOOK`, `UNASSIGNED`, `L0B`) with
durable sequencing, nine immutable receipts, separate duplicate evidence,
APPLIED=2/STALE=5/REJECTED=2, comparator/hash assertions, and UI convergence.
`appendDuplicateDeliveryEvidence` is explicitly Booking-owned and preserves
the original APPLIED receipt. Bounds, timeouts, redaction, W1 BLOCKED waiver,
port 8088/demo guard, isolated single-stack control, and scope exclusions are
also explicit.

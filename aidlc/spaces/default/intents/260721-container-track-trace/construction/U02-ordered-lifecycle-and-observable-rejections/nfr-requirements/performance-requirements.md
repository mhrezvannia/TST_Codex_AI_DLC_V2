# Performance Requirements - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

These targets quantify U02 `business-logic-model.md` and `business-rules.md`,
retain `requirements.md`, and use the locked brownfield stack in
`technology-stack.md`. U01's healthy local API p95/max and 30-second propagation
observer conventions are inherited; no production SLO is created.

## Rejection Latency Targets

Measure duplicate and out-of-sequence separately in four independent
populations: 20 direct API attempts per class and 20 Playwright UI attempts per
class. Each population has its own one excluded warm-up and a fresh journey
fixture whose required next move remains stable for the full population.

| Endpoint | Start / end | Target |
| --- | --- | --- |
| API 409 | controller monotonic clock immediately before HTTP dispatch through complete durable 409 body receipt | p95 <= 2 s; max <= 5 s |
| UI outcome | browser `performance.now()` immediately before the submit click through the exact code/recovery summary becoming visible and focused | p95 <= 2 s; max <= 5 s |

Every measured attempt has a unique run ID suffix, idempotency key, and
correlation ID. Duplicate-occurrence samples use the same already-accepted
occurrence identity with those new keys; out-of-sequence samples use the same
illegal next code with those new keys. Each attempt adds exactly one attempt,
rejected disposition, rejection, and audit row, while accepted journey version,
lifecycle, accepted movement/history, accepted outbox, and Booking projection
counts/hashes remain constant. Rejection evidence is compared by expected
deltas rather than incorrectly required to hash unchanged.
HTTP 409 samples are successful rejection-path measurements but can never count
as accepted GTOT/LOAD/DISC/GTIN performance samples.

Use U01's one-warm-up and nearest-rank convention (`ceil(0.95*N)`; 19th of 20).
Record API/UI samples separately with code, reason, correlation, run ID, focus
target, and before/after state hashes.

## Healthy Publication and Retry Timing

Healthy accepted LOAD/DISC/GTIN retains the same 30-second single-controller
monotonic observer: successful POST response is time zero; Booking DB APPLIED and
visible Booking UI APPLIED are independently polled every 500 ms and must each
arrive within 30 seconds.

For one injected retryable publish failure, the acceptance profile arms a
run-scoped, event-ID-targeted publisher seam before the matching row is claimed.
It fails that event's first send only, persists `lastAttemptAt` from the
service's injected clock with RETRYABLE, sets `nextAttemptAt <= lastAttemptAt +
5 s`, and then auto-disarms. The controller observes both seam-disarmed evidence
and broker readiness plus the due row; the controller never compares its clock
to `nextAttemptAt`. It polls a database predicate evaluated with the database
clock (`state=RETRYABLE AND next_attempt_at <= clock_timestamp()`) every 500 ms.
Recovery time zero is the later controller-monotonic observation of (a) seam
disarmed plus broker ready and (b) that predicate becoming true. It independently requires the matching CMM row PUBLISHED, Booking
receipt/projection APPLIED, and Booking UI APPLIED within 30 seconds.

A separate run-scoped, event-ID-targeted Booking consumer seam fails one event
after its receipt is inserted as PROCESSING and before projection application.
The same Booking transaction records RETRYABLE with attempt and `nextAttemptAt`
and marks Booking-owned consumer health degraded; the detail UI must expose
delayed/retry and degraded from those Booking-owned facts. The due Booking
receipt is conditionally claimed only from RETRYABLE into PROCESSING with worker
ID, unique claim token, and incremented claim version; APPLIED/RETRYABLE/
PERMANENT completion must match event ID + PROCESSING + worker + token + claim
version. The controller polls the Booking database-clock due predicate every
500 ms; its later monotonic observation of seam disarmed and predicate true is
Booking recovery time zero. It independently requires receipt APPLIED, matching
projection, healthy consumer state, and Booking UI APPLIED
within 30 seconds. This fixture is distinct from pre-broker CMM publication
pending, which Booking cannot observe. Production backoff remains configurable
and has no target here.

## Non-Claims

No production rejection latency, event throughput, sustained load, resource
utilization, alert threshold, or availability SLO is inferred. The run-scoped
samples are repeatable acceptance evidence, not a capacity forecast.

## Review Iteration 1

**Verdict: NOT-READY**

The five artifacts preserve the local-only NFR boundary, existing Java/Kafka/
PostgreSQL/Next stack, service-owned persistence, full outbox completion fence,
serialized `linercore-wave-a`/port-8088 controls, W2-02-first synchronization,
scope exclusions, and the historical W1 BLOCKED/waiver distinction. The
following corrections are required for executable and internally consistent
acceptance:

1. **Define one reproducible rejection sample population and clock model.**
   `performance-requirements.md` / **Rejection Latency Targets** can mean either
   20 total attempts per conflict observed at both the network response and the
   focused UI, or 20 direct API plus 20 Playwright attempts per conflict. It
   also gives the API and UI different unnamed monotonic observers. Select the
   exact population, one excluded warm-up rule, controller/browser clock
   boundaries, fixture state, and per-attempt expected write deltas. Require
   unique run/key/correlation evidence while accepted journey/version/history,
   accepted outbox, and Booking hashes remain fixed; do not require the
   legitimately appended rejection rows themselves to hash unchanged.
2. **Make the retry failure injection and all three recovery clocks
   executable.** `performance-requirements.md` / **Healthy Publication and Retry
   Timing**, `reliability-requirements.md` / **Fenced Relay Recovery**, and
   `tech-stack-decisions.md` / **Measurement and Failure Injection** do not name
   how one event ID is selected for a one-shot retryable publisher failure, how
   the seam is armed/released, or which persisted same-clock timestamp makes
   `nextAttemptAt <= failure + 5 s` testable. They then use
   `broker-restored observation` even though the selected adapter failure does
   not necessarily stop the broker. Define one run-scoped event-targeted seam,
   one due-time comparison from the injected service clock, one controller
   recovery time zero (later of observed seam release/broker readiness and
   observed row due), and independent <=30-second CMM PUBLISHED, Booking DB
   APPLIED, and Booking UI APPLIED endpoints with polling cadence.
3. **Resolve the redelivery receipt/disposition contradiction.**
   `scalability-requirements.md` / **Booking Ten-Record Ordering Window** first
   makes record 2 APPLIED and then says its redelivery returns a *stored*
   DUPLICATE with no new receipt; `reliability-requirements.md` /
   **Transaction and Idempotency Reliability** repeats that wording. One unique
   event-ID receipt cannot simultaneously preserve its original APPLIED result
   and already contain a stored DUPLICATE result. Align with the application
   repository contract: specify whether the original receipt remains APPLIED
   and DUPLICATE is separate delivery-attempt/audit evidence, or explicitly
   define the permitted receipt-state transition and projection invariants.
   Then state the exact final receipt rows and dispositions for all nine unique
   IDs without introducing `DUPLICATE_SEQUENCE`; equal/lower positive unique
   IDs remain STALE.
4. **Make the ten-delivery fixture and observer deterministic.**
   `scalability-requirements.md` / **Booking Ten-Record Ordering Window** calls
   the set one assigned container while also requiring invalid-booking and
   unassigned-container events, and gives no identities that make those two
   rejection branches distinct. Name the booking/equipment identity for every
   record, the legacy occurrence/classifier/received/event ordering inputs, the
   expected disposition counts and unchanged projection hashes, the producer
   acknowledgement that starts the single monotonic window, and the polling
   endpoint/cadence. This must yield exactly 10 deliveries, nine unique event
   IDs/receipts, and one strongest projection without relying on arrival timing.
5. **Separate CMM publisher retry evidence from Booking-owned retry/degraded UI
   evidence.** The injected pre-broker CMM publication failure in
   `reliability-requirements.md` cannot create a Booking PROCESSING/RETRYABLE
   receipt because Booking has not received the event, while U02's functional
   design and B02 DoD require Booking-owned pending/applied/retry/degraded
   presentation. Add a bounded Booking-consumer failure/health fixture with
   exact receipt/health writes and UI observations, or explicitly identify the
   existing U02 evidence that proves those states. Keep pre-receipt publication
   pending CMM-owned and preserve the no Booking-to-CMM query boundary.

## Builder Remediation after Review Iteration 1

The builder defined four independent 20-sample API/UI populations with exact
clocks and rejection-only write deltas; added run-scoped event-targeted,
fail-once publisher and Booking-consumer seams with same-clock due evidence and
independent recovery endpoints; preserved each original receipt disposition
while recording redelivery DUPLICATE separately; and fixed all identities,
counts, comparator inputs, hashes, cadence, and time zero for the ten-delivery,
nine-receipt fixture.

## Review Iteration 2

**Verdict: NOT-READY**

Iteration-1 findings 1 and 5 are materially resolved: the four rejection
populations now have exact sizes, warm-ups, clock endpoints, write deltas, and
stable accepted-state hashes; CMM pre-broker retry is separated from
Booking-owned PROCESSING/RETRYABLE/consumer-health UI evidence. The stack,
version, scope, W1 BLOCKED/waiver, W2-02 synchronization, demo guard, and
serialized isolated-stack boundaries also remain correct. Three executable
contract gaps remain at the final reviewer iteration:

1. **Use only controller-observed monotonic instants for both recovery
   windows, and define the Booking retry fence.** `performance-requirements.md`
   / **Healthy Publication and Retry Timing** still defines publisher recovery
   time zero as the later of controller readiness observations and the service-
   clock value `nextAttemptAt`; those clocks cannot be compared directly. Use
   the later controller-monotonic observation of (a) seam disarmed plus broker
   ready and (b) a database predicate proving the row is due. The Booking
   consumer paragraph has no explicit time zero at all and calls the retry
   "fenced" without naming the conditional receipt state/worker-token-version
   or equivalent ownership predicate. Define its due observation, monotonic
   start, and conditional completion set before applying the 30-second DB/UI/
   health targets.
2. **Serialize or partition the ten-delivery fixture so its claimed order is
   reproducible.** `scalability-requirements.md` / **Booking Ten-Record Ordering
   Window** assigns different booking/equipment payload identities to the two
   REJECTED records, while the binding application contract keys status events
   by booking+container. Producer acknowledgements therefore do not guarantee
   the stated consumer order across Kafka partitions. Specify one valid
   partition-key strategy that does not falsify the payload contract, or submit
   each record only after the prior durable disposition is observed. Also make
   the <=30-second endpoints explicit for all nine receipts and the final
   projection/UI, rather than relying only on a record-1 acknowledgement and a
   generic DB/UI polling statement.
3. **Reconcile the immutable receipt model with the binding functional and
   application contracts.** The remediated NFR artifacts correctly preserve
   P4's original APPLIED receipt and record redelivery DUPLICATE as separate
   delivery/audit evidence, but `functional-design/business-logic-model.md` /
   **Booking Consumption** and `business-rules.md` / **Booking Ordering Rules**
   still say a replayed envelope loads a stored DUPLICATE disposition. The
   application `MovementStatusProjectionRepository` exposes receipt insert/
   disposition methods but no typed duplicate-delivery evidence operation.
   Align those upstream semantics and name the owned persistence operation so
   implementation cannot either mutate APPLIED into DUPLICATE or silently omit
   the required durable duplicate evidence. Equal/lower positive unique events
   must remain STALE; do not add `DUPLICATE_SEQUENCE`.

## Builder Remediation after Review Iteration 2

The final independent verdict remains NOT-READY because the two-iteration limit
is exhausted. Builder remediation now uses controller-observed database-clock
due predicates for both recovery windows; applies an event/state/worker/token/
version Booking receipt fence; serializes the ten-record proof by awaiting each
durable disposition; and aligns functional semantics around immutable original
receipts plus the named Booking-owned `appendDuplicateDeliveryEvidence`
operation. No third review is invented.

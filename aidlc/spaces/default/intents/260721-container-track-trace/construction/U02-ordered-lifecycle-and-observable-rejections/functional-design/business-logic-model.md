# Business Logic Model - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

This model specializes U02 from `unit-of-work.md` and
`unit-of-work-story-map.md`, implements FR-04 through FR-11/13 in
`requirements.md`, and follows `components.md`, `component-methods.md`, and
`services.md`. U01 remains migration/intake owner; U03 retains authorization
outage/degraded-read depth.

## Accepted Movement Workflow

After REST authentication/mapping and fresh application authorization, validate
Reference Data and convert the request to typed values. In one local CMM
transaction: lock the journey/version, append the capture attempt, and claim the
request key. A `New` claim evaluates exactly once and completes the immutable
accepted disposition in this same transaction; existing claims never
re-evaluate. The transaction appends the accepted movement, updates snapshot/
lifecycle/next move, appends actor/correlation
audit, and creates one pending status outbox row. Commit returns
`CaptureAccepted`; publication is post-commit.

| Current | Required next | ACT/load state | Result | Sequence |
| --- | --- | --- | --- | --- |
| Allocated | GTOT | ACT/LADEN | Gated-out | 1 |
| Gated-out | LOAD | ACT/LADEN | In-transit | 2 |
| In-transit | DISC | ACT/LADEN | Discharged | 3 |
| Discharged | GTIN | ACT/EMPTY | Returned-empty | 4 |

Location uses exact `location.unLocationCode`; LOAD is at POL, DISC at POD, and
GTOT/GTIN use the validated operational location. `occurredDateTime` cannot be
after injected `Clock.instant()`.

## Validation and Conflict Decision Tree

1. Boundary shape/type/required-field or invalid/inactive Reference Data returns
   400 field errors before the idempotency claim. Reference Data unavailability
   instead returns a retryable dependency/degraded outcome whose depth belongs
   to U03. Both paths write no attempt/request/rejection/domain/outbox database
   row and retain only correlated boundary-log evidence.
2. A duplicate accepted occurrence reached with a new key completes that new key as rejected and commits attempt + rejection + audit only.
3. Existing same/conflicting key or concurrent loser returns HTTP 409 `DUPLICATE_MOVEMENT` without re-evaluating; it commits attempt + rejection + audit only and never changes the original disposition.
4. Valid new request with code different from the aggregate's required next code returns HTTP 409 `OUT_OF_SEQUENCE_MOVEMENT`.
5. The out-of-sequence transaction appends attempt, rejected request disposition, rejection evidence, and audit only; accepted state/outbox/Booking stay unchanged.
6. A corrected new request reuses preserved form values with a new idempotency key and is evaluated once.

Same-key/same-fingerprint and same-key/different-fingerprint both use the wire
code `DUPLICATE_MOVEMENT`; `reason` distinguishes replay from
`IDEMPOTENCY_KEY_REUSED`. Original movement/rejection evidence is optional when
available, while stable reason/correlation/current/required-next evidence is
always returned.

## Outbox Recovery

The relay atomically changes PENDING/RETRYABLE to IN_PROGRESS and records worker
ID, unique claim token, incremented version, claimed time, and attempt count.
Only a conditional update matching event ID, current `IN_PROGRESS`, worker ID,
claim token, and claim version may mark PUBLISHED, RETRYABLE, or
FAILED_PERMANENT. Expired-lease recovery matches event ID, `IN_PROGRESS`, worker
ID, claim token, claim version, and `leaseExpiresAt <= Clock.instant()` before
incrementing the version into RETRYABLE, so an old worker cannot complete.
Publish-before-lease-loss may redeliver at least once; CMM never reruns the
domain transition during relay retry.

## Booking Consumption

Booking validates schema enough to identify the event, then inserts/locks a
unique durable receipt before assignment/order classification in the same
transaction as any projection update. Replayed envelope ID leaves its stored
original receipt disposition unchanged, returns DUPLICATE for the current
delivery, and calls Booking-owned `appendDuplicateDeliveryEvidence(eventId,
partition, offset, observedAt, correlationId)` in the same duplicate-handling
transaction; a different event with equal positive sequence is
STALE; lower positive is also STALE; only strictly higher positive is
APPLIED. Sequence 0 uses existing occurrence/classifier fallback. Invalid
booking/unassigned container completes the inserted receipt as REJECTED. Only
APPLIED updates latest status.
Every disposition is durable/auditable and never creates a CMM query.

## UI Update Workflow

The capture client retains draft values through validation/409 responses,
focuses an error summary, links field issues, states the required next action,
and exposes original/current evidence without raw broker internals. Pending
prevents double submit. Accepted commit refreshes only CMM-owned lifecycle,
next action, and timeline; Booking states update asynchronously through its own
service/UI. Accepted replay refreshes CMM state; rejected replay/key conflict
retains values and requests a new key only after correction; sequence conflict
highlights the required next move. Rejections never optimistically advance. The
exact tagged wire union is:

- `accepted`: required journey, movement, publication `pending|published`, and
  correlation;
- `validation`: required field-error map, summary, preserved input, correlation;
- `duplicate`: required code `DUPLICATE_MOVEMENT`, reason, correlation, current
  lifecycle, required-next code, preserved input; original movement or
  rejection evidence is optional;
- `out-of-sequence`: required code `OUT_OF_SEQUENCE_MOVEMENT`, correlation,
  current lifecycle, required-next code, and preserved input;
- `denied`: required HTTP 403 code, correlation, and preserved input;
- `dependency-unavailable`: required retryable dependency code, correlation,
  retry guidance, and preserved input.

## Observable Scenarios

- LOAD/DISC/GTIN each emit exact seq 2/3/4 and reach Returned-empty.
- Invalid classifier, load state, equipment, location, time, or required field has zero accepted/outbox effect.
- Duplicate occurrence/key returns exact 409 and stable accepted/outbox/Booking hashes.
- Illegal next code returns exact 409 with required-next evidence and rejection-only rows.
- Relay restart/stale worker produces one logical status and safe redelivery.
- Booking receipts show APPLIED/DUPLICATE/STALE/legacy-0/REJECTED dispositions.

## Executable Contract Evolution

The current checked-in Avro lacks `sequenceNumber` and the Pact ordering tuple
is legacy. U01 adds Avro `int data.sequenceNumber` with BACKWARD default 0 and
updates AsyncAPI, examples, generated models, Pact fixtures/matchers, and both
mappers. The evolution also fixes producer/envelope source to
`container-service` and maps one-leg `data.transshipment=false`. U02 consumes
that evolved executable contract and tests sequences 2-4 plus the legacy seq-0
fallback; zero divergence is the target after evolution.

## Booking-Owned Presentation Provenance

Booking persists a `MovementStatusReceipt` processing state and a
`MovementStatusConsumerHealth` record. Booking detail derives `pending` only
from its own receipt in PROCESSING, `applied` from an APPLIED receipt plus the
matching latest projection, `delayed/retry` from a RETRYABLE receipt with
attempt/next-at evidence, and `degraded` from Booking-owned consumer-health or
permanent-processing failure. Before Booking receives the event, only the CMM
page may say publication pending from its outbox; Booking never queries CMM.

## Review Iteration 1

**Verdict: NOT-READY**

1. The accepted workflow says to "insert or load" an immutable request disposition before evaluation but never completes a newly claimed key with the accepted result. Match `component-methods.md`: claim `New`, evaluate exactly once, then atomically complete the immutable stored disposition in the same accepted transaction.
2. Duplicate write sets are not aligned. The decision tree returns stored evidence without naming writes, `business-rules.md` omits rejection evidence for duplicate rows, and the observable scenario mentions only unchanged hashes; the approved application design requires every same-occurrence, same-key, conflicting-key, and concurrent-loser conflict to commit attempt + rejection + audit only, with the original request disposition immutable.
3. Validation evidence is contradictory across the four artifacts: this model says boundary validation writes no domain row, while `domain-entities.md` says every invocation has attempt evidence. State one exact 400/reference-validation transaction set and use it consistently, distinguishing it from durable 409 rejection evidence.
4. Outbox completion fencing is incomplete. Require the conditional update to match event ID, `IN_PROGRESS`, worker ID, claim token, and claim version; define expired-lease recovery with the same stale-worker protection and retain at-least-once redelivery after publish-before-lease-loss.
5. The contract-fidelity claim is false against the current executable contracts: `contracts/avro/containermovement.status.avsc` has no defaulted integer `sequenceNumber`, AsyncAPI only references that schema, and the Pact fixture still declares the legacy occurrence/classifier/received/event ordering tuple. U02 must describe the additive Avro/AsyncAPI/Pact/example evolution and BACKWARD default `0` rather than claim zero divergence.
6. Booking receipt semantics are not exact. Separate duplicate envelope ID from an equal positive sequence carried by a different event, define that only a strictly higher positive sequence is APPLIED, and explain how invalid/unassigned input still receives a durable REJECTED receipt even though the text currently validates assignment before inserting the receipt.
7. `frontend-components.md` assigns rejection evidence to `MovementTimeline`, but the approved interface accepts only expected or actual timeline items. Either add a typed non-state-changing rejection item to the interface or keep rejection evidence in `CaptureOutcomeSummary`/the collapsed audit surface; do not leave ownership split.
8. UI recovery is underspecified and crosses ownership in this model's accepted-refresh sentence. Define reason-specific recovery (accepted replay refreshes CMM state; rejected replay/conflicting key uses a new key only after correction; sequence conflict records the required next move), and let Booking pending/applied/retry/degraded update asynchronously through Booking's owned service/UI rather than a synchronous CMM capture refresh.

## Builder Remediation after Review Iteration 1

The builder aligned the accepted claim/completion transaction, split duplicate
write sets for new versus reused keys, fixed pre-claim 400 evidence, added full
outbox fencing, documented the U01 executable-contract evolution, made Booking
receipt ordering exact, kept rejection evidence out of the state timeline, and
specified reason-specific UI recovery without crossing Booking ownership.

## Review Iteration 2

**Verdict: NOT-READY**

Iteration-1 findings 1-3, 5, 7, and 8 are materially resolved. Findings 4 and 6 remain incomplete, and the remediation exposes additional exact contract gaps:

1. Reference Data outcomes are still collapsed. The decision tree and `business-rules.md` make every Reference Data failure a 400 field error, but `requirements.md` requires invalid/inactive and unavailable outcomes to remain distinct. Define invalid/inactive as pre-claim field validation and unavailability as the retryable/degraded dependency outcome (U03 owns its depth); both must state the same zero-write boundary.
2. Expired-lease recovery is not the same full fence claimed by `business-rules.md`: this model lists event/state/token/version but omits worker ID and the lease-expiry predicate. Specify event ID + `IN_PROGRESS` + worker + token + version + expired-lease condition before recovery increments the version and moves the row to `RETRYABLE`.
3. `DUPLICATE_SEQUENCE` is not an approved or internally consistent Booking disposition. FR-10 permits duplicate/stale/applied classification, `domain-entities.md` lists `APPLIED/DUPLICATE/STALE/REJECTED`, and the observable scenarios omit `DUPLICATE_SEQUENCE`. Keep replayed envelope ID as `DUPLICATE`; classify a different event whose positive sequence is equal to or below the current positive sequence as `STALE`, unless the upstream contracts are explicitly changed.
4. The capture response shape still disagrees across artifacts. This model says duplicate responses always include current/required-next evidence; `frontend-components.md` omits those duplicate fields; and the approved TypeScript out-of-sequence variant omits both the explicit `OUT_OF_SEQUENCE_MOVEMENT` code and current lifecycle that `frontend-components.md` promises. Define one tagged wire union, including which evidence is required versus optional for each reason.
5. Executable-contract fidelity is not limited to `sequenceNumber`. The required Avro field `data.transshipment` is absent from the domain field model/event-factory behavior (the thin one-leg value should be explicitly `false`), and the checked-in example/Pact producer uses `container-movement-service` while the enterprise contract and approved factory require envelope source `container-service`. Include these in the U01 evolution consumed and verified by U02.
6. Booking UI state ownership remains non-implementable as written. The artifacts promise Booking pending/applied/delayed-retry/degraded states while forbidding Booking-to-CMM queries, but do not identify the Booking-owned persisted/health signal that derives each pre-publication or retry state. Map each label to Booking-owned data/consumer health, and distinguish operator-entered movement fields from BFF-generated correlation/idempotency/source values.

## Builder Remediation after Review Iteration 2

The final independent verdict remains NOT-READY because the two-iteration limit
is exhausted. Builder remediation separates invalid/inactive references from
dependency outage, fully fences lease recovery, uses only approved Booking
dispositions, fixes the capture union, completes event-envelope fidelity, and
defines Booking-owned receipt/health provenance plus the BFF-generated fields.

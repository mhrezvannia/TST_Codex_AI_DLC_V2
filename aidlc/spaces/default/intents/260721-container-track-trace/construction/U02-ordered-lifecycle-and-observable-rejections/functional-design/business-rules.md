# Business Rules - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

Rules implement U02 in `unit-of-work.md`, its `unit-of-work-story-map.md`
assignments, `requirements.md`, and the approved `components.md`,
`component-methods.md`, and `services.md` contracts.

## Lifecycle Invariants

- Only GTOT -> LOAD -> DISC -> GTIN is accepted; each code occurs once.
- Lifecycle is Allocated -> Gated-out -> In-transit -> Discharged -> Returned-empty.
- GTOT/LOAD/DISC require ACT/LADEN; GTIN requires ACT/EMPTY.
- Accepted sequence is exactly 1-4 and stored as non-negative integer.
- LOAD location is POL and DISC location is POD; all locations/equipment are canonical active references.
- An accepted transaction includes request disposition, attempt, movement, versioned snapshot, audit, and one status outbox row.

## Validation Rules

Required typed command values are movement code, ACT classifier, equipment,
UN/LOCODE, occurred time, source, correlation, idempotency key, and empty
indicator. The operator enters code, equipment, location, occurred time, and
empty state; the BFF supplies authenticated source `container-service`, a
correlation ID, and an idempotency key stable for one uncorrected submission.
Occurrence is UTC and
not after injected `Clock.instant()`. Validation/reference failures are
field-linked, preserve input, and happen before the idempotency claim. Invalid
or inactive references return 400 field errors. Reference Data unavailability
returns a retryable dependency/degraded result (U03 owns its depth). Both
create no attempt, request-disposition, rejection, domain, or outbox database
row; only correlated boundary-log evidence is retained.
authorization denial remains U03 depth but always precedes domain evaluation.

## Rejection and Idempotency Rules

| Condition | HTTP/code | Durable write set | Forbidden changes |
| --- | --- | --- | --- |
| Same accepted occurrence, new key | 409 `DUPLICATE_MOVEMENT` | new rejected disposition + attempt + rejection + audit | snapshot, accepted ledger, outbox, Booking |
| Reused request key, any fingerprint, or concurrent loser | 409 `DUPLICATE_MOVEMENT` | attempt + rejection + audit; original disposition remains immutable | aggregate re-evaluation and accepted effects |
| Wrong next movement | 409 `OUT_OF_SEQUENCE_MOVEMENT` | attempt + rejected disposition + rejection + audit | snapshot, accepted ledger, outbox, Booking |
| Valid required-next movement | accepted | full accepted transaction set | partial commit |

Concurrent request-key claims have one immutable winner; losers append attempt,
rejection, and audit evidence and return the committed result/code without
double advancement.

## Publication Rules

- Status mapper uses persisted canonical values; no hard-coded LADEN/location.
- Claim records event ID, `IN_PROGRESS`, worker, unique token, incremented
  version, claim time, and attempt count. Complete-to-published/retry/permanent
  failure requires equality on event ID, state, worker, token, and claim
  version. Expired-lease recovery additionally requires the persisted lease to
  be expired at the injected clock, uses the same full fence, and increments
  version into RETRYABLE.
- Retry uses bounded configured backoff; permanent serialization/schema errors terminate visibly.
- Publication is at least once, including possible redelivery after publish
  before lease loss; idempotent Booking receipts make redelivery safe.

## Booking Ordering Rules

- Booking validates enough schema to identify event ID, then inserts or locks the
  unique receipt before assignment or ordering classification.
- Replayed envelope ID preserves the stored original receipt disposition,
  returns `DUPLICATE` for that delivery, and persists it through Booking-owned
  `appendDuplicateDeliveryEvidence`; a different event with positive sequence
  equal to or below current is `STALE`; only a
  strictly higher positive sequence is `APPLIED`.
- Legacy sequence 0 uses occurrence/classifier fallback and cannot weaken positive state.
- Invalid booking or unassigned container completes the inserted receipt as
  `REJECTED` and never projects.
- Booking stores latest-only fields and link key, never the CMM full timeline.

## UI Rules

- Keep capture values for validation and both 409 codes.
- Focus/announce summary, state exact recovery action, and never rely on color.
- Do not refresh/advance on rejection; refresh server state only after accepted commit.
- Booking derives pending from its PROCESSING receipt, applied from APPLIED
  receipt plus latest projection, delayed/retry from RETRYABLE receipt attempt/
  next-at evidence, and degraded from its own consumer-health/permanent-failure
  state. Pre-receipt publication pending is CMM-owned; Booking never queries CMM.
- Use shared shell/tokens and Container Movement-owned composition only.

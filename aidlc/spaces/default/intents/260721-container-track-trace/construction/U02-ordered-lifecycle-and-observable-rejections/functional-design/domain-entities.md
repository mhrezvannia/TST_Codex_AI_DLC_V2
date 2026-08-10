<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). Enforces contract/DCSA field fidelity and typed value objects. -->

# Domain Entities - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

Entities specialize U02 in `unit-of-work.md` and
`unit-of-work-story-map.md`, implement `requirements.md`, and retain the
`components.md`, `component-methods.md`, and `services.md` boundaries.

## Ubiquitous Language

Movement is an accepted DCSA ACT equipment event. Attempt is every authorized,
typed manual request that reaches the idempotency claim. Request disposition is
the immutable idempotency decision.
Rejection is durable business-conflict evidence. Receipt/disposition is
Booking's transport-consumption fact, distinct from manual HTTP rejection.

## Entities & Aggregates

`ContainerJourney` remains the aggregate root with stable booking/equipment
identity, monotonic revision/version, ordered expected movements, accepted
movement ledger, lifecycle, and next code. `CaptureAttemptEvidence`,
`CaptureRequestDisposition`, `MovementRejection`, `AuditRecord`, and
`StatusOutboxEntry` are append-only/immutable transaction participants.
Booking owns `MovementStatusReceipt` and `LatestContainerStatusProjection`.
It also owns `MovementStatusConsumerHealth`; receipt processing state is
PROCESSING, RETRYABLE, APPLIED, DUPLICATE, STALE, or REJECTED, while final
domain disposition remains APPLIED/DUPLICATE/STALE/REJECTED.

## Field-Level Schema (canonical names)

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| movement code | enum | `data.moveCode` | DCSA/status Avro | GTOT/LOAD/DISC/GTIN |
| classifier | enum | `data.eventClassifierCode` | DCSA | ACT for accepted actuals |
| occurred/received | `Instant` | `data.occurredDateTime` / `receivedDateTime` | status Avro | distinct UTC values |
| lifecycle | enum | `data.derivedStatus` | LinerCore | GATED_OUT/IN_TRANSIT/DISCHARGED/RETURNED_EMPTY |
| empty state | enum | `data.emptyIndicatorCode` | DCSA | LADEN then EMPTY |
| location | value object | `data.location.unLocationCode` | UN/LOCODE | optional facility fields retained |
| sequence | Java `int`, DB `integer` | Avro `int data.sequenceNumber` | v1 additive | 1-4 actual, default 0 |
| transshipment | boolean | `data.transshipment` | status Avro | always false in the one-leg slice |
| envelope source | fixed string | `source` | enterprise envelope | `container-service` |
| request key | `IdempotencyKey` | `idempotencyKey` REST | CMM | immutable disposition key |
| correlation | `CorrelationId` | envelope `correlationId` | LinerCore | cross-evidence key |
| disposition | enum | internal `APPLIED/DUPLICATE/STALE/REJECTED` | Booking | durable receipt outcome |

## Contract Fidelity Check

The current checked-in Avro has no `sequenceNumber` and its Pact ordering tuple
is legacy. U01 evolves Avro with BACKWARD-defaulted `int data.sequenceNumber =
0` and aligns AsyncAPI, examples, generated models, Pact fixtures/matchers,
producer source `container-service`, one-leg `transshipment=false`, and both
mappers. U02 consumes that evolved contract and proves sequences 2-4 plus
legacy 0. No additional public field or DCSA API is introduced. `movementId` is actual
movement identity; it is never treated as journey identity. Status mapping is
fully derived from persisted accepted movement/snapshot values. Zero divergence
is the post-evolution target, not a claim about the current repository.

## Invariants & Validation

- Journey version and sequence advance once per accepted next code.
- Request disposition never changes after completion.
- Every authorized typed request reaching the claim has attempt evidence;
  business conflict also has rejection evidence. Pre-claim shape/reference
  validation writes no attempt/request/rejection/domain/outbox row and retains
  only correlated boundary-log evidence.
- Rejection cannot update accepted state or create status outbox.
- Receipt disposition is durable even when projection is unchanged.
- Booking UI state is derived only from its receipt processing state, latest
  projection, and consumer-health record; no CMM query is permitted.
- Validation converts external values to typed domain values before transition evaluation.

## Lifecycle / State

| Current | Accepted command | Next | Sequence/load state |
| --- | --- | --- | --- |
| Allocated | ACT GTOT | Gated-out | 1/LADEN |
| Gated-out | ACT LOAD | In-transit | 2/LADEN |
| In-transit | ACT DISC | Discharged | 3/LADEN |
| Discharged | ACT GTIN | Returned-empty | 4/EMPTY |

Any other next code returns `OUT_OF_SEQUENCE_MOVEMENT`. Repeated occurrence or
request key returns `DUPLICATE_MOVEMENT` without lifecycle transition.

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All canonical names confirmed from contracts/DCSA (recommended)
   - B. Some names need a domain-expert decision (list them)
   - X. Other
   - `[Answer]:` A. Exact evolved v1 contract names/types are fixed by U01.

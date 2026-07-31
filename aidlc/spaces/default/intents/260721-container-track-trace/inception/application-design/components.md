# Components - W2-04 Container Journey & Track-Trace

## Design Basis and Boundary Rules

This component design implements `requirements.md` FR-01 through FR-14 and the
vertical outcomes in `stories.md` US-01 through US-09. It extends the brownfield
hexagonal/event-driven architecture described in `architecture.md` and the
existing seams inventoried in `component-inventory.md`. It follows
`team-practices.md`: PB-01 remains the first walking skeleton, databases remain
service-owned, domain code remains framework-free, Kafka is the normal
cross-module path, and UI composition stays inside the shared shell.

The design does not create a new backend service. It evolves the existing
Container Movement bounded context, the existing Booking projection seam, the
authoritative Identity catalog, and a new CMM-owned Next.js application. No
component owns EDI, a public DCSA API, fleet/depot stock, multi-leg routing,
condition/lease behavior, D&D, or M&R.

## Container Movement Domain Components

### `ContainerJourney` aggregate root

- **Purpose:** own one booking/container journey, its one-leg expected plan,
  accepted actual movement history, current lifecycle, and monotonic sequence.
- **Responsibilities:** create/reconcile from a confirmed booking; retain exactly
  expected LOAD@POL then DISC@POD; submit candidate movements to the transition
  policy; apply only accepted decisions; expose current lifecycle and next code.
- **Public interface:** factory/reconcile, `evaluateCapture`, `applyAccepted`,
  read-only identity/plan/history/lifecycle/next-move accessors.
- **Boundary:** no Spring, SQL, Kafka, HTTP, Identity, or Reference Data code. It
  never appends audit/outbox rows and never treats transport replay as a manual
  capture result.

### DCSA movement value model

- **Types:** `EquipmentEventCode` (GTOT, LOAD, DISC, GTIN in this slice),
  `EventClassifierCode` (PLN/ACT used here), `EmptyIndicatorCode`,
  `MovementSequence`, `EquipmentReference`, `UnLocationCode`,
  `MovementOccurrence`, and `ExpectedMovement`.
- **Purpose:** make DCSA/ISO/UN/LOCODE names and validation explicit without
  leaking Avro records into the domain.
- **Boundary:** vocabulary extension outside the four ACT codes is rejected by
  the thin-slice policy even though the wire field remains a string.

### `MovementTransitionPolicy`

- **Purpose:** make legal ordering and lifecycle derivation one deterministic,
  testable policy.
- **Rules:** GTOT/LADEN -> Gated-out/1; LOAD/LADEN -> In-transit/2;
  DISC/LADEN -> Discharged/3; GTIN/EMPTY -> Returned-empty/4.
- **Outputs:** accepted decision with next lifecycle/sequence, or stable
  `DUPLICATE_MOVEMENT` / `OUT_OF_SEQUENCE_MOVEMENT` rejection containing the
  original occurrence or required next code.
- **Boundary:** no persistence or clock access; request identity duplication is
  supplied by the application layer, while semantic occurrence duplication is
  evaluated from aggregate history.

### `CaptureMovementResult`

- **Purpose:** targeted sealed result for this use case rather than a universal
  project-wide Result migration.
- **Variants:** application results `CaptureAccepted` and `CaptureRejected`.
  Domain-decision types remain separately named `MovementAccepted` and
  `MovementRejected`.
- **Boundary:** REST maps a rejected result to HTTP 409; Kafka replay and
  infrastructure failures use their existing adapter-specific outcomes.

## Container Movement Application Components

### `JourneyIntakeUseCase`

- **Purpose:** consume a mapped `booking.confirmed`, authorize the Booking
  service identity, validate active route references, dedupe the envelope, and
  create/reconcile one journey.
- **Atomic effects:** journey snapshot, intake request identity, audit, and a
  planned sequence-0 `containermovement.status` outbox fact (`PLN LOAD` at POL).
- **Boundary:** invoked by the existing thin Kafka listener; never calls Booking
  synchronously.

### `MovementCaptureUseCase`

- **Purpose:** authoritative transaction boundary for manual capture.
- **Request authority:** receives an explicit `CaptureRequestContext` containing
  the authenticated subject, correlation, idempotency key, and request
  fingerprint. No adapter-global/thread-local identity is part of the contract.
- **Accepted effects:** append capture attempt and accepted movement, update
  snapshot/lifecycle, complete request identity, append audit, and enqueue one
  ACT status fact.
- **Rejected effects:** append capture attempt, complete a new request identity
  when applicable, append rejection/audit evidence only, and return a
  stable rejection result. Journey snapshot, accepted ledger, status outbox,
  and Booking projection remain untouched.
- **Boundary:** authenticates the request subject through Identity and validates
  location/reference freshness before the aggregate decision.

### `JourneyQueryUseCase`

- **Purpose:** supply list/detail DTOs for the CMM BFF, including expected and
  actual timeline items, next code, lifecycle, publication state, and collapsed
  audit evidence.
- **Boundary:** reads CMM-owned stores only. It never reconstructs Booking state
  or exposes raw broker payloads in the primary operator DTO.

### Persistence ports and adapters

| Component | Ownership and responsibility |
|---|---|
| `JourneyRepository` / `JdbcJourneyRepository` | Versioned current snapshot and list/detail lookup. |
| `MovementLedgerRepository` | Append/read accepted ACT occurrences and their sequence 1-4. |
| `CaptureRequestRepository` | Atomically claims a key/fingerprint, serializes concurrent attempts, and stores the immutable accepted/rejected result for replay. |
| `CaptureAttemptRepository` | Append-only evidence for every accepted, rejected, same-request replay, and conflicting-fingerprint attempt. |
| `RejectionEvidenceRepository` | Durable duplicate/out-of-sequence reason, actor, target, expected/original evidence, correlation, and time, linked to an attempt. |
| `OutboxRepository` | Enqueue/claim/retry/publish state with the canonical Java lifecycle and token/version fencing on every claimed completion. |
| `AuditRepository` | Existing security/domain audit stream; keeps accepted, denied, and rejected outcomes queryable. |

All adapters use one ordered Flyway chain. `container_journeys.snapshot` remains
the aggregate rehydration source during this slice; append-only ledgers provide
durable operational/evidence detail without a risky full normalization rewrite.

### Contract and messaging adapters

- `BookingConfirmedRecordMapper` and `KafkaBookingConfirmedListener` remain thin
  inbound adapters.
- `MovementStatusEventMapper` maps a specific planned or accepted movement fact,
  never infers generic transport codes from the whole snapshot.
- `KafkaContainerMovementEventPublisher` registers/serializes the producer-owned
  v1 record and keys it by booking+container.
- The scheduled relay owns retry and canonical outbox state transitions; it
  publishes only committed outbox rows.

### REST and authorization adapters

- `ContainerMovementApiController` exposes list/detail/capture and maps stable
  validation/denied/not-found/conflict outcomes with the incoming correlation.
- `IdentityAuthorizationAdapter` evaluates exact
  `container-movement:read` and `container-movement:capture-movement` tuples.
- Authenticated request/session subject is authority; actor query/body fields
  are not accepted as authorization input. Consumer actions use explicit service
  identities.

Idempotency is application-owned before the domain transition: a new key is
claimed and completed in the same transaction; the same key/fingerprint returns
`DUPLICATE_MOVEMENT` and includes its stored accepted or rejected disposition as
original evidence, while the same key with a different fingerprint returns
`DUPLICATE_MOVEMENT` with reason `IDEMPOTENCY_KEY_REUSED`. Every invocation gets
append-only attempt/rejection/audit evidence. A concurrent unique-key conflict
waits for or reads the winner and follows the same duplicate rules. Existing
request dispositions are immutable on same/conflicting-key attempts.

## Booking Return-Path Components

- `KafkaContainerMovementStatusListener` and
  `ContainerMovementStatusRecordMapper` remain thin inbound adapters and add the
  defaulted `sequenceNumber` field.
- `BookingApplicationService.consumeMovementStatus` retains the transactional
  booking/container invariant, durable receipt, projection disposition, and
  audit boundary.
- `JdbcMovementStatusProjectionRepository` adds positive-sequence ordering as
  the primary comparator; sequence 0 retains the existing occurrence/classifier/
  received/event fallback. It still stores only the latest status per container.
- Booking detail extends its existing status panel with sequence-aware
  pending/applied/degraded presentation and an authorized canonical CMM link;
  it does not copy the CMM timeline.

## Identity Components

- `PermissionAction` gains exact `CAPTURE_MOVEMENT("capture-movement")` support
  if it is not already representable.
- `MvpAuthorizationCatalog` owns
  `perm-container-movement-read` and
  `perm-container-movement-capture` plus grants: Equipment Control receives both;
  Customer Service receives read only.
- `AuthorizationPolicyEvaluator` and the existing internal authorization route
  remain authoritative. CMM local shortcuts are restricted to explicit local/
  test profiles; non-local profiles fail closed.

## Container Movement Frontend Components

The new `apps/container-movement` app owns domain routes and imports shared
packages only. It does not reproduce shell chrome or edit `packages/ui`.

| Component | Responsibility | Rendering/state boundary |
|---|---|---|
| Journey list route | filters, count, pagination, table/record-list results | Server read; focused client filter controls. |
| Journey detail route | identity, facts, lifecycle, expected/actual timeline, Booking link, audit disclosure | Server read with route loading/error boundaries. |
| `MovementTimeline` | one semantic ordered list of expected and actual items | Server-renderable, no transport payload in primary view. |
| `MovementCapturePanel` | ACT code/location/time/input and submit/retry flow | Focused client component with local preserved form state. |
| `CaptureOutcomeSummary` | accepted, duplicate, sequence, denied, validation, pending evidence | Persistent focus/live region; toast is supplemental only. |
| CMM BFF routes/client | session propagation, correlation/idempotency creation, backend DTO mapping | Server-side authority bridge; no actor fallback. |

At 1024/1440 the capture panel is beside the timeline; at 768 it uses the shared
accessible Drawer; at 375 it expands in flow. Persisted reads may render as
labelled last-known data only after Identity authorizes that read request. An
Identity denial/unavailable decision never serves a new read. Reference Data
unavailability may label already-authorized persisted route facts last-known and
disables capture until reference freshness returns.

## Ownership and Change Boundary

W2-04 owns the CMM backend changes, CMM app, status contract producer changes,
and necessary Booking consumer/projection/detail adaptation. W2-02 retains
ownership of the shared shell and `packages/ui`; W2-04 records a missing shared
primitive instead of independently implementing one. The integration branch
owns final shell/Nginx/Compose reconciliation after W2-02 merges.

## Traceability Summary

| Component group | Requirements | Stories |
|---|---|---|
| Journey/value/policy | FR-01, FR-02, FR-04, FR-05, FR-07 | US-01, US-03 |
| Rejection/request evidence | FR-06, FR-07 | US-04, US-05 |
| Status outbox/messaging | FR-08, FR-09 | US-03, US-06 |
| Booking projection | FR-09, FR-10, FR-11 | US-06, US-07 |
| Identity adapters/catalog | FR-12 | US-08 |
| CMM frontend | FR-03, FR-13 | US-02 through US-05, US-08 |
| Live/evidence seams | FR-14 | US-09 |

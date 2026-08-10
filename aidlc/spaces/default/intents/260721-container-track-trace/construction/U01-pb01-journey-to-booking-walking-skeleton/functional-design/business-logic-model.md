# Business Logic Model - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

This model implements U01 from `unit-of-work.md` and its assignments in
`unit-of-work-story-map.md`, specializes FR-01 through FR-14 in
`requirements.md`, and follows application `components.md`,
`component-methods.md`, and `services.md`. It stops after GTOT plus one
DISC-before-LOAD rejection; U02/U03 retain their approved boundaries.

## Booking-confirmed Intake

```mermaid
sequenceDiagram
  participant B as Booking/Kafka
  participant L as KafkaBookingConfirmedListener
  participant A as CMM application service
  participant R as Reference Data
  participant D as CMM database
  participant O as Status outbox relay
  B->>L: Schema-valid booking.confirmed
  L->>A: consumeBookingConfirmed(envelope)
  A->>D: read completed intake disposition by event ID
  alt replay of completed identity
    A->>D: return stored disposition; append replay audit
  else invalid assignment/reference
    A->>R: validate route/equipment/location IDs
    A->>D: append failed intake receipt/audit only
  else new or higher supported revision
    A->>R: validate route/equipment/location IDs
    A->>D: atomic journey + plan + seq0 status + receipt + audit
    D-->>O: pending containermovement.status
  end
```

Algorithm:

1. Deserialize and validate the producer-owned envelope before domain conversion.
2. Validate required envelope `id`, `source`, logical `type=booking.confirmed`, `time`, `correlationId`, and supported `dataSchemaVersion`; read an existing completed disposition by `eventId` before any external reference call, without creating an IN_PROGRESS row.
3. If the completed identity exists, return its stored OPENED/RECONCILED/STALE/PERMANENT_FAILED disposition truthfully and append replay audit without revalidation or business mutation. If absent, validate external references, then start one local transaction that inserts the unique receipt together with business effects. Concurrent insert losers load the winner's committed disposition; a crash before the transaction leaves no claim, and a crash inside it rolls everything back for retry.
4. Require exactly one `data.routing[]` item with valid `legSequence`, `loadUnLocode`, `dischargeUnLocode`, and `voyageId`, plus exactly one `data.equipment[]` assignment with `quantity=1`, supported `equipmentTypeCode`, and non-null ISO-6346 `equipmentId`; map `equipmentId` to `EquipmentReference` and validate active references.
5. On invalid input, complete the intake receipt as failed with stable reason/correlation and no partial journey.
6. Look up by stable `(bookingId, equipmentId)`. Create once; equal revision is idempotent, lower revision is STALE, compatible higher revision reconciles monotonic `bookingRevision`, and incompatible reassignment fails without a second journey. New state is Allocated with expected LOAD@POL then DISC@POD and next actual GTOT.
7. In one transaction persist snapshot, expected ledger, intake receipt, audit, and seq-0 PLN LOAD `containermovement.status` outbox row.
8. Relay only committed outbox rows through Kafka; publication retry never reruns domain creation.

## Migration, Backfill, Restart, and Forward Repair

U01 coordinates two service-owned ordered Flyway chains without cross-database
SQL. The CMM chain owns typed snapshot columns, expected/actual ledgers,
intake/capture request and attempt evidence, rejection evidence, and corrected
outbox state/check constraints. The Booking chain owns durable movement-status
receipts, dispositions, sequence, and latest-projection changes. New required
semantics are nullable or deterministically backfilled before NOT NULL or
uniqueness enforcement.

Each service snapshots its own counts/checksums, migrates/backfills existing
rows, restarts, reads its owned projection through its API, and executes its own
idempotent forward-repair path. Re-running repair changes zero already-correct
rows. Destructive volume reset is prohibited.

## First GTOT Capture

1. REST authenticates and maps request/subject/correlation; it does not decide authorization.
2. The application service asks Identity for `container-movement:capture-movement` on every request.
3. Validate external Reference Data, then convert equipment, ACT classifier, GTOT code, LADEN indicator, UN/LOCODE, occurrence time, source, and idempotency key into typed values.
4. Start one local transaction, lock the journey, claim/load request identity, and append `CaptureAttemptEvidence`.
5. In that same transaction invoke `ContainerJourney.capture`; for Allocated + GTOT the domain returns `MovementAccepted` with Gated-out and sequence 1.
6. In the same transaction commit request disposition, capture attempt, movement ledger, versioned Gated-out snapshot, audit, and seq-1 status outbox; no intermediate claim/attempt commit exists.
7. Return `CaptureAccepted`; the UI announces success and refreshes the server-owned timeline.

## Out-of-sequence Rejection

After accepted GTOT, DISC is illegal because LOAD is next. The domain returns
`MovementRejected(OUT_OF_SEQUENCE_MOVEMENT)`. The application transaction
appends capture attempt, immutable rejected request disposition, rejection
evidence, and actor/correlation audit only. It does not update snapshot/history,
create an outbox row, or affect Booking. REST maps the result to HTTP 409 with
current lifecycle, required LOAD, stable reason, and correlation. The client
preserves entered values and focuses the accessible error summary.

## Status Publication and Booking Projection

U01 adds Avro `int data.sequenceNumber` with default `0`, represented as Java
`int` and PostgreSQL `integer` with a non-negative check, and updates AsyncAPI,
Pact, examples, generated models,
and producer/consumer mappers in the same compatible change. Seq-0 maps PLN
LOAD with `movementId=null`, `derivedStatus=ALLOCATED`, LADEN,
`location.unLocationCode=POL`, optional facility fields null,
`transshipment=false`, and persisted occurred/received times. Seq-1 maps ACT
GTOT with its movement ID, GATED_OUT, LADEN, actual location/times, and
`transshipment=false`. Both use envelope/data fields exactly as checked in:
`id/source/type/time/correlationId/dataSchemaVersion`, then `bookingRef`,
`containerRef`, `movementId`, `moveCode`, `eventClassifierCode`,
`occurredDateTime`, `receivedDateTime`, `derivedStatus`, `emptyIndicatorCode`,
`transshipment`, `location.unLocationCode/facilityCode/facilityTypeCode`, and
`sequenceNumber`. The fenced relay claims by worker/token/version, publishes to
the existing topic, and may complete only its own claim.

Every list/detail use case obtains fresh `container-movement:read`
authorization in the application service before loading the read model; REST
only authenticates/maps and never substitutes a query/body actor.

Booking validates assignment and writes a durable receipt before deciding:
positive sequence outranks lower positive values; sequence 0 retains legacy
occurrence/classifier fallback. Only an applied stronger status updates the
latest per-container projection. Booking detail does not expect `journeyId` in
the status event. Its link uses `bookingRef` to enter the CMM-owned resolver;
after fresh read authorization CMM calls
`GET /api/container-movement/bookings/{bookingReference}/journey`, obtains the
stable journey ID, and redirects to `/container-movement/journeys/{journeyId}`.
Booking never synchronously queries CMM for status delivery or stores the full
timeline.

## Scenario Evidence

- Valid booking: exactly one journey, two ordered expected moves, Allocated, seq-0 outbox/status.
- Replay: one successful duplicate intake outcome, unchanged journey/plan/outbox cardinality.
- Invalid/inactive input: failed receipt/audit and no partial journey.
- GTOT: sequence 1, Gated-out, one movement/audit/outbox, Booking latest within 30 seconds.
- DISC after GTOT: exact 409, LOAD-next evidence, rejection-only rows, stable accepted-state hashes.

## Review Iteration 1

**Verdict: NOT-READY**

The four artifacts preserve the U01 walking-skeleton boundary, real broker and
service-owned seams, exact rejection code, fenced outbox intent, accessible
CMM interaction, and the U01-owned migration obligation. The following exact
corrections are required before implementation:

1. **Replace the provisional field aliases with the checked-in Avro names.**
   `domain-entities.md` currently names status fields `journeyId`,
   `eventLocation`, `eventCreatedDateTime`, `eventReceivedDateTime`, and
   `status`, none of which are fields in `containermovement.status.avsc`.
   Specify the adapter mapping to `bookingRef`, `containerRef`, nullable
   `movementId`, `moveCode`, `eventClassifierCode`, `occurredDateTime`,
   `receivedDateTime`, `derivedStatus`, `emptyIndicatorCode`,
   `transshipment=false`, and `location.unLocationCode` (with the optional
   facility fields). Keep `journeyId` API/internal only. The current Open
   Question cannot say canonical names are confirmed while deferring those
   aliases to code generation.
2. **Define the required additive status-contract change explicitly.** The
   checked-in `containermovement.status.avsc` has no `sequenceNumber`. State
   that U01 adds an Avro `int`/`long` field (matching the approved executable
   contract type) with default `0`, updates AsyncAPI/Pact/examples/mappers in
   the same change, and maps PLN LOAD to 0 and ACT GTOT to 1. Specify all
   required planned values, including nullable `movementId`, Allocated
   `derivedStatus`, LADEN, POL location, and `transshipment=false`, rather than
   relying on a generic “canonical values” statement.
3. **Map and validate `booking.confirmed` at its actual wire shape.** The Avro
   assignment is `data.equipment[]` with `equipmentTypeCode`, `quantity`, and
   nullable `equipmentId`; it has no `equipmentReference` field. U01 must require
   exactly one routing item and one equipment assignment with `quantity=1` and
   non-null ISO-6346 `equipmentId`, then map that ID to the domain
   `EquipmentReference`. Also validate the logical envelope `type`, supported
   `dataSchemaVersion`, leg sequence, and required envelope fields before any
   domain or persistence effect.
4. **Correct the aggregate reconciliation identity.** The current business key
   `(bookingId, bookingRevision, equipmentReference)` and `BookingJourneyKey`
   including revision make a stronger revision a new key, while the approved
   service must reconcile only a stronger revision into the existing journey.
   Define a stable aggregate lookup key (booking plus assigned equipment), keep
   revision as monotonic state/concurrency evidence, reconcile a compatible
   higher revision, classify equal/stale revisions durably, and reject an
   incompatible assignment without opening a second journey.
5. **Make intake replay/claim semantics internally consistent and crash-safe.**
   The diagram calls Reference Data before checking replay, while the algorithm
   checks replay first; use the latter so a completed replay makes no external
   validation call. Do not label every completed identity
   `DUPLICATE_APPLIED`: replay the stored opened/reconciled/stale/permanent-failed
   disposition truthfully. Define how an in-progress/concurrent claim is
   observed/recovered and ensure transient Identity/Reference Data/database
   failure remains retryable without an orphan claim or permanent failed
   receipt.
6. **Keep accepted capture in one transaction.** The primary model currently
   “atomically” claims/appends the attempt in step 4, then commits disposition,
   movement, snapshot, audit, and outbox in step 6 without naming the attempt.
   After external authorization/reference validation, specify one local
   transaction containing request claim/disposition, capture attempt, accepted
   movement, snapshot/version, audit, and seq-1 outbox; the domain decision may
   not be committed across two local transactions.
7. **Preserve service-owned migration chains.** “One ordered Flyway chain” for
   CMM cannot introduce “Booking receipt support” into the CMM database. U01 may
   coordinate the vertical upgrade, but CMM migrations own journey/ledger/
   outbox changes and Booking-owned migrations own receipt/projection sequence
   changes. Define both additive chains and their independent existing-data,
   restart, and forward-repair verification without cross-database SQL.
8. **Align protected reads and routes with the approved application surface.**
   Add an explicit application-use-case authorization step for every list/detail
   read using `container-movement:read`; frontend wording that data is
   “authorized” is not an enforcement model. Replace the provisional frontend
   paths `/api/container-journeys...` with the approved
   `/api/container-movement/journeys...` routes (or record an approved ADR
   change now); do not defer a known route mismatch to code generation.

## Builder Remediation after Review Iteration 1

- Replaced all provisional status aliases with exact checked-in Avro envelope,
  data, and nested location names; specified the compatible `sequenceNumber`
  change and complete seq-0/seq-1 mappings.
- Defined exact `booking.confirmed` routing/equipment array validation and the
  `equipmentId` to domain reference mapping.
- Changed aggregate lookup to stable booking/equipment identity with monotonic
  revision dispositions and no second journey for stronger revisions.
- Made event claim/replay/crash recovery durable and replay stored dispositions
  before any external validation call.
- Put request claim, attempt, domain decision, accepted effects, audit, and
  outbox in one local capture transaction.
- Split CMM and Booking Flyway ownership with independent repair verification.
- Added application-level read authorization and aligned frontend paths to the
  approved `/api/container-movement/journeys` surface.

## Review

**Verdict: NOT-READY**

The updated artifacts resolve the checked-in Avro field-name mappings,
`booking.confirmed` array/assignment validation, stable aggregate lookup in the
primary flow, stored replay disposition, accepted-capture atomic write set,
service-owned migrations, read authorization, and primary REST paths. Four
core corrections and one validation correction remain:

1. **Choose the executable Avro type now.** Both primary and entity artifacts
   still say `sequenceNumber` uses an “approved executable integer type,” but no
   checked-in contract or upstream artifact selects `int` versus `long` and the
   current Avro has no field. Functional Design must name the exact Avro type
   and the corresponding Java/Booking persistence type, with default `0` and
   non-negative validation; this cannot remain a code-generation choice.
2. **Remove revision from the remaining domain invariant.** The primary model,
   rules, and entity aggregate lookup now correctly use stable
   `(bookingId, equipmentId)` identity with monotonic revision, but
   `domain-entities.md` still asserts “one journey per
   booking/revision/equipment reconciliation key.” Replace it with one journey
   per stable booking/equipment key and keep revision solely as reconciled
   monotonic state.
3. **Select one implementable intake-claim transaction model.** The primary
   flow durably claims/loads an IN_PROGRESS identity before the Reference Data
   call and describes token/version recovery, while `business-rules.md` says
   intake claim, disposition, journey, plan, audit, and outbox are one
   transaction. A pre-call claim cannot be both independently observable/
   reclaimable and uncommitted in the later atomic journey transaction. Either
   define a separately committed fenced intake reservation followed by one
   atomic business-effects transaction, including crash/expiry transitions, or
   perform external validation before a single claim/effects transaction and
   rely on the unique claim at commit. Align the diagram, algorithm, and rule.
4. **Define how Booking builds the canonical CMM link without `journeyId` on the
   event.** The corrected status contract properly carries no journey ID, yet
   the model says Booking renders a canonical journey link and the frontend
   exposes only journey-ID list/detail API routes. Use the approved
   `/api/container-movement/bookings/{bookingReference}/journey` lookup/link
   contract (with fresh read authorization), or document another contract-true
   booking-reference route; do not infer a journey ID from `movementId` or add
   an unapproved status field.

5. **Remove the unbound occurrence-time tolerance.** Replace the “approved
   tolerance” for impossible-future occurrence times in `domain-entities.md`
   with a named/configured testable rule or defer that extra rejection
   explicitly; no upstream artifact currently defines a value.

## Builder Remediation after Reviewer Iteration Limit

- Fixed sequence storage to Avro `int`, Java `int`, and PostgreSQL `integer`
  with a non-negative constraint.
- Removed revision from journey identity everywhere; it remains monotonic state.
- Replaced durable pre-claim with read-before-validation and a single unique
  receipt/business-effects transaction whose concurrent loser loads the winner.
- Defined the CMM-owned booking-reference resolver and stable-detail redirect;
  the status event does not carry journey ID.
- Defined occurrence-time validity as `occurredDateTime <= Clock.instant()` at
  application validation, with an injected clock and exact boundary tests.

These changes are builder- and sensor-verified after the two-review limit and
do not replace the final independent NOT-READY verdict.

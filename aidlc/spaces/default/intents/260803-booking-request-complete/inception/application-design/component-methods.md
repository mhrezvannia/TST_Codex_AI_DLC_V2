# W3-04 Booking Request Completeness — Component Methods

## Contract conventions

All commands carry `actorSubjectId`, `correlationId`, and an idempotency identity where a repeated effect is possible. Mutating commands carry `expectedRevision` after initial creation. Domain failures return stable codes plus safe field/reason metadata; protected provider detail, free text, party/customer facts, and commercial amounts are never copied into denial or diagnostic payloads.

HTTP method names below are design contracts. Java/TypeScript names may follow repository conventions during Functional Design, but their responsibilities and transaction boundaries are binding.

## Browser and BFF contracts

### Canonical page routes

| Page route | Rendering/component contract |
|---|---|
| `/booking/new` | Server-rendered create page initializes the shared Booking-owned `BookingRequestForm` composition in create mode |
| `/booking/{bookingId}` | Server-rendered operational detail; Overview is default and unknown-view fallback |
| `/booking/{bookingId}/correct` | Server-rendered correction page loads the permitted full projection and initializes the same `BookingRequestForm` composition in correction mode with `expectedRevision` |
| `/booking/{bookingId}?tab=overview|charges|journey|activity` | Route-backed `RouteTabs` views with validated tab/list context |
| `/bookings...` | Compatibility redirect/thin delegate to the equivalent `/booking...` route; no page implementation |

The correction route is a mode boundary, not a second form implementation. It preserves same-record identity/revision semantics and returns to the canonical detail context after success or safe cancellation.

### Same-origin shell routes

| Method and path | Permission | Purpose | Booking BFF target |
|---|---|---|---|
| `GET /api/booking/reference-options` | `read` or `create/correct` for form context | Bounded option subsets by kind/query/role | `GET /api/reference-options` |
| `GET /api/booking/voyage-options` | `create` or `correct` | Route/date-compatible voyage candidates and schedule display facts | `GET /api/voyage-options` |
| `POST /api/booking/bookings/drafts` | `create` | Save a new complete-or-incomplete draft explicitly | `POST /api/bookings/drafts` |
| `PUT /api/booking/bookings/{bookingId}` | `correct` | Fully replace the same request at `expectedRevision` | `PUT /api/bookings/{bookingId}` |
| `POST /api/booking/bookings/{bookingId}/validate` | `validate` | Validate the exact current revision | Existing matching BFF route |
| `POST /api/booking/bookings/{bookingId}/price` | `price` | Request exact pricing for the validated revision | Existing matching BFF route |
| `POST /api/booking/bookings/{bookingId}/confirm` | `confirm` | Confirm after impact dialog and preconditions | Existing matching BFF route |
| `GET /api/booking/operations/{operationId}` | original operation policy plus recorded actor/tenant scope | Read create/correct/validate/price/confirm status without issuing another command; works before uncertain create returns a booking ID | `GET /api/bookings/operations/{operationId}` |
| `GET /api/booking/bookings/{bookingId}/price-status` | `read` and `price` | Compatibility delegate that resolves the pricing operation identity through the unified status resource | `GET /api/bookings/operations/{operationId}` |
| `GET /api/booking/bookings/{bookingId}` | `read` | Canonical privacy-shaped detail/correction projection | Existing Booking detail route |
| `GET /api/booking/bookings/{bookingId}/journey` | `read` | Privacy-shaped CMM pending-assignment or physical-journey view | Booking API facade → CMM booking-journey OHS |

`forwardToBookingBff(request, path)` remains transport-only. `proxyBooking(request, path, policy)` remains the edge guard and is extended with a policy table rather than per-route ad hoc checks. It validates session, origin and body bounds; propagates actor, cookie, correlation and idempotency context; applies the 2.5-second upstream timeout; uses `cache: no-store`; and maps failures to stable safe envelopes.

### `BookingRequestFormController`

| Method | Inputs | Result/invariant |
|---|---|---|
| `initialize(projection)` | server-loaded request/options/status | Creates local form state without changing authoritative values |
| `updateField(field, value)` | one field and user value | Preserves unrelated and optional values; invalidates only dependent client hints |
| `refreshOptions(subset)` | affected option kind and current dependencies | Refreshes one subset; preserves unrelated input and announces status |
| `saveDraft()` | full typed form plus stable command identity | Disables duplicate submit; navigates/focuses on committed result or restores exact recovery target |
| `correct(expectedRevision)` | full typed form plus stable command identity | Replaces same booking record; never creates a new draft |
| `reconcileConflict(latest)` | latest server projection | Shows safe conflict context; requires explicit reapplication and resubmission |

### `deriveBookingNextAction(projection, permissions)`

This pure view-model method returns exactly one of `INSPECT`, `REFRESH_STATUS`, `RETRY_ONCE`, `CORRECT`, `VALIDATE`, `PRICE`, `CONFIRM`, `SIGN_IN`, `RETURN_TO_LIST`, or `NONE_SAFE_TERMINAL`. It follows approved precedence: session/denial and unsafe contract states first; then pricing uncertainty/recovery; conflict; incompleteness/invalid/stale facts; validation currency; pricing currency; confirmation. It never substitutes a lower-precedence action when the user lacks its permission.

## Booking API and command methods

### `createDraft(CreateBookingRequestCommand command)`

Input is a full request payload whose fields may be incomplete only where draft rules permit. The client-generated opaque UUID `operationId` is also the idempotency key, so an uncertain create can be queried without a booking ID. The method normalizes text, parses fixed units, validates numeric shape, authorizes `create`, checks idempotency, assigns booking identity/revision, calculates completeness, stores snapshot/projection/activity plus the terminal operation disposition atomically, and returns the canonical detail projection. It does not require or fabricate `equipmentId`.

### `correctRequest(BookingId id, ReplaceBookingRequestCommand command)`

`ReplaceBookingRequestCommand` contains the complete field dictionary, `expectedRevision`, idempotency key, actor, and correlation. The method:

1. authorizes `correct` before protected dependency work;
2. resolves idempotent replay;
3. locks/loads the aggregate and verifies revision;
4. normalizes and fully replaces request values while preserving immutable identity, lineage, and unrelated activity;
5. increments revision and invalidates validation/pricing/confirmation eligibility if their basis changed;
6. recalculates completeness;
7. commits snapshot v2, projection, safe activity, and idempotency atomically.

Omitted optional values are explicit nulls in the replacement contract, not ambiguous missing JSON properties. An optimistic conflict changes nothing and returns latest revision plus a safe conflict code.

### `validateRequest(BookingId id, ExpectedRevision revision, ActorContext actor)`

The method authorizes `validate`, checks owned completeness, creates a stable validation fingerprint, then batch-validates:

- booking customer and shipper/consignee/notify party roles;
- commodity, package type, POL/POD, equipment type;
- selected voyage identity/version, active state, POL/POD compatibility;
- carrier voyage number, ETD, ETA, cargo cutoff, documentation deadline, and temporal ordering.

It persists `VALID`, `BLOCKED`, or `PROVIDER_UNAVAILABLE` with field/reason codes, source versions, fingerprint, timestamp, and correlation. A provider failure preserves the draft. Only a `VALID` result for the current revision/fingerprint permits pricing.

Create, correct, validate, price, and confirm all use the same Booking-owned operation journal contract. A command is recorded as `IN_PROGRESS` before protected work when the transaction boundary permits, and its committed business result and terminal journal disposition are atomic; a crash or transport timeout therefore remains queryable or safely replayable under the same identity.

### `requestPricing(BookingId id, PricingCommand command)`

The method authorizes `price`, verifies current validation, builds a fallback-free `PricingInput`, and invokes the existing `PricingPort`. Input contains exact booking customer, commodity, POL/POD, equipment type, requested departure, quantity, USD, and required trade-lane authority. It never substitutes `NA-EU`, `commodity-general`, quantity one, or a guessed rate.

`PricingCommand` carries expected revision, stable pricing request identity, idempotency key, and correlation. The method persists fingerprint, provider request/reference, accepted/unknown/terminal outcome, immutable authority/basis, itemized lines, total/currency, and safe reason. Replays return the recorded outcome.

### `refreshPricingStatus(BookingId id, PricingStatusQuery query)`

Looks up only the existing pricing request identity. It never submits a second commercial request. It maps provider state to pending, accepted, manual/no-rate, validation, denied, outcome unknown, unavailable/timeout-no-acceptance, malformed, conflict, or replay and persists the latest safe disposition.

### `retryPricingOnce(BookingId id, PricingRetryCommand command)`

Allowed only after explicit unavailable/timeout with evidence that the provider accepted no operation. Reuses the original commercial request identity and increments a bounded retry-attempt marker; further uncertainty returns to status refresh.

### `getOperationStatus(OperationId operationId, ActorContext actor)`

`GET /api/bookings/operations/{operationId}` is the single non-mutating recovery resource for `CREATE_DRAFT`, `CORRECT`, `VALIDATE`, `PRICE`, and `CONFIRM`. `operationId` is the opaque client-generated UUID sent as the command idempotency key. The lookup does not require `bookingId`; the stored actor/tenant scope and original operation policy are authorized before result disclosure, and absent or inaccessible identities return the same privacy-safe 404 envelope.

An accessible status response contains only `operationId`, `operationType`, nullable `bookingId`, nullable `requestedRevision`/`committedRevision`, `state`, `terminal`, `recovery`, `retryEligible`, safe `resultReference`/`code`, `correlationId`, `updatedAt`, and `expiresAt`. States are `IN_PROGRESS`, `SUCCEEDED`, `REJECTED`, `OUTCOME_UNKNOWN`, `NOT_ACCEPTED`, or `EXPIRED`. `IN_PROGRESS` and `OUTCOME_UNKNOWN` map only to `REFRESH_STATUS`; `NOT_ACCEPTED` maps to `RETRY_ONCE` only when the edge or provider has proof no operation was accepted; `SUCCEEDED` returns the committed result reference; `REJECTED` maps to its recorded deterministic action; `EXPIRED` is an inspect/manual-resolution terminal and never authorizes a blind retry. Refresh never invokes a command handler or provider. Any retry reuses the same operation identity and returns replay if the original effect committed.

### `confirm(BookingId id, ConfirmBookingCommand command)`

The transaction authorizes `confirm`, resolves replay, locks the aggregate, verifies expected revision, and rechecks complete request, current canonical references, complete schedule snapshot, current validation, and authoritative price fingerprint. It then commits together:

- confirmed aggregate state and revision/activity;
- immutable confirmation snapshot;
- command idempotency disposition;
- exactly one outbox record for the confirmed revision.

Any precondition or persistence failure commits none of these effects. A repeated command returns the previously committed confirmation without duplicate activity/outbox work.

## Query and reference methods

### `getBookingDetail(BookingId id, ActorContext actor)`

Authorizes `read` and returns a privacy-shaped projection containing current revision, canonical request, completeness reasons, requested/derived schedule provenance, reference status, validation status, price summary/evidence link, equipment request, migration status, and data required for action derivation. Diagnostics expose only safe codes/correlation.

### `getReferenceOptions(ReferenceOptionQuery query, ActorContext actor)`

Authorizes the relevant form action and delegates to `ReferenceOptionsPort`. Query is bounded by option kind, search text, role, active status, and paging limit. The method returns stable ID, display code/name, version/status, and only the metadata necessary for selection. It stores no copied master authority.

### `getVoyageOptions(VoyageOptionQuery query, ActorContext actor)`

Requires POL, POD, and requested departure. Delegates to `VoyageSchedulePort` and returns route-compatible candidates with voyage ID/version/source, carrier voyage number, timezone-aware ETD/ETA/cutoffs, active/stale/partial flags, and variance from requested POL-local date. It never overwrites requested departure.

### `getBookingJourneyView(BookingId id, ActorContext actor)`

Authorizes Booking `read` before dependency work. An unconfirmed Booking returns `NOT_APPLICABLE` without a CMM call. For a confirmed Booking, `CmmJourneyViewPort` calls the existing `GET /api/container-movement/bookings/{bookingId}/journey` OHS using authenticated Booking service identity, propagated actor/tenant context and correlation, with 500 ms connect and 1.5 s read bounds. CMM v2 HTTP 200 is discriminated as `PENDING_ASSIGNMENT` or `JOURNEY_AVAILABLE`; pending carries only CMM-persisted booking revision, requested equipment type/quantity/nullable ID, `acceptedAt`, `checkedAt`, and correlation. An authorized 404 maps to `HANDOFF_PENDING`, which means CMM has not yet exposed acceptance and offers Refresh; 403 maps to existence-safe `ACCESS_DENIED`; timeout/connection/5xx maps to `DEPENDENCY_UNAVAILABLE`. Booking neither persists a CMM copy nor infers acceptance from its own confirmation/request.

## Domain methods and invariants

### `BookingRequest.normalizeAndValidateShape()`

- NFC-normalizes and outer-trims customer reference and cargo description.
- Preserves case and meaningful internal whitespace; rejects control characters.
- Enforces lengths 1–64 and 1–500 when values are present.
- Enforces package count 1–999,999, equipment quantity 1–9,999, decimal precision 18,3, positive gross weight/optional volume, `KGM`, optional `MTQ`, and `USD`.
- Accepts null consignee, notify party, volume, and equipment ID under their approved rules.

### `BookingCompletenessPolicy.evaluate(Booking booking, Instant now)`

Returns an ordered set of `CompletenessReason(fieldKey, reasonCode, authority, recoverability)`. Reasons are stable and safe. Required owned-field gaps, unverified/inactive references, schedule partial/stale/inconsistent state, non-current validation, and non-current price are distinct; they are not collapsed into one Boolean.

### `Booking.replaceRequest(request, expectedRevision)`

Rejects stale revision. Replaces the request, increments revision, clears schedule/validation/pricing evidence only when its basis changed, preserves immutable identity and optional values explicitly supplied, and recalculates completeness.

### `Booking.confirm(expectedRevision, confirmationEvidence)`

Rejects missing/stale evidence and existing incompatible terminal state. Produces the minimal confirmed domain event payload and returns the aggregate transition; publication remains an application/persistence responsibility.

## Persistence methods

### `BookingSnapshotCodecV2.read(snapshot)`

- Missing `schemaVersion` plus no canonical `routing`/`equipment` is v0 legacy.
- Missing `schemaVersion` plus canonical `routing`/`equipment` is v1.
- `schemaVersion: 2` is decoded strictly into typed complete-request state.
- v0/v1 are upcast using only stored authoritative facts. Unmapped attributes are preserved; unsupported required facts yield incomplete reasons.
- Unknown future versions fail closed with a safe persistence error and correlation.

### `BookingSnapshotCodecV2.write(booking)`

Always emits deterministic `schemaVersion: 2` JSON. It never mixes typed and legacy pricing evidence and never serializes derived UI-only next-action text as authority.

### `BookingProjectionRepository.save(booking, completeness)`

Writes the aggregate snapshot and rebuildable projection in the same transaction under optimistic revision control. Projection writes are idempotent for `(bookingId, revision)`.

### `BookingBackfillService.runBatch(limit, runId)`

Selects a bounded deterministic batch, skips completed ledger entries, verifies source digest/baseline, reads/upcasts, writes the v2 snapshot/projection plus ledger atomically per record, and records `MIGRATED`, `INCOMPLETE`, `CONFLICT`, or `FAILED_SAFE`. Rerun and restart do not duplicate or overwrite newer revisions.

## Confirmed event and CMM methods

### `BookingConfirmed` Avro mapping

The publisher maps exactly to `contracts/avro/booking.confirmed.avsc`; no architecture-only aliases become wire fields:

| Avro field | Exact source/meaning |
|---|---|
| `id` | deterministic confirmed-event identity for `(bookingId, bookingRevision, CONFIRMED)` |
| `source` | literal `booking-service` |
| `type` | literal `booking.confirmed` |
| `time` | confirmation event time as the schema string representation |
| `correlationId` | safe command correlation reference |
| `dataSchemaVersion` | current data contract integer |
| `data.bookingId` / `data.bookingRevision` | confirmed Booking identity and committed revision |
| `data.routing[]` | every current leg with `legSequence`, `loadUnLocode`, `dischargeUnLocode`, and `voyageId` |
| `data.equipment[]` | every current assignment with `equipmentTypeCode`, `quantity`, and nullable/default-null `equipmentId` |

There is no Avro `schemaVersion`, `eventId`, `occurredAt`, or `idempotencyKey` field. Command idempotency and internal outbox deduplication stay in Booking persistence; consumer deduplication uses Avro `id`. The checked-in AsyncAPI headers are transport metadata mapped exactly as `correlationId = Avro correlationId`, `schemaVersion = decimal string of Avro dataSchemaVersion`, and `idempotencyKey = Avro id`; that header is an event-delivery dedup key, never the command `operationId`. Headers are not projected into `data`. The payload excludes booking customer, parties, references, cargo/free text, schedule commercial detail, pricing, and user identity. Any later additive field requires a default and Schema Registry BACKWARD compatibility proof before approval.

### `PendingEquipmentAssignmentService.consumeBookingConfirmed(event)`

Runs transactionally in CMM. It validates envelope/schema, authorizes the service source, resolves duplicate Avro `id`/event-delivery identity, rejects stale booking revision, and upserts requested equipment lines as `PENDING_PHYSICAL_ASSIGNMENT`. Quantity may exceed one and `equipmentId` may be null. It writes consumer idempotency and safe audit with the assignment state. It never calls `ContainerJourney.create`, allocates a journey/container ID, or emits movement status.

### `PendingEquipmentAssignmentQueryService.findByBookingId(bookingId, caller)`

The exact OHS is `GET /api/container-movement/bookings/{bookingId}/journey` with negotiated v2 media type. CMM authenticates the Booking service and authorizes propagated actor/tenant read context before lookup. HTTP 200 returns `{ state: PENDING_ASSIGNMENT, bookingId, bookingRevision, requestedEquipment: [{ equipmentTypeCode, quantity, equipmentId: null|string }], acceptedAt, checkedAt, correlationId }` from CMM pending-assignment persistence, or `{ state: JOURNEY_AVAILABLE, bookingId, bookingRevision, journey: <existing JourneyResponse>, checkedAt, correlationId }`. Authorized no-projection is the existing 404 `not_found`; inaccessible and protected absence remain existence-safe, and dependency 5xx is never flattened to 404. The v1 journey response remains available during migration.

Booking maps confirmed+authorized-404 to `HANDOFF_PENDING`, not to accepted pending assignment; this is the eventual event-handoff state. Only the CMM 200 pending representation proves event consumption. Later physical assignment changes the CMM response to `JOURNEY_AVAILABLE`; Booking does not manufacture that transition.

### `ConfirmedEventRolloutCoordinator` (operational procedure, not a runtime service)

Inventories producers/consumers/config/tests, deploys the dedicated CMM pending consumer on `booking.confirmed`, and verifies health before enabling W3-04 confirmation. Every outbox row stores exactly one destination and contract: canonical-contract rows publish only to `booking.confirmed`; legacy rows publish only to `booking.events`. There is no per-event dual publication. The legacy mapper rejects/quarantines the canonical record before domain mutation. Rollback disables new W3-04 confirmation and continues draining canonical rows with the pending consumer; it never redirects them to the legacy journey handler. Legacy configuration is retired only after observed convergence.

## Error, focus, and status mapping

| Stable outcome | HTTP/domain shape | Primary UI action | Focus/status target |
|---|---|---|---|
| Field/validation blocked | 422 + field/reason keys | Correct | validation summary, then linked field |
| Optimistic conflict | 409 + latest revision rendered with exported `ConflictStrip` | Refresh latest | `record-conflict` heading/refresh button |
| Pricing pending/unknown | 202/recorded status | Refresh status | pricing status region |
| Create/correct/validate/confirm pending or unknown | operation status `IN_PROGRESS`/`OUTCOME_UNKNOWN` | Refresh status | operation status region; preserve form/detail context |
| Explicit unavailable/no acceptance | 503 recorded safe code | Retry once | retry button after announcement |
| Manual/no-rate or pricing validation | terminal provider-safe reason | Correct | reason heading/correct action |
| Denied/session | 401/403 privacy-safe | Sign in or list | page/session heading; no protected facts |
| Malformed provider contract | 502 + safe correlation | Inspect | collapsed diagnostics trigger |
| Confirm success | committed detail | Inspect record | detail page H1/status region |
| CMM handoff pending | confirmed Booking + authorized CMM 404 | Refresh | Journey status region; never label accepted |
| CMM dependency unavailable | timeout/connection/5xx | Refresh | Journey partial-data notice |

Validation and non-terminal operation feedback use exported `StatusStrip`; whole-route load failures use exported `FailureState`; subset degradation uses exported `PartialDataNotice`; privacy-safe diagnostics use exported `TechnicalDetails`; Overview, Charges, Journey, and Activity navigation uses exported `RouteTabs`. Cargo description requires the W2-02-owned shared multiline `TextArea`/counter; affected implementation evidence is BLOCKED until that released primitive is consumed.

These targets are Booking-owned compositions around released LinerCore primitives. W3-04 does not implement a local `TextArea`, and no unsupported Combobox collision/flip or custom primitive announcement behavior is assumed.

## Upstream basis and traceability

These method contracts derive from `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`, with UI behavior specialized from `interaction-spec.md`, `design-system-mapping.md`, and `accessibility-checklist.md`. They cover FR-001–FR-030, NFR-001–NFR-010, and US-01–US-12 without claiming construction evidence.

# Component Methods - W1-01 Booking Quote-to-Cash

## Method Conventions

Signatures below are implementation contracts for W1, not detailed business algorithms. `Existing` methods are retained and may receive contract-shaped types; `New` methods are added. Application transactions use Spring `@Transactional`, while domain and port modules remain framework-free per `team-practices.md`.

## Booking Application and Ports

| Status | Component | Signature | Purpose and errors |
|---|---|---|---|
| Existing | `BookingApplicationService` | `Booking createDraft(CreateBookingCommand command)` | Persist one draft and command idempotency; validation errors are deterministic 4xx responses |
| Existing | `BookingApplicationService` | `Booking validate(BookingId id, String actor, String correlationId)` | Validate all canonical references live; inactive/missing values create a blocked business state |
| Existing | `BookingApplicationService` | `Booking requestPricing(BookingId id, String actor, String idempotencyKey, String correlationId)` | Call Charge once plus one allowed transient retry and persist priced/manual state |
| Refactor | `BookingApplicationService` | `@Transactional Booking confirm(BookingId id, String actor, String idempotencyKey, String correlationId)` | Lock/CAS a PRICED row, replay confirmed state, and commit exactly one canonical logical outbox event; never call CMM |
| Refactor | `BookingApplicationService` | `@Transactional MovementStatusProjection consumeMovementStatus(MovementStatusReceivedEvent event)` | Validate, dedupe envelope ID, apply only a newer fact, and commit projection/receipt |
| New | `BookingApplicationService` | `BookingDetailView detailView(BookingId id, String actor, String correlationId)` | Join Booking-owned aggregate, quote snapshot, latest movement projection, and Audit identity |
| Existing | `BookingApplicationService` | `@Transactional PublishBatchResult publishOutboxBatch(String workerId, int batchSize)` | Claim/publish/update lifecycle through adopted shared messaging infrastructure |
| Refactor | `BookingRepository` | `Booking save(Booking booking)` | Persist ordered routing/equipment and pricing snapshot as the authoritative service snapshot |
| Existing | `BookingRepository` | `Optional<Booking> findById(BookingId id)` | Load aggregate or empty |
| New | `ConsumedEventRepository` | `boolean recordIfAbsent(ConsumedEventReceipt receipt)` | Execute `INSERT ... ON CONFLICT (event_id) DO NOTHING`; update count 0 is duplicate; insert rolls back with surrounding transaction |
| New | `MovementStatusProjectionRepository` | `MovementStatusProjection upsertIfNewer(MovementStatusProjection candidate)` | One SQL upsert with a guarded conflict update compares `(occurredDateTime, classifierRank, receivedDateTime, eventId)` |
| New | `MovementStatusProjectionRepository` | `Optional<MovementStatusProjection> findLatest(String bookingRef)` | Return latest per-container projection for W1 detail |

`MovementStatusReceivedEvent` mirrors the canonical envelope plus `data`: `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`, `bookingRef`, `containerRef`, `movementId`, `moveCode`, `eventClassifierCode`, `occurredDateTime`, `receivedDateTime`, `derivedStatus`, `emptyIndicatorCode`, `transshipment`, and optional location fields. Names must match the `.avsc` exactly at the adapter boundary.

Classifier rank is fixed as `PLN=1`, `EST=2`, `ACT=3` and is used only when `occurredDateTime` is equal; a later occurred fact wins regardless of classifier. The PostgreSQL upsert predicate compares all four values lexicographically, so two concurrent deliveries cannot regress the row. Event receipt insertion and guarded upsert run in one transaction.

## Booking Messaging and HTTP

| Status | Component | Signature | Purpose and errors |
|---|---|---|---|
| Refactor | `KafkaBookingEventPublisher` | `BrokerMetadata publish(BookingOutboxEvent event)` | Map exact envelope/data schema and call `KafkaGenericRecordPublisher` with key `bookingId` |
| New | `BookingConfirmedRecordMapper` | `GenericRecord toRecord(BookingOutboxEvent event, Schema schema)` | Build nested records/arrays; fail before publish on missing contract fields |
| New | `KafkaContainerMovementStatusListener` | `void onMessage(ConsumerRecord<String, GenericRecord> record)` | Verify topic/key/type/source, map, dispatch transaction; throw retryable failures for broker redelivery |
| New | `ContainerMovementStatusRecordMapper` | `MovementStatusReceivedEvent fromRecord(GenericRecord record)` | Strict canonical field mapping; reject legacy flat payloads |
| Refactor | `BookingApiController` | `BookingResponse confirm(String id, ActorRequest request, String idempotencyKey, String correlationId)` | Require `Idempotency-Key`, carry it into the application transaction, and return accepted confirmation state |
| New | `BookingApiController` | `BookingDetailResponse detailView(String id, String actor, String correlationId)` | Return the Booking-owned composite detail projection |
| Remove | `BookingApiController` | `receiveMovementStatus(MovementStatusRequest request)` | Retired default-runtime synchronous compatibility endpoint |
| Remove | `HttpContainerMovementClient` | `publishBookingConfirmed(...)` | Forbidden normal-path handoff; no Kafka fallback to HTTP |

Kafka acknowledgment occurs only after the application transaction returns. Validation/permanent contract errors are routed to the configured dead-letter/error handler with event identity retained; transient database errors are rethrown for bounded Kafka retry.

Consumer error policy is fixed for both services: initial delivery plus two retries at 250ms and 1s; then `DeadLetterPublishingRecoverer` writes the original key/value and error/origin headers to `booking.confirmed.DLT` or `containermovement.status.DLT`. DLT retention is seven days and ownership follows the consuming service. Deserialization, unsupported source/type/schema, and invariant violations go directly to DLT; transient database errors use the retry schedule. Manual replay after an environmental correction republishes the original key/value; payload correction republishes a canonical corrected value while preserving envelope `id` and auditing original/corrected hashes plus field differences. Receipts are inserted only inside a successful business transaction.

## CMM Application and Ports

| Status | Component | Signature | Purpose and errors |
|---|---|---|---|
| Refactor | `ContainerMovementApplicationService` | `@Transactional ContainerJourney consumeBookingConfirmed(BookingConfirmedEvent event)` | Dedupe envelope ID, ignore stale revision, reconcile/create journey, enqueue status atomically |
| Existing | `ContainerMovementApplicationService` | `@Transactional ContainerJourney captureMovement(CaptureMovementCommand command)` | Validate/capture a movement and enqueue canonical status |
| Existing | `ContainerMovementApplicationService` | `@Transactional PublishBatchResult publishOutboxBatch(String workerId, int batchSize)` | Publish through existing relay lifecycle |
| Refactor | `JourneyRepository` | `Optional<ContainerJourney> findByBookingIdAndContainerRef(String bookingId, String containerRef)` | Locate the one W1 journey and support later multi-equipment reconciliation |
| New | `CmmConsumedEventRepository` | `boolean recordIfAbsent(ConsumedEventReceipt receipt)` | Envelope-ID dedupe in the journey transaction |
| Refactor | `MovementStatusEventMapper` | `MovementStatusEvent statusEvent(String eventId, ContainerJourney journey, String correlationId, Instant now)` | Produce exact canonical envelope and planned/validated status data |

`BookingConfirmedEvent` mirrors envelope plus `data.bookingId`, `data.bookingRevision`, ordered `data.routing[]`, and `data.equipment[]`. The adapter enforces one W1 assignment with `quantity=1` and a valid ISO 6346 `equipmentId`; the domain remains array-capable.

## CMM Messaging and HTTP

| Status | Component | Signature | Purpose and errors |
|---|---|---|---|
| New | `KafkaBookingConfirmedListener` | `void onMessage(ConsumerRecord<String, GenericRecord> record)` | Verify booking key/type/source, map canonical record, invoke transaction |
| New | `BookingConfirmedRecordMapper` | `BookingConfirmedEvent fromRecord(GenericRecord record)` | Preserve exact envelope, routing, and equipment field names |
| Refactor | `KafkaContainerMovementEventPublisher` | `BrokerMetadata publish(MovementStatusEvent event)` | Publish key `bookingRef + ':' + containerRef` through shared publisher |
| New | `ContainerMovementStatusRecordMapper` | `GenericRecord toRecord(MovementStatusEvent event, Schema schema)` | Build exact nested location and enum fields |
| Remove | `ContainerMovementApiController` | `consumeBookingConfirmed(BookingConfirmedRequest request)` | Retired synchronous compatibility command endpoint |
| Remove | `HttpBookingMovementStatusClient` | `publishStatus(...)` | Status returns only by Kafka |

## Charge Pricing

| Status | Component | Signature | Purpose and errors |
|---|---|---|---|
| Refactor | `ChargeAgreementApplicationService` | `PricingResult price(PricingRequest request, String actorSubjectId)` | Resolve approved active agreement, calculate itemized USD charges, persist manual case when no rate |
| New | `ChargeAgreementApplicationService` | `@Transactional PricingResult requestPricing(PricingRequest request, String idempotencyKey, String actor)` | Enforce key/request-hash idempotency and persist immutable result |
| New | `PricingClaimService` | `@Transactional(REQUIRES_NEW) PricingClaim claim(String key, String bookingRef, int amendmentSeq, String requestHash, String ownerToken)` | Commit short-lived `IN_PROGRESS` claim/lease before calculation; return CLAIMED, REPLAY, IN_PROGRESS, or CONFLICT |
| New | `PricingClaimService` | `@Transactional(REQUIRES_NEW) StoredPricingRequest complete(String key, String ownerToken, PricingTerminalOutcome outcome)` | Fenced CAS from owned `IN_PROGRESS` to `COMPLETED|MANUAL`; sealed `Priced|Manual` outcome persists response or Charge manual case atomically |
| New | `PricingApiController` | `ResponseEntity<PricingResultResponse> requestPricing(PricingRequestBody body, String idempotencyKey, String correlationId)` | Implement `POST /pricing-requests` and v1 media type exactly |
| Refactor | `HttpChargePricingClient` | `ChargePricingResponse quote(ChargePricingRequest request)` | POST contract body; map 200/404/422/400/503/timeout without local calculation |

The API request uses exact contract names: `bookingRef`, `tradeLane`, `pol`, `pod`, `equipmentType`, `partyId`, `commodityCode`, `reeferIndicator`, `dgIndicator`, `dates`, and `quantities`. The response uses `bookingRef`, `pricingBasis`, `pricingRef`, `charges`, and `applicableDndRuleTypes`. `Idempotency-Key` and `X-Correlation-Id` are required at the adapter boundary.

Booking composes `Idempotency-Key = bookingId + ':' + amendmentSeq`, permits at most one in-flight call for that version, and reuses the key for a retry. The HTTP timeout is two seconds. Resilience4j performs at most one retry only for timeout/503, then records one failed operation; the per-endpoint circuit opens after five consecutive failed operations, allows one half-open probe after 30 seconds, and returns manual pricing immediately while open. 4xx responses are never retried.

Charge claim state is durable: `IN_PROGRESS` has owner token, start time, and ten-second lease; `COMPLETED|MANUAL` has response JSON/completion time. Claim and completion are separate short `REQUIRES_NEW` transactions, and pricing calculation runs outside either transaction. Same key/hash in a terminal state replays byte-equivalent business data; same key/hash before lease expiry returns 409 `PRICING_IN_PROGRESS`; same key with another hash or another key for the same booking/amendment returns 409 `IDEMPOTENCY_CONFLICT`. After lease expiry, one contender atomically takes ownership by CAS on prior owner/lease, and the old owner's fenced completion update fails. A failed completion rereads the winner. Unique constraints and owner fencing prevent concurrent engine/manual-case side effects and make crash recovery deterministic.

## Confirmation Concurrency

Booking command idempotency stores the confirm key/request hash. The BFF sends `Idempotency-Key`, the HTTP controller requires it, and the application method consumes it. `JdbcBookingRepository.findByIdForUpdate` serializes the lifecycle transition; an already confirmed same revision returns the persisted booking. `BookingEventMapper` uses a stable RFC 4122 UUIDv5 derived from namespace `booking.confirmed` plus `<bookingId>:<revision>`, and `booking_outbox` also has unique `(event_type, booking_id, revision)`. A rollback removes booking, command receipt, audit, and outbox changes together.

## Manual Pricing Ownership

Booking owns the operator-facing `booking_manual_pricing` work item and the confirm-blocking lifecycle state for every manual outcome. When Charge is reached and returns `NO_RATE`/manual, Charge atomically owns its rating diagnostic `ManualPricingCase`; Booking links its work item by pricing request ID and correlation ID. When timeout/503/circuit-open prevents Charge execution, only Booking creates a work item. Resolution occurs through later manual-pricing scope; W1 never duplicates a Charge case locally or claims manual resolution is implemented.

## Booking Frontend and BFF

| Component | Interface | Behavior |
|---|---|---|
| `bookingApi` server client | `list`, `create`, `detail`, `validate`, `price`, `confirm` | Central backend URL, local identity, correlation, media type, timeout, and error mapping |
| Collection BFF | `GET/POST /api/bookings` | Query/create Booking only; no demo fallback |
| Detail BFF | `GET /api/bookings/[bookingId]` | Return composite Booking detail including latest status |
| Command BFF | `POST /api/bookings/[bookingId]/[command]` | Allowlist validate/price/confirm and preserve idempotency |
| `JourneyStatus` hook | `useJourneyStatus(bookingId, initial)` | Poll 1s while visible/focused, cumulative 30s, in-flight guard, stop/retry |

Every BFF error returns a stable code, domain message, correlation ID, and retryability flag. Client views retain known data and never expose raw container URLs, Kafka offsets, or schema internals.

## Upstream Trace

Method contracts refine `requirements.md` and `stories.md` against existing surfaces documented in `architecture.md` and `component-inventory.md`, while preserving `team-practices.md` boundaries.

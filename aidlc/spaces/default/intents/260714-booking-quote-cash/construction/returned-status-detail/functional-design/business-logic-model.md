# Business Logic Model - U05 Returned Status Detail

## Scope and Inputs

U05 implements the returned-status slice in `unit-of-work.md` and US-W1-005 from `unit-of-work-story-map.md`. It satisfies FR-W1-008 through FR-W1-010 and NFR-W1-002/NFR-W1-003/NFR-W1-004/NFR-W1-006/NFR-W1-008/NFR-W1-010 in `requirements.md`. It preserves C01/C02/C05/C08/C09/C10/C11 ownership from `components.md`, realizes status publisher/listener/projection methods in `component-methods.md`, and follows the CMM-to-Booking Kafka flow in `services.md`.

## CMM Status Publication

The existing CMM `ScheduledOutboxRelay` claims U04's pending canonical status row and invokes existing `KafkaContainerMovementEventPublisher`:

1. Ensure the `containermovement.status` subject is registered with BACKWARD compatibility through `ConfluentSchemaRegistrar`.
2. Map the persisted snapshot to one exact nested `GenericRecord` with envelope `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`, and `data`.
3. Map exact data fields: `bookingRef`, `containerRef`, nullable `movementId`, `moveCode`, `eventClassifierCode`, `occurredDateTime`, `receivedDateTime`, `derivedStatus`, `emptyIndicatorCode`, `transshipment`, and nullable `location` with its exact nested field names.
4. Publish through shared `KafkaGenericRecordPublisher` to topic `containermovement.status` with key `bookingRef + ':' + containerRef`.
5. Persist published broker metadata or the shared retry/permanent lifecycle outcome on the same outbox row.

Root schema, both service resources, AsyncAPI, fixtures/catalog, and serde tests change atomically. Legacy flat status records are rejected.

## Booking Listener and Mapping

`KafkaContainerMovementStatusListener` maps the registered record through `ContainerMovementStatusRecordMapper` into `MovementStatusReceivedEvent` without string maps or compatibility aliases. Before application it validates:

- exact type/source/supported data schema version;
- nonblank envelope ID/correlation/booking/container identity;
- valid ISO instants and classifier enum (`PLN`, `EST`, `ACT`);
- supported DCSA equipment move code and empty indicator;
- location shape and UN/LOCODE when present;
- Kafka record key equals `bookingRef:containerRef`;
- Booking exists and the container belongs to its confirmed equipment assignment.

Contract/invariant failures are permanent. Database failures are transient.

## Atomic Receipt and Projection

`BookingApplicationService.consumeMovementStatus` opens one transaction:

1. Insert `booking_consumed_events` by envelope `id` with `ON CONFLICT DO NOTHING`. Existing ID is a duplicate no-op and leaves the projection unchanged.
2. Build a candidate `MovementStatusProjection` keyed by `(bookingRef, containerRef)` with every canonical field and envelope provenance.
3. Compute `classifierRank`: `PLN=1`, `EST=2`, `ACT=3`.
4. Execute one guarded PostgreSQL upsert. Update only when the candidate tuple `(occurredDateTime, classifierRank, receivedDateTime, eventId)` is lexicographically greater than the stored tuple.
5. Mark the receipt disposition `APPLIED` or `STALE`, append the matching audit fact, and commit receipt/projection together.

The Booking aggregate status/revision and generic attributes are not mutated. A late older fact remains acknowledged/traceable but cannot replace a newer projection. Equal occurred time prefers a stronger classifier; received time and event ID provide deterministic final ordering.

## Retry and DLT Flow

- Deserialization, unsupported contract/source/type/version, key mismatch, unknown Booking/container, invalid move vocabulary, and invariant failures go directly to `containermovement.status.DLT`.
- Transient database failures use initial delivery plus retries at 250 ms and 1 second, then DLT.
- The Booking-owned DLT retains original key/value and origin/error headers for seven days.
- Authorized replay preserves envelope ID and is safe because failed transactions commit no receipt; already-applied replay is a no-op.

## Composite Detail Read

Booking detail remains a local read:

1. Load Booking, canonical route/equipment, pricing snapshot, confirmation/outbox summary, latest status projection per confirmed container, and collapsed audit transport detail from Booking's database.
2. Return explicit `PENDING_EVENT` when confirmed but no status projection exists.
3. Return the persisted projection even if Kafka/CMM is currently unavailable; detail does not synchronously query CMM.
4. Return `STATUS_UNAVAILABLE` only when the Booking detail/projection read itself fails, with safe correlation and Retry semantics.

## UI Observation Flow

After confirmation, the detail page revalidates its local BFF once per second for at most 30 seconds or until the first returned projection appears. Polling pauses when the tab is hidden and stops on route change, success, or terminal detail error.

- Success replaces pending in place, announces the derived status, and retains the stable route.
- Thirty-second exhaustion becomes an explicit delayed/pending state with a manual Retry button; it is not called failure and no fabricated movement appears.
- Existing persisted projection renders immediately on refresh/restart without polling CMM.
- Transport/audit details remain collapsed unless the operator expands them.

## Ordering Examples

| Stored fact | Candidate | Result |
|---|---|---|
| none | PLN at T1 | Apply |
| PLN at T1 | same envelope replay | Duplicate receipt; no change |
| ACT at T2 | EST at T1 | Record stale; retain ACT |
| PLN at T2 | ACT at T2 | Apply ACT by classifier rank |
| ACT received R2 | ACT same occurred received R1 | Record stale |
| Equal through received time | larger deterministic event ID | Apply by final tie-break |

## Source Coverage

The workflow implements U05 in `unit-of-work.md`, maps US-W1-005 from `unit-of-work-story-map.md`, satisfies status/UI/latency requirements in `requirements.md`, preserves owners from `components.md`, realizes listener/projection methods in `component-methods.md`, and follows CMM-to-Booking ordering/DLT topology in `services.md`.

# Business Logic Model - U04 Confirm to CMM Journey

## Scope and Inputs

U04 implements the confirmation vertical slice in `unit-of-work.md` and US-W1-004 from `unit-of-work-story-map.md`. It satisfies FR-W1-005 through FR-W1-008, FR-W1-011, FR-W1-013 and NFR-W1-003 through NFR-W1-006 from `requirements.md`. It preserves C01/C02/C03/C07/C08/C09/C10/C11 ownership in `components.md`, realizes the confirmation/listener/repository methods in `component-methods.md`, and follows the Kafka-only Booking-to-CMM boundary in `services.md`.

## Booking Confirmation Transaction

`BookingApplicationService.confirm` is the sole confirmation command boundary:

1. The BFF/controller require `Idempotency-Key`, actor identity, and correlation ID. Booking loads the row with `findByIdForUpdate`.
2. The aggregate must be `PRICED`, have a complete immutable pricing snapshot, have a still-valid reference fingerprint, one ordered route, and one W1 equipment assignment with quantity one and a valid ISO 6346 `equipmentId`.
3. Booking checks a command receipt keyed by operation and idempotency key. Same key/hash replays the persisted confirmation; same key with changed command identity returns 409.
4. Confirmation advances to `CONFIRMED` with a positive monotonic `bookingRevision`. Concurrent callers serialize on the Booking row; a caller observing the same already-confirmed revision returns it without another logical event.
5. `BookingEventMapper` creates envelope `id` as RFC 4122 UUIDv5 using fixed namespace UUID `0d173f67-77ce-5af4-91be-6f29dc59c884` and UTF-8 canonical name `booking.confirmed` + U+001F + `bookingId` + U+001F + base-10 `bookingRevision`; identifiers reject U+001F.
6. The outbox snapshot contains the exact canonical envelope fields `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`, and nested `data` with `bookingId`, `bookingRevision`, ordered `routing[]`, and `equipment[]`. It contains no customer or pricing fields.
7. Booking status/revision, command receipt, audit entry, and one pending outbox row commit together. A unique `(event_type, booking_id, booking_revision)` constraint is the final duplicate guard.

Any failure rolls back all four effects. The controller returns the confirmed Booking immediately with `journeyStatus=PENDING_EVENT`; it does not call CMM and has no HTTP fallback.

## Booking Relay and Contract Mapping

The existing `ScheduledOutboxRelay` claims Booking rows through the W0 lifecycle and invokes `KafkaBookingEventPublisher`, which maps the persisted canonical snapshot into the registered nested `GenericRecord` and delegates to shared `KafkaGenericRecordPublisher`.

- Topic: `booking.confirmed`
- Record key: `bookingId`
- Subject: approved local W1 subject from service configuration
- Compatibility: BACKWARD, verified before publication
- Data schema version: Avro `int` value `1`
- Publisher/registrar: shared platform messaging implementations only

The root `.avsc`, Booking resource, CMM resource, AsyncAPI, fixtures, catalog, and serde tests change atomically to the nested contract. W1 consumers reject legacy flat records. Successful publication marks the claimed row published with broker metadata; retryable and permanent failures use the shared outbox lifecycle.

## CMM Listener Validation

`KafkaBookingConfirmedListener` performs transport/contract validation before business application:

1. Deserialize with the configured Schema Registry reader and map exact names through `BookingConfirmedRecordMapper`.
2. Require `type=booking.confirmed`, supported source, supported `dataSchemaVersion`, nonblank envelope identity/correlation, positive revision, contiguous 1-based routing, nonempty route, and nonempty equipment.
3. W1 requires exactly one equipment assignment, quantity one, and a valid ISO 6346 physical `equipmentId`. The domain model remains array-capable.
4. Resolve every routing load/discharge UN/LOCODE through CMM's Reference Data port before opening the database transaction. Inactive/missing/mismatched values are permanent invariant errors; provider timeout/5xx is transient and eligible for listener retry.

Validated input is passed to a proxied transactional application method. No database lock is held during Reference Data HTTP calls.

## CMM Receipt and Journey Transaction

Inside one transaction:

1. Insert `container_movement_consumed_events` by envelope `id` using `ON CONFLICT DO NOTHING`. A conflict is a duplicate no-op; return the current journey without another outbox row.
2. Lock/read the journey by `(bookingId, equipmentId)` and the applied highest revision for the booking.
3. If the incoming revision is lower than or equal to the highest applied revision, retain the current journey. The new envelope receipt remains recorded, stale/duplicate-revision audit is appended, and no status event is enqueued.
4. If no journey exists, create one from ordered routing and the equipment assignment with status `PLANNED` and applied revision.
5. If a higher revision uses the same `equipmentId`, reconcile route and equipment type, preserve movement history and stable journey ID, and set the higher revision.
6. If a higher revision changes physical `equipmentId`, throw permanent `UNSUPPORTED_CONTAINER_REPLACEMENT`. The transaction rolls back the receipt and all state; the listener routes the original record to DLT for operator correction.
7. For a new or successfully higher-revision journey, create one deterministic initial status envelope and pending CMM outbox row.
8. Journey, applied-revision state, consumed receipt, status outbox, and audit commit together.

## Initial Planned Status Fact

The initial status is a truthful planned lifecycle fact, not a fabricated actual move:

- key: `bookingRef + ':' + containerRef`
- `moveCode=LOAD`
- `eventClassifierCode=PLN`
- `derivedStatus=PLANNED`
- `emptyIndicatorCode=LADEN`
- `transshipment=false`
- location `unLocationCode` is the first routing leg's `loadUnLocode`
- `movementId=null`
- `occurredDateTime` and `receivedDateTime` use the W1 confirmation/ingestion instant

Its envelope ID is RFC 4122 UUIDv5 using fixed namespace UUID `63113348-bf04-5ea0-a21a-3e371dd8f585` and UTF-8 canonical name `containermovement.status` + U+001F + booking reference + U+001F + container reference + U+001F + base-10 booking revision + U+001F + `LOAD` + U+001F + `PLN`; identifiers reject U+001F. Reprocessing the same logical revision cannot enqueue another logical status event. U04 persists the canonical outbox snapshot; U05 owns publishing the finalized status schema and projecting it back to Booking.

## Consumer Error and DLT Flow

- Permanent deserialization, envelope/type/source/schema, ISO 6346, route shape, inactive-reference, and domain-invariant failures go directly to `booking.confirmed.DLT`.
- Transient Reference Data or database failures receive initial delivery plus retries at 250 ms and 1 second, then go to DLT.
- `DeadLetterPublishingRecoverer` preserves original key/value plus origin and error headers. DLT retention is seven days.
- Replay requires `messaging:replay` and preserves envelope ID. Environmental/configuration correction republishes original key/value unchanged. Payload correction republishes a canonical corrected value and audits original/corrected SHA-256 plus field differences, actor, reason, and original topic-partition-offset.
- Because receipts commit only with successful business effects, a corrected replay can apply safely.

## Decision Matrix

| Input | Receipt | Journey | Status outbox | Listener result |
|---|---|---|---|---|
| First valid revision | Inserted | Created at revision | One planned fact | Commit/ack |
| Same envelope ID replay | Existing | Unchanged | None | Ack duplicate |
| New envelope, lower/equal revision | Inserted | Unchanged | None | Commit/ack stale |
| New envelope, higher revision, same container | Inserted | Reconciled | One planned revision fact | Commit/ack |
| Higher revision, changed container | Rolled back | Unchanged | None | Direct DLT |
| Reference provider unavailable | None | Unchanged | None | Retry then DLT |
| Transaction failure | Rolled back | Rolled back | Rolled back | Retry then DLT |

## Source Coverage

The workflow implements U04 in `unit-of-work.md`, maps US-W1-004 from `unit-of-work-story-map.md`, satisfies confirmation/messaging acceptance in `requirements.md`, preserves owners from `components.md`, realizes exact methods in `component-methods.md`, and enforces the Kafka-only Booking-to-CMM topology in `services.md`.

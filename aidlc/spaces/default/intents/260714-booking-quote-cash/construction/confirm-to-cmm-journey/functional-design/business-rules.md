# Business Rules - U04 Confirm to CMM Journey

## Booking Confirmation Rules

| ID | Rule | Outcome when false |
|---|---|---|
| BR-U04-001 | Confirmation requires persisted `PRICED` state and a complete immutable quote for the current revision. | 409; no state/outbox change. |
| BR-U04-002 | The reference-validation fingerprint must still match canonical Booking fields. | 409 revalidation required. |
| BR-U04-003 | W1 confirmation has one route, one equipment assignment, quantity one, and a valid ISO 6346 `equipmentId`. | 422 validation; no event. |
| BR-U04-004 | `Idempotency-Key` is required; same key/hash replays and changed hash conflicts. | 400/409. |
| BR-U04-005 | One logical `booking.confirmed` event exists per booking revision. | Row lock + UUIDv5 + unique outbox constraint. |
| BR-U04-006 | Confirmation never invokes CMM over HTTP and never falls back to HTTP if Kafka is unavailable. | Implementation/architecture failure. |

## Canonical Contract Rules

- Envelope field names are exactly `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`, and `data`.
- `dataSchemaVersion` is Avro `int` value `1`, never semantic-version string `"1.0.0"`.
- `data` field names are exactly `bookingId`, `bookingRevision`, `routing`, and `equipment`; nested names match the `.avsc` exactly.
- Routing is ordered and each `legSequence` is contiguous and 1-based. Load/discharge are uppercase canonical UN/LOCODE values; voyage ID is nonblank.
- Equipment preserves `equipmentTypeCode`, integer `quantity`, and nullable contract `equipmentId`; live W1 requires non-null valid ISO 6346 identity.
- `booking.confirmed` is keyed only by `bookingId`, preserving per-booking partition order.
- W1 rejects old flat event fields. Root and service-local schemas are byte-for-byte equivalent.
- Event data contains no customer name/contact, price amount, agreement details, or arbitrary Booking attributes.

## Transaction and Idempotency Rules

- Booking status/revision, command receipt, audit, and outbox commit atomically.
- CMM receipt, journey/highest revision, audit, and status outbox commit atomically.
- Consumer dedupe identity is envelope `id`, never producer command idempotency key.
- Duplicate envelope is a no-op. A distinct envelope carrying a lower/equal business revision is recorded then ignored.
- CMM applies only a strictly higher `bookingRevision`; route and equipment type reconcile only for the same physical `equipmentId`.
- A changed physical container on a higher revision is `UNSUPPORTED_CONTAINER_REPLACEMENT`, rolls back, and goes to DLT in W1.
- A new/applied revision creates at most one logical initial status outbox row, protected by deterministic event identity and unique business-fact constraint.

## Journey and Planned Status Rules

- CMM stores ordered routing legs and canonical equipment assignment, not only flat origin/destination aliases.
- All route locations are revalidated against live Reference Data before application. Provider unavailable is transient; inactive/missing/mismatch is permanent.
- Initial status is planned `LOAD`, classifier `PLN`, status `PLANNED`, indicator `LADEN`, non-transshipment, at POL.
- A planned fact is not movement history and must not be represented as `ACT` or claim physical loading occurred.
- Initial `movementId` is null; confirmation/ingestion time is the W1 fixture's planned and received timestamp.
- Status topic key is `bookingRef:containerRef`.

## Listener and DLT Rules

- Initial delivery plus two retries use delays 250 ms and 1 second only for transient failures.
- Deserialization, unsupported source/type/version, schema/invariant, invalid ISO 6346, and inactive-reference failures go directly to `booking.confirmed.DLT`.
- Exhausted transient failures go to the same DLT; source partition proceeds.
- DLT retains original key/value and origin/error headers for seven days.
- Replay after environmental correction republishes that original key/value. Payload correction may publish a corrected canonical value only with the same envelope ID and an audit of original/corrected hashes and field differences.
- Replay preserves envelope ID, requires authorization, and writes actor/reason/origin audit. No receipt is created for a failed transaction.
- Non-local startup fails closed without Kafka, Schema Registry, service identity, listener, DLT, and shared publisher/registrar configuration. Local noop cannot satisfy live acceptance.

## UI Rules

- Confirm is enabled only in `PRICED`; pending/manual/invalid states cannot submit.
- After local confirmation, detail shows `CONFIRMED` and a distinct `PENDING_EVENT` journey state until U05's returned projection arrives.
- Broker delay/failure does not roll back or mislabel the committed Booking confirmation.
- Duplicate activation returns the same confirmed revision without duplicate notices or records.
- UI never calls CMM, reads CMM database, or fabricates a journey/status response.

## Source Coverage

Rules refine U04 from `unit-of-work.md`, US-W1-004 in `unit-of-work-story-map.md`, FR/NFR messaging acceptance in `requirements.md`, component ownership in `components.md`, transaction/listener signatures in `component-methods.md`, and Kafka/DLT/ordering semantics in `services.md`.

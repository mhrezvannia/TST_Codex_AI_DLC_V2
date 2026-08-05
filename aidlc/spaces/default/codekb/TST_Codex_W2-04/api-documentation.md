# API Documentation

## Container Movement REST API

All routes are implemented by `services/container-movement-service/container/src/main/java/com/linercore/platform/containermovement/container/api/ContainerMovementApiController.java` under `/api/container-movement`.

| Method | Path | Purpose | Baseline observations |
|---|---|---|---|
| `GET` | `/journeys?actor={actor}&limit={limit}` | List recent journeys. | Actor and bounded limit are query inputs; no CMM frontend currently consumes this as a canonical module page. |
| `POST` | `/journeys` | Create a journey directly. | Retained administrative/test seam; the normal business path is `booking.confirmed`. |
| `GET` | `/journeys/{id}` | Read journey detail. | Returns current status, expected movements, and history from the CMM aggregate. |
| `GET` | `/bookings/{bookingId}/journey` | Resolve a journey by Booking identity. | Supports cross-linking but remains a CMM-owned read. |
| `POST` | `/journeys/{id}/movements` | Capture a movement. | Baseline request uses generic event type, container, location, event time, actor, idempotency key, and correlation; it has no DCSA move/classifier/empty indicator/sequence fields. |

The controller maps missing data to 404, `IllegalArgumentException` to 400, `SecurityException` to 403, and `IllegalStateException` to 409. `ApiErrorResponse` can carry code, message, fields, and correlation, but current handlers use a substituted `local-correlation`. W2-04 needs stable duplicate and sequence rejection codes tied to the caller's correlation, with unchanged-state evidence.

There is no checked-in CMM OpenAPI document. This weakens REST contract review and generated-client/negative-case verification; W2-04 should add or synchronize an executable OpenAPI surface for the evolved capture request and response.

## Booking REST Surface Relevant to W2-04

Booking is implemented by `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java`. Relevant routes include:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/bookings` | Booking list. |
| `GET` | `/api/bookings/{id}` | Booking detail composed with locally persisted movement statuses. |
| `POST` | `/api/bookings/{id}/confirm` | Confirm and enqueue the canonical Booking event. |
| `POST` | `/api/bookings/{id}/reconfirm` | Publish a later booking revision when allowed. |

`apps/booking/app/bookings/[bookingId]/JourneyStatusPanel.tsx` polls the Booking detail route once per second for up to 30 seconds, pauses while hidden, and offers retry after a delayed state. The browser does not query CMM or CMM's database for the Booking projection.

## Asynchronous Contract: Booking to CMM

| Property | Contract/implementation |
|---|---|
| Envelope type | `booking.confirmed` |
| Producer | Booking service |
| Consumer | CMM service |
| Executable Avro | `contracts/avro/booking.confirmed.avsc` |
| AsyncAPI | `contracts/asyncapi/booking-events.yaml` |
| Pact fixture | `contracts/pact/booking-confirmed-message-fixtures.json` |
| Mapper/listener | `BookingConfirmedRecordMapper`, `KafkaBookingConfirmedListener` |
| Key | Booking ID for per-booking ordering |
| Data | `bookingId`, positive `bookingRevision`, ordered `routing[]`, `equipment[]` |

The enterprise documentation names the channel `booking.confirmed`, whereas executable service configuration uses topic `booking.events` and relies on the envelope `type=booking.confirmed`. This is an explicit compatibility decision point, not a safe implicit alias.

The consumer flow validates envelope/source/version, maps ordered routing and equipment, authorizes the service source, deduplicates, rejects stale revisions, validates route locations, creates or reconciles the journey, and enqueues a status fact in one application transaction.

## Asynchronous Contract: CMM to Booking

| Property | Contract/implementation |
|---|---|
| Topic/type | `containermovement.status` |
| Producer | CMM service |
| Consumer | Booking service |
| Partition key | `bookingRef:containerRef` |
| Executable Avro | `contracts/avro/containermovement.status.avsc` |
| Enterprise definition | `docs/enterprise-contracts/async-event-contract-containermovement-status.md` |
| AsyncAPI | `contracts/asyncapi/container-movement-events.yaml` |
| Pact fixture | `contracts/pact/container-movement-status-message-fixtures.json` |
| Producer | `MovementStatusEventMapper`, `KafkaContainerMovementEventPublisher` |
| Consumer | `KafkaContainerMovementStatusListener`, `ContainerMovementStatusRecordMapper` |

Current v1 data fields are `bookingRef`, `containerRef`, nullable `movementId`, `moveCode`, `eventClassifierCode`, `occurredDateTime`, `receivedDateTime`, `derivedStatus`, `emptyIndicatorCode`, `transshipment`, and nullable `location` (`unLocationCode`, `facilityCode`, `facilityTypeCode`). The executable schema and enterprise appendix currently omit `sequenceNumber`, although W2-04 requires it. Producer, consumer, both local schema resources, Pact fixtures, Booking SQL/projection, and compatibility proof must change together. If added to v1, Avro BACKWARD compatibility requires an appropriate default.

Baseline mapping is not yet faithful to the target lifecycle: generic departure maps to `LOAD`, arrival to `DISC`, and delivery/exception to `DELV`/`EXCP`; empty indicator is hardcoded `LADEN` and transshipment is hardcoded false. W2-04 must publish the accepted DCSA command facts rather than infer lossy values from generic event types.

## Delivery, Ordering, and Idempotency

Both directions use at-least-once Kafka delivery and transactional outbox/receipt patterns. CMM confirmation intake deduplicates the upstream event and records booking revision behavior. Movement capture has a separate idempotency lookup. Booking inserts a consumed-event receipt keyed by envelope ID and then guarded-upserts its projection.

Booking's baseline projection ordering is `(occurredDateTime, classifierRank, receivedDateTime, eventId)`, where `PLN < EST < ACT`. W2-04's sequence requirement must become the primary semantic journey order while still retaining event times for late-event diagnosis. Duplicate envelope receipts remain no-ops; a distinct stale event remains auditable without regressing state.

## Contract Evolution and Sign-off

- Avro compatibility is BACKWARD and must be checked against Schema Registry.
- Extending `moveCode` string vocabulary is not itself an Avro schema change, but semantic validation and fixtures must remain synchronized.
- Envelope or field changes require producer/consumer review and updated Avro, AsyncAPI, examples, Pact fixtures, code mappers, persistence, and UI types.
- `contracts/pact/container-movement-status-message-fixtures.json` currently remains pending verification and cannot be cited as signed proof.
- The enterprise contract points to `container-service/contracts/avro/...`, which is not the executable repository path; `contracts/avro/containermovement.status.avsc` is the checked-in artifact observed here.

## Deferred Interfaces

No public DCSA Open Host Service or EDI movement intake is part of W2-04. Terminals/depots, CODECO/COARRI, public track-and-trace query APIs, multi-leg routing, fleet registry, depot stock, and M&R interfaces remain later intents. They must not be added to the W2-04 REST or event contract as speculative fields.

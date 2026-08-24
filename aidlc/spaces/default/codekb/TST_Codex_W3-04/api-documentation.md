# API Documentation

## Booking Service HTTP API

Implementation: `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java`, base path `/api/bookings`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/bookings` | Create a booking. |
| POST | `/api/bookings/drafts` | Create a draft booking. |
| GET | `/api/bookings` | List bookings. |
| GET | `/api/bookings/{id}` | Read one booking. |
| POST | `/api/bookings/{id}/validate` | Validate references and booking invariants. |
| POST | `/api/bookings/{id}/price` | Request pricing. |
| POST | `/api/bookings/{id}/pricing-snapshot` | Attach/persist pricing snapshot. |
| POST | `/api/bookings/{id}/confirm` | Confirm a booking. |
| POST | `/api/bookings/{id}/amend` | Amend a confirmed booking. |
| POST | `/api/bookings/{id}/reconfirm` | Reconfirm an amendment. |

Implementation: `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingReferenceOptionController.java`.

| Method | Path | Query |
|---|---|---|
| GET | `/api/reference-options` | `set` and `search` |

The create request currently carries `customerId`; a routing object with `legSequence`, `loadUnLocode`, `dischargeUnLocode`, and `voyageId`; equipment `type`, `quantity`, and `equipmentId`; `currency`, `cargoMode`, reefer/dangerous-goods flags; and `Map<String,String> attributes`. It lacks first-class W3-04 party, commercial-reference, cargo, package, weight, and volume fields. Full Booking CRUD/lifecycle OpenAPI is absent; `contracts/openapi/booking-pricing.v1.yaml` documents only `POST /api/bookings/{bookingId}/price`.

## Booking Web/BFF Surfaces

`apps/booking/app/api` exposes list/create/read plus amend, confirm, price, reconfirm, validate, reference-options, and health routes. `apps/booking/lib/bookings.ts` applies session-actor resolution, same-origin JSON handling, a 32 KiB body limit, correlation propagation, service credentials, a 2.5-second command timeout, and pricing authorization.

`apps/shell/app/api/booking` provides a second Booking BFF hop for the shared-shell `/booking` route family. The Booking-local route family uses `/bookings`. This duplication is a compatibility and ownership risk: the shell form sends requested departure while the Booking-local form does not.

## Reference Data API

Contract: `contracts/openapi/reference-data-service.yaml`. Implementation: `services/reference-data-service/container/src/main/java/com/linercore/platform/referencedata/container/api/ReferenceDataController.java`, base path `/reference-sets`.

| Method | Path |
|---|---|
| GET | `/reference-sets` |
| GET, POST | `/reference-sets/{set}/records` |
| GET, PUT | `/reference-sets/{set}/records/{id}` |
| POST | `/reference-sets/{set}/records/{id}/deactivate` |
| POST | `/reference-sets/{set}/records/{id}/reactivate` |
| POST | `/reference-sets/{set}/records/validate` |
| GET | `/reference-sets/{set}/records/{id}/history` |
| GET | `/reference-sets/events` |
| POST | `/reference-sets/events/claims` |
| POST | `/reference-sets/events/publish` |

Booking currently exposes only `PARTY_CUSTOMER`, `LOCATION`, `VESSEL_VOYAGE`, and `EQUIPMENT_TYPE`. Reference Data also contains Commodity and Trade Lane capabilities, but Booking does not expose the commodity or party-role sets needed by W3-04. The current Booking voyage option filter passes `recordType`, origin, destination, and carrier voyage number; it omits scheduled departure/arrival and has no cargo cutoff, documentation deadline, or OHS deadline field to pass.

## Pricing API

Contract: `contracts/openapi/pricing.v1.yaml`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/pricing-requests` | Submit a price request. |
| GET | `/api/manual-pricing-cases` | List manual-pricing cases. |
| GET | `/api/manual-pricing-cases/{caseId}` | Read a manual-pricing case. |

Booking sends vendor JSON with `Idempotency-Key`, correlation data, service identity, and token. `PricingInput` maps booking number to `bookingRef`, validated POL/POD/customer/equipment, trade lane/commodity/requested date attributes, quantity/TEU, and amendment sequence. It creates canonical JSON, a SHA-256 fingerprint, and key `bookingRef:amendmentSeq`. `ChargePricingPortAdapter` validates enrichment, response correlation/equality, and quantity-times-unit arithmetic before producing immutable `BookingPricingSnapshot` schema version 2. Current fallbacks `NA-EU` and `commodity-general` are unsafe for exact pricing.

## Container Movement API

Implementation: `services/container-movement-service/container/src/main/java/com/linercore/platform/containermovement/container/api/ContainerMovementApiController.java`, base path `/api/container-movement`.

| Method | Path |
|---|---|
| GET, POST | `/api/container-movement/journeys` |
| GET | `/api/container-movement/journeys/{id}` |
| GET | `/api/container-movement/bookings/{bookingId}/journey` |
| POST | `/api/container-movement/journeys/{id}/movements` |

## Asynchronous Contract

Confirmation follows `BookingApplicationService.confirm`/`reconfirm` -> `BookingEventMapper.confirmedEvent` -> `booking_outbox` -> `KafkaBookingEventPublisher`. Runtime/Compose publishes to `booking.events`; Enterprise/AsyncAPI names the channel `booking.confirmed`.

The Avro schema copies under `contracts/avro` and Booking/CMM resources have SHA-256 `F718793FFCB3E64E67681DF2DCF92211B1354D39DB20C9DBC6F82932F7A9F5BF`. `equipmentId` is nullable with default `null`. Consumption follows `KafkaBookingConfirmedListener` -> `BookingConfirmedRecordMapper` -> `BookingConfirmedEvent` -> `ContainerMovementApplicationService.consumeBookingConfirmed`. CMM presently rejects null IDs and assumes one assignment of quantity one, contradicting the wire contract.

## Contract Evidence Boundary

The endpoints and contracts above are static findings. No HTTP request, contract-test suite, broker publication, schema-registry compatibility check, or consumer execution was run. A complete Booking OpenAPI and executable cross-service confirmation contract remain gaps.

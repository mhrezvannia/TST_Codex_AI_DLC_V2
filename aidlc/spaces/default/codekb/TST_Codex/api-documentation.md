# API Documentation - TST_Codex

## Source Context

This artifact summarizes API surfaces found through Graphify and focused code/contract scans. It reflects implemented code plus contract files present in the repository.

## Implemented HTTP APIs

### Reference Data Service

Controller: `services/reference-data-service/container/src/main/java/com/linercore/platform/referencedata/container/api/ReferenceDataController.java`

Base path: `/reference-sets`

Observed routes:

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/reference-sets` | List reference sets |
| GET | `/reference-sets/{set}/records` | List records for a set |
| GET | `/reference-sets/{set}/records/{id}` | Fetch one reference record |
| POST | `/reference-sets/{set}/records` | Create reference record |
| PUT | `/reference-sets/{set}/records/{id}` | Update reference record |
| POST | `/reference-sets/{set}/records/validate` | Validate reference record payload |
| GET | `/reference-sets/{set}/records/{id}/history` | Read record history |
| GET | `/reference-sets/events` | Query outbox event publication status |
| POST | `/reference-sets/events/claims` | Claim outbox events |
| POST | `/reference-sets/events/publish` | Publish claimed outbox batch |

Published contract: `contracts/openapi/reference-data-service.yaml`.

### Identity Service

Controller: `services/identity-service/container/src/main/java/com/linercore/platform/identity/container/api/IdentityAuthorizationController.java`

Base path: `/internal/identity`

Observed routes:

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/internal/identity/authorize` | Evaluate authorization |
| POST | `/internal/identity/roles/assign` | Assign role |
| POST | `/internal/identity/effective-permissions` | Resolve effective permissions |
| GET | `/internal/identity/roles` | List roles |

Published contract: `contracts/openapi/identity-service.yaml`.

### Charge Agreement Service

Controller: `services/charge-agreement-service/container/src/main/java/com/linercore/platform/chargeagreement/container/api/ChargeAgreementApiController.java`

Base path: `/api/charge-agreements`

Observed routes:

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/charge-agreements` | Search agreements |
| POST | `/api/charge-agreements` | Create agreement |
| GET | `/api/charge-agreements/{id}` | Read agreement detail |
| PUT | `/api/charge-agreements/{id}` | Update agreement |
| POST | `/api/charge-agreements/{id}/approve` | Approve agreement |
| POST | `/api/charge-agreements/{id}/suspend` | Suspend agreement |
| POST | `/api/charge-agreements/{id}/expire` | Expire agreement |
| GET | `/api/charge-agreements/active-lookup` | Find active matching agreement/terms |
| GET | `/api/charge-agreements/module-info` | Module info endpoint |

Published contract: `contracts/openapi/charge-agreements.yaml`.

## Event and Contract Artifacts

Repository contract artifacts:

- OpenAPI: `contracts/openapi/reference-data-service.yaml`, `contracts/openapi/identity-service.yaml`, `contracts/openapi/charge-agreements.yaml`.
- Avro: `contracts/avro/referencedata.*.changed.avsc` for reference-data changed events.
- Pact fixtures: `contracts/pact/identity-provider-fixtures.json`, `contracts/pact/reference-data-provider-fixtures.json`, `contracts/pact/reference-data-message-fixtures.json`.
- Contract catalog: `contracts/catalog/contract-catalog.json`.

The contract catalog currently lists Shared Platform contracts and marks compatibility as pending.

## Enterprise Contract Documents

Authoritative enterprise contract documents exist under `docs/enterprise-contracts/`:

- `async-event-contract-booking-confirmed.md`
- `bilateral-contract-booking-charge-pricing.md`
- `async-event-contract-containermovement-status.md`

These define required future interactions:

| Contract | Required direction | Implementation status |
|----------|--------------------|-----------------------|
| `booking.confirmed` | Booking to CMM | Documented, not implemented |
| `containermovement.status` | CMM to Booking | Documented, not implemented |
| `pricing.request` / `pricing.result` | Booking to/from Charge | Documented, not implemented as executable pricing API |
| `pricing.dnd-request` / `pricing.dnd-result` | Booking to/from Charge | Documented, not implemented |

## API Gaps

- No Booking controller/API implementation was found.
- No CMM controller/API implementation was found.
- No executable pricing OpenAPI provider contract was found for `pricing.request`/`pricing.result`.
- No AsyncAPI files were found for the enterprise events, only markdown contract skeletons.
- No Schema Registry compatibility execution evidence was found; catalog status is pending.
- No Pact Broker integration was found beyond local fixtures/scripts.

## API Design Implications

Application Design must add executable API and event contracts before any integration readiness claim:

- OpenAPI for pricing and Booking/CMM synchronous APIs.
- Avro schemas and AsyncAPI for `booking.confirmed` and `containermovement.status`.
- HTTP Pact for Booking/Charge pricing.
- Message-pact for Booking/CMM movement events.
- Idempotency keys, correlation IDs, deduplication, ordering, and observability metadata.

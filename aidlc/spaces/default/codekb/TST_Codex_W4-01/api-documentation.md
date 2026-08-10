# API Documentation — TST_Codex_W4-01

## REST API surface

The following controller routes were verified in the code graph. Infrastructure connection URLs were excluded from route counts.

### Reference Data service — 12 routes

| Method | Path | Responsibility |
|---|---|---|
| GET | `/reference-sets` | List reference sets |
| GET, POST | `/reference-sets/{set}/records` | List or create records |
| GET, PUT | `/reference-sets/{set}/records/{id}` | Read or update a record |
| POST | `/reference-sets/{set}/records/validate` | Validate proposed record data |
| POST | `/reference-sets/{set}/records/{id}/deactivate` | Deactivate record |
| POST | `/reference-sets/{set}/records/{id}/reactivate` | Reactivate record |
| GET | `/reference-sets/{set}/records/{id}/history` | Read record history |
| GET | `/reference-sets/events` | List publication events |
| POST | `/reference-sets/events/claims` | Claim events for publication |
| POST | `/reference-sets/events/publish` | Mark/publish event batch |

### Charge Agreement service — 21 routes

| Method | Path | Responsibility |
|---|---|---|
| GET, POST | `/api/charge-agreements` | List or create agreements |
| GET, PUT | `/api/charge-agreements/{id}` | Read or update agreement |
| POST | `/api/charge-agreements/{id}/approve` | Approve agreement |
| POST | `/api/charge-agreements/{id}/suspend` | Suspend agreement |
| POST | `/api/charge-agreements/{id}/expire` | Expire agreement |
| GET | `/api/charge-agreements/active-lookup` | Resolve an applicable active agreement |
| POST | `/api/charge-agreements/{agreementId}/versions` | Create agreement version |
| POST | `/api/charge-agreements/{agreementId}/versions/{agreementVersionId}/approve` | Approve agreement version |
| GET, POST | `/api/charge-rates` | List or create rates |
| GET | `/api/charge-rates/{rateId}` | Read rate detail |
| GET | `/api/charge-rates/{rateId}/history` | Read rate history |
| PUT | `/api/charge-rates/{rateId}/versions/{versionId}` | Update draft rate version |
| POST | `/api/charge-rates/{rateId}/versions/{versionId}/approve` | Approve rate version |
| POST | `/api/charge-rates/{rateId}/versions/{versionId}/successor` | Create successor version |
| GET | `/api/manual-pricing-cases` | List manual-pricing cases |
| GET | `/api/manual-pricing-cases/{caseId}` | Read manual-pricing case |
| POST | `/pricing-requests` | Request authoritative pricing |
| GET | `/api/charge-agreements/module-info` | Read module metadata |

### Booking service — 11 routes

| Method | Path | Responsibility |
|---|---|---|
| GET, POST | `/api/bookings` | List or create bookings |
| POST | `/api/bookings/drafts` | Create draft booking |
| GET | `/api/bookings/{id}` | Read booking detail |
| POST | `/api/bookings/{id}/validate` | Validate booking |
| POST | `/api/bookings/{id}/price` | Request price |
| POST | `/api/bookings/{id}/pricing-snapshot` | Store pricing snapshot |
| POST | `/api/bookings/{id}/confirm` | Confirm booking |
| POST | `/api/bookings/{id}/amend` | Amend booking |
| POST | `/api/bookings/{id}/reconfirm` | Reconfirm booking |
| GET | `/api/reference-options` | Read reference options for Booking |

### Container Movement service — 5 routes

| Method | Path | Responsibility |
|---|---|---|
| GET, POST | `/api/container-movement/journeys` | List or create journeys |
| GET | `/api/container-movement/journeys/{id}` | Read journey detail |
| GET | `/api/container-movement/bookings/{bookingId}/journey` | Find journey by Booking ID |
| POST | `/api/container-movement/journeys/{id}/movements` | Capture a movement event |

## Frontend and authentication BFF surface

Verified auth route handlers cover callback, request access, session, sign-in, sign-out, and health. Domain applications contain server-route/BFF clients that proxy authenticated requests and add correlation/session context. Exact externally exposed Nginx prefixes and whether Reference, Charge, and Container Movement routes are mounted through the same shell session were not opened or runtime-tested.

## Asynchronous contracts

Verified Avro/published-language families include:

- `booking.confirmed`: emitted after Booking confirmation and consumed by Container Movement.
- `containermovement.status`: emitted by Container Movement and consumed by Booking for the journey projection.
- Charge Agreement/rate lifecycle event families.
- Reference Data event families.

Pact/provider examples and contract catalogs exist. Static evidence also indicates correlation, idempotency, and outbox semantics. Exact broker topic configuration, compatibility mode, retry/dead-letter behavior, and live producer-consumer compatibility were not executed here.

## Contract quality and limitations

No concrete OpenAPI YAML/JSON specification was found; only README-level OpenAPI references were identified. Therefore controllers are the verified REST source for this snapshot, but consumers lack a checked-in executable REST contract comparable to the Avro assets. Payload schemas, error mappings, authorization requirements, pagination parameters, and response examples should be generated/verified from source before treating this file as a client SDK contract.

# API Documentation — Charge, Booking, and Supporting Services

## Contract Authority and Status

This document describes the static baseline at commit `c2f13dd`. It does not claim that intended W2-03 fields or operations are implemented.

- `contracts/openapi/pricing.v1.yaml` is the cataloged canonical Charge pricing seam and matches the implemented `POST /pricing-requests` path.
- `contracts/openapi/charge-agreements.yaml` contains the legacy agreement contract and advertises `/api/pricing/quote` and `/api/pricing/dnd`, which diverge from the current implementation.
- Catalog version `0.2.0` marks registered contracts `candidate_executable` and compatible.
- D&D fixtures/contracts exist, but the Booking local adapter explicitly reports D&D pricing as unimplemented.

The authority/deprecation relationship between the two Charge OpenAPI files remains an open design decision. W2-03 should evolve one canonical seam compatibly rather than create a third pricing contract.

## Charge Agreement HTTP API

Baseline controller: `ChargeAgreementApiController`.

| Method | Path | Baseline responsibility |
|---|---|---|
| `GET` | `/api/charge-agreements` | Search/list agreements |
| `POST` | `/api/charge-agreements` | Create a Draft agreement |
| `GET` | `/api/charge-agreements/{id}` | Read an agreement |
| `PUT` | `/api/charge-agreements/{id}` | Update a Draft agreement |
| `POST` | `/api/charge-agreements/{id}/approve` | Approve a complete Draft |
| `POST` | `/api/charge-agreements/{id}/suspend` | Suspend an Approved agreement |
| `POST` | `/api/charge-agreements/{id}/expire` | Expire an agreement |
| `GET` | `/api/charge-agreements/active-lookup` | Resolve an active agreement using request criteria |
| `GET` | `/api/charge-agreements/module-info` | Return module metadata |

Lifecycle rules enforced below the controller include Draft-only editing/term replacement, at least one term before approval, and no edit after approval. A numeric version advances on mutation. The API does not expose separately addressable immutable approved versions in the baseline.

## Charge Pricing HTTP API

### Request

| Item | Baseline contract |
|---|---|
| Method/path | `POST /pricing-requests` |
| Media type | `application/vnd.api.v1+json` |
| Required headers | `Idempotency-Key`, `X-Correlation-Id`; Booking actor identity is propagated |
| Business context | Booking reference, trade lane, POL, POD, equipment, party/customer, commodity, reefer/DG flags, dates, equipment quantity, TEU, amendment sequence |

Charge persists request idempotency/lease state. Booking derives a stable SHA-256 request identifier from Booking/revision/customer/routing/equipment/idempotency material.

### Successful response

The baseline HTTP result contains:

- `bookingRef`
- `pricingBasis`
- `pricingRef`
- charge lines with `chargeCode`, `category`, `amount`, and `currency`

The Charge application’s internal `PricingLine` also contains term identifier, basis, quantity, and rate, but `PricingApiController` does not expose those fields. This is a confirmed information-loss seam.

### Baseline non-success mapping

| Charge application outcome | HTTP mapping | Booking mapping |
|---|---|---|
| No applicable rate | Manual case + `NO_RATE` | HTTP 404, then manual pricing result/status |
| Ambiguous/no applicable term | Manual case | HTTP 422, then manual pricing result/status |
| Automatic result | Partial itemised response | Pricing snapshot with flattened `quotedAmounts` |

The requested `MANUAL_PRICING_REQUIRED` vocabulary is not yet explicit at every layer.

### Intended W2-03 compatible extension

The intended response adds, rather than merely infers:

- authority type and identifier;
- immutable agreement/rate version identifier;
- per-line charge code/category, basis, quantity, rate, amount, and currency;
- applicability/effective evidence needed for audit;
- an explicit `MANUAL_PRICING_REQUIRED` result/code for no-rate or ambiguous cases.

The exact schema, status-code strategy, and backward-compatibility mechanism remain design work. This list is not a baseline API declaration.

## Booking HTTP and Charge Integration API

Baseline Booking routes under `/api/bookings` include create/draft, detail, recent list/search, reference validation, pricing, snapshot storage, confirmation, amendment, and reconfirmation. The W2-03-critical operation is:

| Method | Path | Responsibility |
|---|---|---|
| `POST` | `/api/bookings/{id}/price` | Invoke `PricingPort` and the Charge pricing adapter for a Booking |

`ChargePricingPortAdapter` uses `HttpChargePricingClient` to call `{chargeBaseUrl}/pricing-requests` and propagates idempotency, correlation, and actor headers.

On success, Booking currently flattens returned lines into keys such as:

- `line.1.chargeCode`
- `line.1.category`
- `line.1.basis`
- `line.1.quantity`
- `line.1.amount`
- `line.1.currencyId`

Because Charge does not return basis/quantity/rate, the client forces quantity to `1`, leaves basis blank, and has no rate field. Booking detail serializes the snapshot and renders the generic map. A manual result sets Booking status `MANUAL_PRICING` and the UI shows “Manual pricing required.”

Amend/reconfirm routes and revision-aware request identity exist. There is no dedicated baseline `reprice` endpoint; the intended explicit reprice action may reuse the existing price command or add a narrowly specified route.

## Frontend BFF Surfaces

### Existing baseline

- Auth BFFs: callback, sign-in, sign-out, session, request-access, and health.
- Booking BFFs: list/detail, validation, price, confirmation, and reference options.
- Reference Data BFFs: record/history/permissions and administrative commands.
- Charge BFFs: health and module-info only.

Booking BFF command handlers derive actors from signed sessions, enforce same-origin JSON requests, cap bodies at 32 KiB, require idempotency keys where applicable, and propagate service/correlation metadata. Charge’s intended BFFs should reuse these patterns.

### Intended Charge BFF boundary

W2-03 needs Charge-local routes for listing, reading, drafting/editing, approving, and managing rates/versions plus controlled reference options. These routes do not exist at baseline and must not accept caller-forged actor identity.

## Supporting Internal APIs

- **Identity**: authorize, role assignment, effective permissions, and role listing under `/internal/identity`.
- **Reference Data**: reference sets/records, create/update, activation, validation, history, event/claim/publish surfaces.
- **Container Movement**: journey list/create/detail, lookup by Booking, and movement capture under `/api/container-movement`.

Charge and Booking should consume controlled Reference Data identifiers rather than introduce local free-text authorities.

## Asynchronous Contracts

AsyncAPI/Avro and fixtures cover:

- Reference Data changes.
- Booking confirmed events.
- Container movement status events.
- Charge agreement lifecycle events.

Compose initializes `booking.events`, `containermovement.status`, `referencedata.events`, and `charge-agreement.events`. Outbox/publisher implementations exist, although default unsupported methods on several `OutboxRepository` interfaces are a latent adapter-wiring risk.

## API Gaps and Decisions Required

- Choose and document the authoritative Charge OpenAPI; deprecate or reconcile the other file.
- Define immutable version identifiers and how clients retrieve/version-reference approved authorities.
- Define pricing business date and eliminate wall-clock/default-lane/default-commodity ambiguity.
- Define exact local-charge origin-only and equipment applicability fields.
- Define whether `MANUAL_PRICING_REQUIRED` is a structured success alternative, error response, Booking status, or an explicit mapping across all three.
- Preserve old Booking snapshot decoding and consumer compatibility while adding typed itemisation.


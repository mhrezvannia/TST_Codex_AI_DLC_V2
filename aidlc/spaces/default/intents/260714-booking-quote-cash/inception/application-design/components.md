# Components - W1-01 Booking Quote-to-Cash

## Design Context

W1 extends the brownfield ports-and-adapters services described by `architecture.md` and `component-inventory.md`. It preserves the shared `platform-messaging` publisher, registrar, relay, retry, and noop guard from `team-practices.md`; it does not create a second messaging platform. The component boundaries implement `requirements.md` and the seven vertical slices in `stories.md`.

## Component Inventory

| ID | Component | State | Owns | Public boundary |
|---|---|---|---|---|
| C01 | Canonical W1 contract pack | Extend | Enterprise Avro envelope/data schemas, AsyncAPI, examples, message fixtures, pricing OpenAPI/Pact | `booking.confirmed`, `containermovement.status`, `POST /pricing-requests` |
| C02 | Booking domain model | Refactor | Booking lifecycle, ordered `routing[]`, `equipment[]`, immutable pricing snapshot | Framework-free records and lifecycle methods |
| C03 | Booking application service | Extend | Create, validate, price, confirm, event consumption, detail assembly | Existing commands plus transactional movement-status ingestion |
| C04 | Booking persistence adapters | Extend | Booking snapshots, command idempotency, consumed-event receipts, latest movement projection, outbox | Application repository ports |
| C05 | Booking messaging adapters | Extend | Canonical publish mapping and `containermovement.status` consumption | Shared publisher/registrar plus Spring Kafka listener |
| C06 | Charge pricing API | Extend | Idempotent contract request, active-agreement resolution, itemized result/manual case | `POST /pricing-requests` with v1 media type |
| C07 | CMM application service | Extend | Canonical confirmation ingestion, revision reconciliation, journey creation, initial status outbox | Transactional `consumeBookingConfirmed` |
| C08 | CMM persistence adapters | Extend | Journey per booking/container, consumed-event receipts, highest revision, status outbox | Application repository ports |
| C09 | CMM messaging adapters | Extend | `booking.confirmed` consumption and canonical status publication | Shared publisher/registrar plus Spring Kafka listener |
| C10 | Booking HTTP API | Extend | Booking commands and composite detail response | `/api/bookings` and command subpaths |
| C11 | Booking Next.js app/BFF | Complete | Stable list/create/detail routes, local BFF, bounded status polling | `/bookings`, `/bookings/new`, `/bookings/[bookingId]`, `/api/bookings/**` |
| C12 | Quality and live-proof harness | Extend | Contract, backend, frontend, replay/restart, Compose, and audit evidence | Root quality scripts and `artifacts/` evidence index |

## Backend Responsibilities

### C02-C05 Booking

- `Booking` owns contract-shaped routing and equipment values. W1 stores one routing leg and one equipment assignment but retains array-shaped domain types.
- `PricingSnapshot` stores `pricingBasis`, `pricingRef`, all itemized charges, applicable D&D trigger metadata, request/correlation identity, and priced time. Confirmation reads only this persisted snapshot.
- `BookingApplicationService.confirm` commits booking status/revision and one `booking.confirmed` outbox event atomically. `BookingApiController` returns immediately and makes no CMM call.
- Confirmation takes `Idempotency-Key`, locks or compare-and-sets the priced booking row, and uses deterministic event identity plus a unique `(event_type, booking_id, revision)` outbox constraint. Concurrent/repeated confirmation returns the already-confirmed booking and never creates another logical event.
- `BookingApplicationService.consumeMovementStatus` commits one envelope receipt and the status projection in the same transaction. Duplicate envelope IDs are no-ops; older business facts cannot replace a newer projection.
- `JdbcMovementStatusProjectionRepository` owns the latest status keyed by `(bookingRef, containerRef)`. The Booking aggregate no longer uses its generic attributes map as the authoritative movement read model.
- `KafkaBookingEventPublisher` continues to publish through `KafkaGenericRecordPublisher`; its mapper changes to the exact common envelope fields `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`, and nested `data`.
- `KafkaContainerMovementStatusListener` is a thin transport adapter: deserialize `GenericRecord`, validate source/type/schema, map to the application event, invoke the service, and let exceptions control Kafka acknowledgment/retry.

### C06 Charge

- `ChargeAgreementApplicationService.price` remains the pricing engine. W1 expands its request/result model to the bilateral contract rather than duplicating calculation in Booking.
- `PricingApiController` owns `/pricing-requests`, media-type negotiation, idempotency/correlation headers, status/error mapping, and the exact DTOs in `contracts/openapi/pricing.v1.yaml`.
- `contracts/pact/booking-charge-pricing-fixtures.json` becomes the executable Booking consumer/Charge provider fixture for the same endpoint and fields; `contracts/catalog/contract-catalog.json` binds both artifacts.
- `PricingClaimService` commits a ten-second `IN_PROGRESS` owner lease in a short `REQUIRES_NEW` transaction, runs calculation outside the claim transaction, then completes with a second fenced `REQUIRES_NEW` CAS. Same key/hash after completion replays; a different hash or `(bookingRef, amendmentSeq)` collision conflicts; a live claim returns `PRICING_IN_PROGRESS`; one contender may reclaim an expired lease while stale-owner completion is rejected.
- Agreement resolution runs first; a `TariffPricingPort` is consulted second. W1 has no tariff store, so its explicit adapter resolves none until W2-03, and `NO_RATE` means neither owner returned a rate. The contract and provider DTO still support both `AGREEMENT` and `TARIFF` results.
- `ManualPricingCaseRepository` remains the durable owner for `NO_RATE` and contract-defined manual outcomes. No partial charge list is returned for a manual result.
- Booking owns the operator-facing manual-pricing work item and confirm block. It links a reached-Charge manual case by request/correlation; transport/circuit failures create only the Booking work item.

### C07-C09 CMM

- `ContainerMovementApplicationService.consumeBookingConfirmed` remains the domain transaction boundary but deduplicates on envelope `id`, not the producer idempotency key.
- `ContainerJourney` reconciles only a higher `bookingRevision` and is identified by `(bookingId, containerRef)`; the W1 fixture has exactly one equipment assignment with quantity one.
- New journey creation or a higher revision commits journey state, the consumed-event receipt, and one canonical `containermovement.status` outbox row atomically.
- The initial return event uses a contract-valid planned equipment state (`eventClassifierCode=PLN`) and the required ISO 6346 `containerRef`. Later capture remains able to emit validated ACT/EST movement facts.
- `KafkaBookingConfirmedListener` mirrors the Booking listener boundary. `KafkaContainerMovementEventPublisher` remains a service-specific mapper over the shared publisher.
- CMM revalidates the event's routing UN/LOCODE references through its existing Reference Data port before applying a journey.

## Executable Pricing Contract

The authoritative checked-in shape is `contracts/openapi/pricing.v1.yaml`; the HTTP interaction fixture is `contracts/pact/booking-charge-pricing-fixtures.json`. Construction replaces the current `/api/pricing/quote` fixture. The OpenAPI defines:

- Required request headers: `Idempotency-Key` and `X-Correlation-Id`; content/accept type `application/vnd.api.v1+json`.
- `PricingRequest`: `bookingRef`, `tradeLane`, `pol`, `pod`, `equipmentType`, `partyId`, `commodityCode`, `reeferIndicator`, `dgIndicator`, typed `dates`, and typed `quantities` including `amendmentSeq`.
- `PricingResult`: `bookingRef`, `pricingBasis` (`AGREEMENT|TARIFF`), `pricingRef`, non-empty `charges[]` (`chargeCode`, `category`, decimal `amount`, `currency`), and `applicableDndRuleTypes[]` with rule/start/end move and empty-indicator fields.
- Standard errors and statuses: 400 `PRICING_BAD_REQUEST`, 404 `NO_RATE`, 409 `IDEMPOTENCY_CONFLICT|PRICING_IN_PROGRESS`, 422 `PRICING_VALIDATION|COMMODITY_NOT_ELIGIBLE`, and 503 `PRICING_UNAVAILABLE`; every error carries `code`, `message`, and `correlationId`.
- W1 provider/Pact evidence covers operational `AGREEMENT` pricing and `NO_RATE`; `TARIFF` remains schema-compatible but is explicitly not claimed operational until W2-03 supplies a tariff repository.

## Frontend Responsibilities

`apps/booking` becomes a complete Next.js App Router workspace. Server components/route handlers own backend URLs and local service identity; client components own form interaction, focus, polling, and live announcements. The browser never calls Charge, Reference Data, CMM, Kafka, or Schema Registry directly.

| UI component | Responsibility | Shared primitive boundary |
|---|---|---|
| `BookingListPage` | Query-backed work queue, filter/sort/page, stable links | `Table`, `EmptyState`, `Skeleton`, `IconButton` |
| `BookingCreateForm` | Live reference selections and one contract-valid booking | `Field`, `Combobox`, `Input`, `Button` |
| `BookingDetailPage` | Composite booking/quote/journey read and lifecycle commands | `Tabs`, `StatusStrip`, `StatusBadge` |
| `QuoteRail` | One valid next action and immutable itemized quote | `Button`, `Dialog` |
| `JourneyStatus` | One-second focused polling for 30 seconds, Retry, polite success | status/live-region semantics |
| BFF route handlers | Backend request mapping, identity/correlation propagation, error normalization | server-only fetch client |

The UI follows the approved Refined Mockups: no global W2-01 shell, no nested cards, no fallback demo records, and no transport internals outside collapsed Audit detail.

## Persistence Ownership

| Database | W1-owned structures | Invariant |
|---|---|---|
| Booking PostgreSQL | contract-shaped booking snapshot, `booking_consumed_events`, `booking_movement_status`, existing outbox/audit/idempotency | Event receipt and projection commit together; outbox and confirmation commit together |
| Charge PostgreSQL | `pricing_requests` plus existing agreements, terms, manual cases | One immutable result per idempotency key/request hash and booking/amendment |
| CMM PostgreSQL | journey snapshot, `container_movement_consumed_events`, existing outbox/audit/idempotency | One applied highest revision per booking/container; journey/status outbox atomic |

No component writes another service's tables. Booking, CMM, and Charge adopt Flyway with a V1 baseline copied from each current schema and ordered W1 V2 migrations. Existing non-empty databases are baselined at V1, then upgraded; fresh databases run V1 then V2. Construction proves pre-upgrade snapshot, migration history/checksums, data-preserving backfill, restart, and forward-repair/restore procedure. Destructive PostgreSQL reset is forbidden.

## Security and Compliance

- Local profile service identity is explicit and guarded; non-local startup fails when identity configuration is absent.
- Kafka adapters validate expected event type, schema version, and producer source before application dispatch.
- W1's local Compose broker remains plaintext without service-specific ACLs under the approved local-only security deviation. W1 blocks on source/type/schema validation, noop guard, local-profile identity tests, and non-local fail-closed startup; broker TLS/SASL/ACL evidence and full RS256 identity remain later platform/W2-01 work.
- Events contain booking/equipment/reference identifiers only and no customer attributes; Audit exposes correlation/event identity only on demand.

## Upstream Trace

This design consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. The six binding choices are recorded in `application-design-questions.md`.

## Source Register

| Name used above | W1-01 path |
|---|---|
| `requirements.md` | `aidlc/spaces/default/intents/260714-booking-quote-cash/inception/requirements-analysis/requirements.md` |
| `stories.md` | `aidlc/spaces/default/intents/260714-booking-quote-cash/inception/user-stories/stories.md` |
| `architecture.md` | `aidlc/spaces/default/codekb/TST_Codex_W1-01/architecture.md` |
| `component-inventory.md` | `aidlc/spaces/default/codekb/TST_Codex_W1-01/component-inventory.md` |
| `team-practices.md` | `aidlc/spaces/default/intents/260714-booking-quote-cash/inception/practices-discovery/team-practices.md` |

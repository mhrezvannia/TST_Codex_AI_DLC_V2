# Code Structure

## Repository Layout

| Area | Contents and purpose |
|---|---|
| `apps/auth` | Next.js identity boundary and sign-in/session/access-request pages. |
| `apps/booking` | Booking-local UI, App Router BFF routes, list/detail/create/lifecycle actions. |
| `apps/charge-agreements` | Charge agreement and pricing operations UI. |
| `apps/reference-data` | Reference-data stewardship UI. |
| `apps/shell` | Shared LinerCore shell plus a second Booking implementation under `/booking`. |
| `tools/u06` | Repository tooling application. |
| `packages/api-core` | Shared API/BFF behavior. |
| `packages/auth` | Shared authentication/session behavior. |
| `packages/config` | Shared frontend configuration. |
| `packages/shared-types` | Cross-frontend TypeScript types; current Booking type is incomplete for W3-04. |
| `packages/transformers` | Shared data transformation helpers. |
| `packages/ui` | Shared LinerCore UI components and tokens. |
| `packages/utils` | General shared utilities. |
| `services/*` | Java/Maven service modules. |
| `contracts/openapi`, `contracts/asyncapi`, `contracts/avro` | Checked-in HTTP and event contracts. |
| `infrastructure`, `compose.yaml` | On-premise Compose, Nginx, observability, and service configuration. |
| `scripts`, `tests/e2e`, `tests/w2-02` | Verification, acceptance, evidence, and operational scripts. |

## Java Service Organization

The Maven service set is `platform-messaging`, `identity-service`, `reference-data-service`, `charge-agreement-service`, `booking-service`, and `container-movement-service`. Booking and CMM use the module direction `domain-core <- application-service <- dataaccess/messaging`, with `container` composing Spring configuration and HTTP APIs. Reference Data and Charge Agreement also expose `published-language` modules.

Material W3-04 files include:

- `services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/model/Booking.java`
- `services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/model/EquipmentAssignment.java`
- `services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/command/CreateBookingCommand.java`
- `services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/pricing/PricingInput.java`
- `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java`
- `services/booking-service/dataaccess/src/main/java/com/linercore/platform/booking/dataaccess/jdbc/BookingSnapshotCodec.java`
- `services/reference-data-service/domain-core/src/main/java/com/linercore/platform/referencedata/domain/model/Voyage.java`
- `services/container-movement-service/application-service/src/main/java/com/linercore/platform/containermovement/applicationservice/event/BookingConfirmedEvent.java`
- `services/container-movement-service/messaging/src/main/java/com/linercore/platform/containermovement/messaging/KafkaBookingConfirmedListener.java`
- `services/container-movement-service/container/src/main/java/com/linercore/platform/containermovement/container/api/ContainerMovementApiController.java`

## Frontend Organization

The frontend uses Yarn workspaces and Turbo. Next.js App Router colocates pages and server routes. `apps/booking/lib/bookings.ts` centralizes Booking BFF concerns: session actor, same-origin JSON, 32 KiB body limit, correlation, service credentials, a 2.5-second command timeout, and pricing authorization.

The key structural duplication is:

- `apps/booking/app/bookings/new/BookingCreateForm.tsx` served in the `/bookings` family.
- `apps/shell/app/booking/new/BookingCreateForm.tsx` served in the `/booking` family.

Both require a physical equipment ID and omit W3 commercial fields; only the shell form sends requested departure. `apps/shell/app/api/booking` adds a second BFF hop over the Booking-local App Router API.

## Persistence and Contract Structure

Booking persistence contains records, idempotency, audit, outbox, snapshot migration, consumed-event, movement, and immutable pricing-snapshot structures. Flyway V1-V4 form the current ledger, leaving an additive V5 seam for W3-04. The snapshot codec combines relational projections with versioned JSON and legacy canonicalization.

The Booking confirmation schema is copied into `contracts/avro/` and Booking/CMM resources. The copies are byte-identical with SHA-256 `F718793FFCB3E64E67681DF2DCF92211B1354D39DB20C9DBC6F82932F7A9F5BF`; `equipmentId` is nullable with default `null`.

## Recurring Code Patterns

- Domain aggregates/value objects enforce business invariants at construction.
- Application services coordinate commands and ports.
- HTTP/JDBC/Kafka classes implement adapters around the application core.
- Transactional outbox and consumed-event tables provide asynchronous reliability and idempotency.
- Canonical JSON plus SHA-256 provides pricing request identity.
- TypeScript BFF helpers enforce edge security and propagation conventions.
- Configuration and contracts are checked in beside implementation.

## Structural Risks

The current separation is generally coherent, but W3-04 cuts across domain, API, UI, persistence, reference-data, pricing, and event boundaries. Untyped booking attributes conceal schema ownership. Duplicate forms/routes invite behavioral drift. The Booking OpenAPI surface is incomplete (`contracts/openapi/booking-pricing.v1.yaml` only covers pricing), and the runtime topic name differs from the enterprise event name. Legacy codec rules hardcode the same quantity-one/physical-ID assumptions that W3-04 must remove.

This assessment describes checked-in structure only; it does not assert successful builds, tests, migrations, or runtime composition.

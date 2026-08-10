# Code Structure

## Repository Organization

| Path | Classification | Purpose |
|---|---|---|
| `services/` | Java Maven reactor | Business and platform backend services plus shared messaging library |
| `apps/` | Next.js applications | Auth, Booking, Charge Agreements, Reference Data, and the shared shell |
| `packages/` | TypeScript workspace packages | Shared API, auth, config, types, transforms, UI, and utilities |
| `contracts/` | Executable integration contracts | Avro, AsyncAPI, OpenAPI, Pact fixtures, and catalog metadata |
| `infrastructure/` | Runtime configuration | Keycloak, observability, seeds, runtime profiles, and container configuration |
| `scripts/` | Delivery and acceptance tooling | Compose orchestration, quality gates, seeding, demo protection, and evidence scripts |
| `design-system/linercore/` | Binding design documentation | Shared operational-console contract and page-specific records |
| `aidlc/` | AI-DLC durable state and knowledge | Intent records, rules, knowledge, and this per-repository codekb |
| `artifacts/` | Retained acceptance evidence | Immutable/chronological live-run, audit, and UI evidence |

## Backend Module Pattern

The Maven reactor includes `platform-messaging`, `identity-service`, `reference-data-service`, `charge-agreement-service`, `booking-service`, and `container-movement-service`. Business services normally use this five-part structure:

```text
<service>/
|-- domain-core/          framework-free model, rules, domain/outbox facts
|-- application-service/ transactions, commands/queries, ports
|-- dataaccess/           JDBC and in-memory adapters, migrations/schema
|-- messaging/            Avro mappers and Kafka adapters
`-- container/            Spring Boot wiring, REST, configuration, schedulers
```

This folder pattern supports inward dependencies: infrastructure adapters depend on application/domain contracts, while domain-core remains free of Spring, persistence, messaging, and frontend dependencies.

## Container Movement Service

| Area | Key source | Current responsibility |
|---|---|---|
| Aggregate | `services/container-movement-service/domain-core/src/main/java/com/linercore/platform/containermovement/domain/model/ContainerJourney.java` | Journey identity/revision/container, expected movements, history, generic lifecycle, duplicate/time validation |
| Movement model | same `domain/model` package | `MovementEvent`, `MovementEventType`, `MovementStatus`, `ExpectedMovement`, `MovementValidationResult` |
| Status outbox model | `domain-core/.../domain/outbox/` | Status event snapshot and relay lifecycle |
| Application orchestration | `application-service/.../ContainerMovementApplicationService.java` | Journey create/reconcile, confirmation consume, capture, reads, relay batch, audit/auth/reference validation |
| Ports | `application-service/.../port/` | Journey, idempotency, outbox, audit, reference, authorization, publisher, schema registry |
| JDBC adapters | `dataaccess/.../jdbc/` | Journey snapshots, idempotency, audit, and outbox |
| Database definition | `dataaccess/src/main/resources/db/container-movement-schema.sql` | Mutable schema initialization; no ordered Flyway chain |
| Booking consumer | `messaging/.../KafkaBookingConfirmedListener.java` and `BookingConfirmedRecordMapper.java` | Registered Avro mapping into application event |
| Status producer | `messaging/.../KafkaContainerMovementEventPublisher.java` | Avro serialization and broker publication |
| REST API | `container/.../api/ContainerMovementApiController.java` | Journey list/create/detail/booking lookup and movement capture |
| Spring wiring | `container/.../ContainerMovementServiceConfiguration.java`, `ContainerMovementMessagingConfiguration.java` | Repository/adapters, publisher/registrar, listener, scheduler profiles |

The current aggregate and command types are the main W2-04 change seam. They are compact enough to evolve, but adding more branches directly to the already central application service would worsen concentration. DCSA value objects, transition validation, and event mapping should remain domain/application collaborators rather than controller conditionals.

## Booking Return Path

| Area | Key source | Responsibility |
|---|---|---|
| Consumer | `services/booking-service/messaging/src/main/java/com/linercore/platform/booking/messaging/KafkaContainerMovementStatusListener.java` | Receives registered status records |
| Mapper | `.../ContainerMovementStatusRecordMapper.java` | Maps envelope and data fields into a typed application event |
| Transaction | `services/booking-service/application-service/.../BookingApplicationService.java` | Authorizes, checks container assignment, records receipt, applies or rejects projection |
| Projection adapter | `services/booking-service/dataaccess/.../JdbcMovementStatusProjectionRepository.java` | Durable dedupe and guarded latest-status upsert |
| Migration | `services/booking-service/dataaccess/src/main/resources/db/migration/V2__booking_movement_status_projection.sql` | Receipt and latest projection tables |
| API composition | `services/booking-service/container/.../BookingApiController.java` | Returns movement statuses in Booking detail |
| UI | `apps/booking/app/bookings/[bookingId]/JourneyStatusPanel.tsx` | Polls Booking detail and renders pending/latest/delayed states |

Booking's existing projection is latest-only. It is appropriate for a summary but cannot be treated as a complete timeline unless W2-04 adds history storage or exposes the authoritative history from CMM through an owned read route.

## Frontend Structure

Existing apps are `auth`, `booking`, `charge-agreements`, `reference-data`, and `shell`. There is no `apps/container-movement` directory at this baseline, no mounted shell route, no Nginx route, and no Compose app service. `infrastructure/runtime/profiles.json` already names `apps-container-movement`, which is configuration drift rather than a deployed capability.

W2-04 should add only the CMM-owned app/pages and the minimum mount/edge/Compose seams needed for the canonical `/container-movement` route. It consumes `packages/ui`; W2-02 owns that package and the global shell. Page-specific additions belong only in `design-system/linercore/pages/container-movement.md`.

## Test and Evidence Structure

- Java tests follow each Maven module under `src/test/java` and use JUnit 5.
- Frontend component tests use Vitest next to or beneath the relevant app sources.
- Playwright is available for browser evidence, but CI does not currently execute it.
- Contract fixtures live under `contracts/pact`, while Avro schemas live under `contracts/avro` and service resources.
- Live proof is retained under `artifacts/`; W2-04 must create a new evidence set rather than edit W1 records.

## Hotspots and Change Guidance

Observed concentration includes `BookingApplicationService` (about 569 lines), Booking controller (about 544), Booking aggregate (about 325), `HttpReferenceValidationAdapter` (about 381), and `packages/ui/src/index.tsx` (about 475). W2-04 should avoid expanding these into new cross-domain orchestrators. Prefer:

- domain-owned DCSA codes and lifecycle transition policy;
- a focused movement-capture application boundary with explicit result/rejection types;
- additive repositories/read models for ordered movement history;
- thin REST/Kafka adapters;
- module-owned frontend compositions built from existing shared primitives.

## Generated and Persistent Analysis

`graphify-out/` and `.codebase-memory/` are machine-generated discovery indexes, not product source. Graphify did not encode the full cross-service path at this snapshot; codebase-memory provided more current exact symbol relationships. These indexes may be refreshed after major changes, but their absence or stale edges must not override verified contracts and source.

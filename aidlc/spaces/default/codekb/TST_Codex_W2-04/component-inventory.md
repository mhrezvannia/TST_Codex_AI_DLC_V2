# Component Inventory

## Backend Services

| Component | Responsibility | Dependencies | Health for W2-04 |
|---|---|---|---|
| `services/platform-messaging` | Shared Avro schema loading/registration, generic Kafka publishing, and outbox-supporting adapters. | Kafka, Schema Registry, Avro. | Healthy foundation; required rather than duplicated. |
| `services/identity-service` | Authentication/authorization decisions and audit support. | Keycloak/local profiles, PostgreSQL where configured. | Adopted; local defaults need non-local fail-closed review. |
| `services/reference-data-service` | Canonical locations, voyages, equipment types, and other reference sets. | PostgreSQL, shared messaging. | Required for route/movement location validation. |
| `services/charge-agreement-service` | Pricing and agreement bounded context. | Reference Data, PostgreSQL. | Outside W2-04 changes. |
| `services/booking-service` | Booking lifecycle, confirmation outbox, movement-status receipt/projection, Booking detail. | Identity, Reference Data, Charge, Kafka/SR, Booking DB. | Functional W1 seam; latest-only projection and no sequence are W2-04 gaps. |
| `services/container-movement-service` | Journey intake, movement capture, lifecycle, status outbox, CMM reads. | Identity, Reference Data, Kafka/SR, CMM DB. | At risk: generic model, mutable schema, outbox vocabulary drift, no DCSA sequence/lifecycle. |

## CMM Internal Components

| Component | Layer | Responsibility | Assessment |
|---|---|---|---|
| `ContainerJourney` | Domain | Journey aggregate, expected movement plan, actual history, lifecycle derivation, duplicate/time checks. | Degraded for W2-04 semantics; useful aggregate boundary. |
| `MovementEvent` and related enums | Domain | Generic movement identity/type/location/time/dedupe. | Must evolve to typed DCSA code/classifier/sequence/empty indicator. |
| `MovementStatusEventMapper` | Domain/outbox mapping | Converts journey state to status event snapshot. | Lossy mappings and hardcoded LADEN; must publish actual accepted facts. |
| `ContainerMovementApplicationService` | Application | Transaction boundary for confirmation intake, direct journey creation, capture, reads, audit, and relay. | Functional but concentrated; rejection evidence and semantic sequencing absent. |
| `JourneyRepository` | Application port/data access | Read/write current journey snapshots. | Functional; needs additive fields/history support. |
| `IdempotencyRepository` | Application port/data access | Confirmation and movement key lookup. | Durable but one namespace lacks request-hash/conflict semantics. |
| `OutboxRepository` | Application port/data access | Enqueue, claim, save, and query publication status. | High risk due Java/repository/schema status vocabulary mismatch. |
| `AuditRepository` | Application port/data access | Append domain/security evidence. | Positive seam; capture rejections need explicit facts. |
| `HttpReferenceValidationAdapter` | Adapter | Validates route and movement location IDs. | Functional but large; avoid adding domain transition logic. |
| `BookingConfirmedRecordMapper` | Messaging adapter | Maps canonical nested Avro confirmation record. | Healthy contract boundary. |
| `KafkaBookingConfirmedListener` | Messaging adapter | Receives confirmation and invokes application transaction. | Healthy thin listener. |
| `KafkaContainerMovementEventPublisher` | Messaging adapter | Registers/serializes/publishes CMM status records. | Functional; schema/mapping must evolve compatibly. |
| `ContainerMovementApiController` | REST adapter | List/create/detail/booking lookup/capture and error mapping. | Missing DCSA capture shape, controller integration coverage, and correlation fidelity. |
| `ContainerMovementMessagingConfiguration` | Container/config | Publisher, registrar, relay, and listener beans/profiles. | Adopted W0 plumbing; verify real profile and scheduler in live acceptance. |
| `container-movement-schema.sql` | Persistence definition | Journey/idempotency/audit/outbox schema. | Degraded: mutable initialization and outbox status mismatch; migrate to ordered additive chain. |

## Booking Components in the Return Path

| Component | Responsibility | Assessment |
|---|---|---|
| `KafkaContainerMovementStatusListener` | Receive status record and call Booking application service. | Healthy thin adapter. |
| `ContainerMovementStatusRecordMapper` | Typed mapping of Avro envelope/data/location. | Healthy baseline; add sequence with contract. |
| `BookingApplicationService.consumeMovementStatus` | Auth, booking/container invariant, receipt dedupe, projection disposition, audit. | Strong transaction boundary; avoid expanding unrelated Booking logic. |
| `JdbcMovementStatusProjectionRepository` | Receipt plus guarded latest-status projection. | Durable/ordered but latest-only and sequence-free. |
| `V2__booking_movement_status_projection.sql` | Booking receipt/projection tables. | Ordered Flyway precedent for CMM migration. |
| `BookingApiController` movement response | Exposes locally persisted movement state in detail. | Existing cross-link/read seam; already large. |
| `JourneyStatusPanel` | Pending/delayed/retry/latest status UI. | Useful baseline but not a timeline and lacks rejection/expected moves. |

## Frontend Applications

| Application | Purpose | W2-04 relevance |
|---|---|---|
| `apps/shell` | Canonical authenticated shell, navigation, breadcrumbs, routed module mounts. | Must mount CMM without redesign. |
| `apps/auth` | Authentication/session UI. | Consume existing session; no new identity mechanism. |
| `apps/booking` | Booking list/detail/action UI. | Consume status progression and cross-link to CMM. |
| `apps/charge-agreements` | Charge domain UI. | Out of W2-04 scope. |
| `apps/reference-data` | Canonical reference-data UI. | Out of W2-04 scope. |
| `apps/container-movement` | Expected CMM module UI. | Absent at baseline; W2-04 must create the owned application/pages. |

## Shared TypeScript Packages

| Package | Purpose | Ownership note |
|---|---|---|
| `packages/api-core` | Common API client/transport behavior. | Reuse if current shell pattern requires it. |
| `packages/auth` | Session and authentication helpers. | Reuse existing subject propagation. |
| `packages/config` | Shared workspace/application configuration. | Extend only for the CMM mount as necessary. |
| `packages/shared-types` | Cross-app TypeScript types. | Do not use as a backdoor shared domain model. |
| `packages/transformers` | Client-side data transformations. | Keep CMM domain composition in its app. |
| `packages/ui` | Shared tokens and primitives. | W2-02-owned; W2-04 consumes and reports missing primitives. |
| `packages/utils` | Shared general utilities. | Reuse only for non-domain helpers. |

## Runtime and Delivery Components

| Component | Responsibility | Assessment |
|---|---|---|
| `compose.yaml` | Local/on-prem full stack. | Contains CMM backend but no CMM frontend service. |
| `infrastructure/runtime/profiles.json` | Runtime-profile inventory. | Claims `apps-container-movement`; currently drifts from source/Compose. |
| Nginx configuration | Shared edge and manager demo at `127.0.0.1:8088`. | Needs minimum CMM route while protecting existing demo. |
| `scripts/wave-a-compose.mjs` | Isolated Wave A Compose orchestration. | Mandatory; fixes project `linercore-wave-a`. |
| `npm run demo:guard` | Verifies the continuously available manager demo is not targeted. | Mandatory before and after isolated acceptance. |
| Kafka | Asynchronous cross-module transport. | Real broker evidence required. |
| Schema Registry | Avro compatibility/serialization authority. | Real validation evidence required. |
| PostgreSQL 15 | Service-owned durable data. | CMM migration/restart/existing-data proof required. |

## Tests and Evidence Components

Current coverage includes CMM domain/application/event mapper/Avro mapper tests, Booking domain/application/API/Flyway/messaging tests, and `JourneyStatusPanel` component tests. Missing components include a CMM controller integration suite, PostgreSQL-backed CMM repository/migration tests, DCSA transition/sequence matrix tests, observable rejection tests, live broker-to-Booking proof, and Playwright coverage for the CMM pages.

Retained W1 evidence consists of separate chronological records: blocked image-pull evidence, a test-project waiver, and a later real-stack PASS. These are evidence components, not source fixtures, and must remain unmodified.

## Boundary Summary

Healthy seams already exist at the service databases, application transactions, Kafka listeners, outboxes, and Booking projection. The main W2-04 risk is semantic/persistence fidelity inside CMM plus the absent CMM UI delivery surface. No component in this inventory authorizes EDI, public DCSA APIs, multi-leg routing, fleet/depot, or M&R expansion.

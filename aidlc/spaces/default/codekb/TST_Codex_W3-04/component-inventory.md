# Component Inventory

## User-Facing Applications

| Component | Responsibility | Principal dependencies |
|---|---|---|
| `apps/auth` | Authentication boundary, callback, session, sign-in/out, access request | `packages/auth`, identity/Keycloak, shared UI |
| `apps/booking` | Booking list/detail/create and lifecycle operations | Booking BFF/service, reference options, `packages/shared-types`, `packages/ui` |
| `apps/charge-agreements` | Charge-agreement and pricing operations | Charge Agreement service, shared shell/UI |
| `apps/reference-data` | Reference-set stewardship | Reference Data service, shared shell/UI |
| `apps/shell` | LinerCore shared shell and a second Booking area | Domain apps/BFFs, shared auth/UI |
| `tools/u06` | Repository tooling application | Workspace packages and scripts |

## Shared TypeScript Packages

| Component | Responsibility |
|---|---|
| `packages/api-core` | Common server/API behavior for frontend applications. |
| `packages/auth` | Session and authorization primitives. |
| `packages/config` | Shared build/runtime configuration. |
| `packages/shared-types` | Cross-app data types; Booking type currently contains customer, POL/POD, voyage, optional requested departure, equipment type, required physical equipment ID, and commodity. |
| `packages/transformers` | Shared DTO/view transformations. |
| `packages/ui` | LinerCore design-system components and tokens. |
| `packages/utils` | Shared general-purpose utilities. |

## Backend Services

| Component | Responsibility | W3-04 relationship |
|---|---|---|
| `services/platform-messaging` | Shared Kafka/Avro/outbox messaging support | Used by Booking messaging and other service adapters. |
| `services/identity-service` | Identity and access integration | Supplies operational access boundary, not booking business fields. |
| `services/reference-data-service` | Governed reference sets, validation, history, event publication | Must add/expose party roles, commodity, and complete voyage schedule data. |
| `services/charge-agreement-service` | Price request processing, manual-pricing cases, response enrichment | Must receive exact commercial input without placeholder defaults. |
| `services/booking-service` | Booking aggregate, lifecycle, validation, pricing, persistence, confirmation publication | Primary W3-04 owner. |
| `services/container-movement-service` | Journey/movement lifecycle and booking-confirmation consumption | Must accept booking confirmation before physical equipment allocation. |

Booking and CMM each contain `domain-core`, `application-service`, `dataaccess`, `messaging`, and `container`. Reference Data and Charge Agreement also contain application and `published-language` modules. Spring `container` modules compose ports/adapters and expose HTTP controllers.

## Booking Components

| Symbol/file | Responsibility | Known issue |
|---|---|---|
| `Booking.java` | Aggregate identity, route/equipment, pricing, exceptions, movement/lifecycle | Missing first-class W3 commercial fields; relies on attributes. |
| `EquipmentAssignment.java` | Booking equipment invariant | Requires quantity one and physical ISO 6346 ID. |
| `CreateBookingCommand.java` | Create application input | Mirrors incomplete request shape. |
| `BookingApiController.java` | Booking lifecycle HTTP API | No complete checked-in OpenAPI. |
| `BookingReferenceOptionController.java` | Booking-specific reference option facade | Narrow set/attribute projection. |
| `PricingInput.java` | Canonical price request and fingerprint | Defaults missing trade lane/commodity. |
| `ChargePricingPortAdapter` | Charge HTTP adapter and response verification | Requires exact enrichment and arithmetic consistency. |
| `BookingSnapshotCodec.java` | Versioned snapshot read/write and legacy canonicalization | Legacy path hardcodes quantity one/physical ID. |
| `BookingEventMapper` | Maps aggregate to confirmation event | Wire contract permits nullable equipment ID. |
| `KafkaBookingEventPublisher` | Publishes claimed booking outbox records | Uses runtime topic `booking.events`. |
| `apps/booking/.../BookingCreateForm.tsx` | Booking-local create form | Requires ID, omits W3 fields and requested departure. |
| `apps/shell/.../BookingCreateForm.tsx` | Shared-shell create form | Requires ID, omits W3 fields, sends requested departure. |

## Reference, Pricing, and CMM Components

| Symbol/file | Responsibility | Known issue |
|---|---|---|
| `Voyage.java` | Typed reference voyage | Has vessel, carrier voyage number, origin/destination, scheduled departure/arrival only. |
| Booking HTTP reference option adapter | Reduces Reference Data records to Booking options | Omits ETD/ETA; no cutoff/deadline/OHS fields exist. |
| `ReferenceDataController.java` | Reference CRUD, validation, history, event claims/publication | Contract exists; Booking's consumed subset is incomplete. |
| Charge pricing application | Price request and manual case orchestration | Contracted through `pricing.v1.yaml`. |
| `KafkaBookingConfirmedListener.java` | CMM Kafka entry point | Receives Booking confirmation. |
| `BookingConfirmedRecordMapper` | Avro-to-application event mapper | Carries nullable equipment ID from schema. |
| `BookingConfirmedEvent.java` | CMM confirmation event model | Rejects null physical ID, quantity other than one, or multiple assignments. |
| `ContainerMovementApplicationService.consumeBookingConfirmed` | Creates/updates journey from confirmation | `journeyContainerId` assumes physical ID. |
| `ContainerMovementApiController.java` | Journey and movement HTTP API | Downstream operational surface. |

## Platform and Contract Components

| Component | Responsibility |
|---|---|
| `contracts/openapi` | Reference Data, pricing, and partial Booking pricing HTTP contracts. |
| `contracts/asyncapi` | Enterprise asynchronous channel definition. |
| `contracts/avro` | Event schemas shared with producers/consumers. |
| `compose.yaml` | Declares 24 on-premise services including PostgreSQL, Keycloak, Kafka/Registry, five Java business services, five apps, Nginx, and observability. |
| Nginx | Edge routing for the shared shell and applications. |
| PostgreSQL 15 | Service persistence. |
| Kafka/Confluent Schema Registry | Asynchronous integration and schema management. |
| Prometheus, Grafana, ELK, Jaeger, OpenTelemetry | Checked-in observability topology. |

## Inventory Confidence

This inventory combines Graphify-first discovery with source cross-checks because the graph was stale/incomplete around current Booking code. It describes checked-in components, not verified runtime health or test outcomes.

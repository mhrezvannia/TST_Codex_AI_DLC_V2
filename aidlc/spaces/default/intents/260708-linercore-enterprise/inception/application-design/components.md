# Components - LinerCore Enterprise

## Source Context

This component design consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. It also uses `refined-mockups/mockups.md` and `interaction-spec.md` as UX-informed context.

Graphify was used before broad architecture decisions. It confirmed existing `IdentityApplicationService`, `ReferenceDataApplicationService`, and `ChargeAgreementApplicationService` nodes, and it did not prove a direct service dependency between Reference Data and Charge Agreement. The design therefore preserves explicit integration seams rather than assuming hidden coupling.

## Component Map

| Component | Type | Status | Owns |
|---|---|---|---|
| Identity Service | Backend service | Brownfield hardening | Users, subjects, roles, capabilities, authorization audit |
| Reference Data Service | Backend service | Brownfield hardening | Reference sets, records, versioning, reference-data events |
| Charge Service | Backend service | Mixed extension of charge-agreement-service | Agreements, tariffs, pricing, D&D rules, D&D calculation |
| Booking Service | Backend service | Greenfield | Booking lifecycle, pricing orchestration, confirmation, amendments, D&D triggers |
| Container Movement Service | Backend service | Greenfield | Journeys, expected movements, movement capture, validation, status publication |
| Enterprise Web App | Frontend app | Mixed/new | Integrated module UI, work queue, workflows, exceptions, operations views |
| Contract Platform | Cross-cutting component | Partial | OpenAPI, Avro, AsyncAPI, Pact, message-pact, compatibility catalog |
| Local Runtime Platform | Infrastructure component | Partial | Compose profiles, databases, Kafka, Schema Registry, Keycloak, reverse proxy, observability |
| Observability Platform | Infrastructure component | Partial | Logs, metrics, traces, dashboards, alerts, flow evidence |
| Seed And Migration Platform | Infrastructure/tooling component | Partial | Per-service migrations and deterministic enterprise seed data |

## Backend Components

### Identity Service

Responsibilities:

- Authenticate service-facing subject context from Keycloak tokens.
- Authorize user and service actions through role/capability checks.
- Record authorization audit events.
- Provide module capability catalog and effective permission lookup.

Public interfaces:

- Internal HTTP authorization API.
- Capability and role administration API.
- Authorization audit query API.

Boundaries:

- Does not own booking, pricing, movement, D&D, or reference records.
- Does not expose direct database access to other services.

### Reference Data Service

Responsibilities:

- Own reference set and record lifecycle.
- Validate reference data and maintain history/versioning.
- Publish reference-data changed events through transactional outbox.
- Provide read APIs for services and UI.

Public interfaces:

- Reference set/record HTTP API.
- Reference history and dependency API.
- Reference data event outbox publisher.

Boundaries:

- Does not own domain business state for agreements, bookings, movements, or D&D outcomes.
- Other services consume reference data by API/event, not by database joins.

### Charge Service

Responsibilities:

- Extend current `charge-agreement-service` into full Charge Calculation and Customer Agreement capability.
- Own customer agreements, tariffs, charge terms, validity, applicability, commodity eligibility, pricing basis, pricingRef, and auditability.
- Own D&D rules, free time, rates, chargeable-day calculation, and D&D calculation.
- Provide synchronous pricing and D&D calculation APIs for Booking.

Public interfaces:

- Agreement/tariff administration OpenAPI.
- Pricing OpenAPI: `pricing.request` -> `pricing.result`.
- D&D pricing OpenAPI: `pricing.dnd-request` -> `pricing.dnd-result`.
- Commercial audit and manual pricing API.

Boundaries:

- Does not mutate booking lifecycle.
- Does not own journey or movement status.
- Does not query Booking or CMM databases.

### Booking Service

Responsibilities:

- Own booking creation, draft state, validation, pricing orchestration, confirmation, amendment, reconfirmation, bookingRevision, lifecycle status, exception queues, and audit trail.
- Send pricing and D&D requests to Charge.
- Publish `booking.confirmed`.
- Consume `containermovement.status`.
- Decide whether movement status is D&D relevant and trigger D&D calculation.

Public interfaces:

- Booking command/query OpenAPI.
- Booking amendment OpenAPI.
- Booking exception OpenAPI.
- `booking.confirmed` Avro/AsyncAPI producer.
- `containermovement.status` consumer.

Boundaries:

- Does not calculate pricing, D&D rates, free time, or chargeable days.
- Does not derive CMM movement status.
- Does not query Charge or CMM databases.

### Container Movement Service

Responsibilities:

- Consume `booking.confirmed`.
- Create and reconcile journeys by bookingRevision.
- Derive expected movements.
- Capture planned, estimated, and actual movement events.
- Validate DCSA v2.2-aligned movement data.
- Handle duplicates, late events, out-of-order events, empty/laden state, and operational history.
- Publish `containermovement.status`.

Public interfaces:

- Journey command/query OpenAPI.
- Movement capture OpenAPI.
- Movement history/status OpenAPI.
- `booking.confirmed` consumer.
- `containermovement.status` Avro/AsyncAPI producer.

Boundaries:

- Does not decide whether movement is D&D relevant.
- Does not own booking commercial lifecycle.
- Does not calculate pricing or D&D.

## Frontend Components

### Enterprise Web App

Responsibilities:

- Provide one integrated operating shell with module routes for work queue, pricing/agreements, booking, movement, D&D outcomes, platform administration, and operations.
- Enforce route/action permissions from Identity Service.
- Use real APIs/events and never prototype business logic from Claude UI.
- Preserve the refined mockup visual baseline where compatible.

Public interfaces:

- Browser routes behind reverse proxy.
- BFF or route-handler API calls to backend services where Application Design permits.

Boundaries:

- Does not own business rules.
- Does not bypass service APIs.
- Does not treat mocked prototype state as real implementation.

### Shared UI And Frontend Packages

Responsibilities:

- Provide shell, navigation, data table, status chip, stepper, evidence rail, timeline, drawer, audit, and health components.
- Reuse `@erp/ui`, `@erp/auth`, `@erp/api-core`, `@erp/config`, `@erp/shared-types`, `@erp/transformers`, and `@erp/utils` patterns.

Boundaries:

- Shared packages remain technical primitives, not domain owners.

## Cross-Cutting Components

### Contract Platform

Responsibilities:

- Track and verify OpenAPI, Avro, AsyncAPI, HTTP Pact, message-pact, and Schema Registry compatibility.
- Convert enterprise contract documents into executable artifacts.
- Block integration readiness claims until executable contracts pass.

### Local Runtime Platform

Responsibilities:

- Provide local Docker Compose profiles: `core`, `app`, `observability`, `devtools`, and `full`.
- Host PostgreSQL, Kafka, Schema Registry, Keycloak, services, frontends, reverse proxy, contract-test support, and observability.
- Support independent IDE development modes.

### Observability Platform

Responsibilities:

- Provide logs, metrics, traces, dashboards, alerts, SLO evidence, correlationId propagation, and flow evidence.

### Seed And Migration Platform

Responsibilities:

- Run per-service migrations.
- Seed deterministic users, roles, reference data, agreements, tariffs, charges, D&D rules, bookings, journeys, and movements.

## Ownership Matrix

| Business object | Owner | Consumers |
|---|---|---|
| User, role, capability | Identity Service | All services, Enterprise Web App |
| Reference record | Reference Data Service | Charge, Booking, CMM, Enterprise Web App |
| Agreement, tariff, charge term | Charge Service | Booking, Enterprise Web App |
| Pricing result | Charge calculates, Booking stores for booking | Enterprise Web App |
| D&D rule/rate/free time | Charge Service | Booking, Enterprise Web App |
| Booking | Booking Service | CMM, Enterprise Web App |
| Booking revision | Booking Service | CMM, Enterprise Web App |
| Journey/movement/status | Container Movement Service | Booking, Enterprise Web App |
| D&D trigger | Booking Service | Charge Service |
| Runtime health | Local Runtime and Observability Platforms | Enterprise Web App |

## Traceability

| Source | Design coverage |
|---|---|
| `requirements.md` | FR/NFR groups mapped to service, UI, runtime, contract, and observability components |
| `stories.md` | US-SP, US-CHG, US-BKG, US-CMM, US-UI, and US-RUN mapped to component ownership |
| `architecture.md` | Reuses brownfield modular service pattern and identifies missing Booking/CMM services |
| `component-inventory.md` | Reuses existing services/packages and marks missing enterprise components |
| `team-practices.md` | Preserves enterprise walking skeleton and explicit module boundaries |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` could not start under the current Codex account/model configuration.

Findings:

- The design preserves the required enterprise scope and does not reduce the target to Shared Platform.
- Module boundaries are explicit: Shared Platform services, Charge, Booking, CMM, Enterprise Web, contracts, runtime, observability, and seed/migration concerns have separate ownership.
- Charge owns agreements, tariffs, pricing, and D&D calculation; Booking owns booking lifecycle, orchestration, D&D trigger, and persisted booking charge outcomes; CMM owns movements and status reporting.
- Integration choices match the approved enterprise contracts: synchronous Booking-to-Charge pricing/D&D interactions and asynchronous Booking-to-CMM/CMM-to-Booking event flows.
- Database ownership rules are represented through separate logical databases/users and a no-cross-service-SQL dependency policy.
- The walking skeleton path is implementable and aligns with the approved practice that the first Construction Bolt must prove integrated enterprise flow evidence.

Residual risks to carry forward:

- Units Generation must split this architecture into deliverable units without hiding the hard integration work in late bolts.
- Functional Design must define exact OpenAPI, AsyncAPI, Avro, Pact, schema-registry, database, authorization, and state-machine details before code generation claims readiness.

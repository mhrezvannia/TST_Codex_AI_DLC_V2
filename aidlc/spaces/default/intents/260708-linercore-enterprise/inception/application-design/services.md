# Services - LinerCore Enterprise

## Source Context

This service design consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. It preserves the existing Java/Spring service-module pattern while adding missing enterprise services and runtime wiring.

## Service Topology

```text
[Enterprise Web App]
        |
        v
[nginx reverse proxy]
        |
        +--> [Identity Service] <--> [Keycloak]
        +--> [Reference Data Service] --> [Kafka/Schema Registry]
        +--> [Charge Service]
        +--> [Booking Service] <--> [Charge Service]
        +--> [Container Movement Service]

[Booking Service] --booking.confirmed--> [Kafka] --> [Container Movement Service]
[Container Movement Service] --containermovement.status--> [Kafka] --> [Booking Service]
[Booking Service] --pricing.request/pricing.dnd-request--> [Charge Service]
[Charge Service] --pricing.result/pricing.dnd-result--> [Booking Service]
```

Text fallback: the web app calls backend services through the reverse proxy. Booking synchronously calls Charge for pricing and D&D request/response operations. Booking and CMM exchange lifecycle/status events asynchronously through Kafka and Schema Registry. Shared Platform services provide identity, authorization, reference data, contracts, and event foundations.

## Backend Services

### identity-service

Runtime: existing Spring Boot service, enterprise hardening required.

Responsibilities:

- Identity, roles, capabilities, effective permissions, authorization audit.
- Keycloak integration and service-to-service authorization validation.

Storage:

- `identity` logical database and user.

Contracts:

- Internal identity OpenAPI.
- Authorization audit/read models.

### reference-data-service

Runtime: existing Spring Boot service, enterprise hardening required.

Responsibilities:

- Reference set/record lifecycle, history, validation, outbox, reference-data events.
- Schema Registry and Kafka hardening.

Storage:

- `reference_data` logical database and user.

Contracts:

- Reference Data OpenAPI.
- Reference-data changed Avro/AsyncAPI.

### charge-service

Runtime: evolve existing `charge-agreement-service` into the Charge Calculation and Customer Agreement service. The code module name may remain initially, but the service responsibility expands and should be renamed or aliased only through an approved migration.

Responsibilities:

- Agreements, tariffs, charge terms, active lookup, pricing, manual pricing, D&D rules, D&D calculation.

Storage:

- `pricing` logical database and user.

Contracts:

- Agreement/tariff OpenAPI.
- Pricing OpenAPI and HTTP Pact: `pricing.request` -> `pricing.result`.
- D&D pricing OpenAPI and HTTP Pact: `pricing.dnd-request` -> `pricing.dnd-result`.
- Optional commercial events only after contract design approves them.

Scaling:

- Stateless service containers, database-backed idempotency and audit.

### booking-service

Runtime: new Spring Boot service.

Responsibilities:

- Booking lifecycle, pricing orchestration, operational validation, confirmation, amendments, lifecycle status, D&D trigger, exceptions, audit.

Storage:

- `booking` logical database and user.

Contracts:

- Booking OpenAPI.
- `booking.confirmed` Avro/AsyncAPI producer.
- `containermovement.status` consumer.
- HTTP Pact consumer for Charge pricing/D&D APIs.

Scaling:

- Stateless command/query API with database-backed idempotency, outbox, and consumer offset/deduplication.

### container-movement-service

Runtime: new Spring Boot service.

Responsibilities:

- CMM journey creation, expected movement derivation, movement capture, DCSA v2.2-aligned validation, status derivation, ordering/deduplication, status publication.

Storage:

- `container_movement` logical database and user.

Contracts:

- Journey/movement OpenAPI.
- `booking.confirmed` consumer.
- `containermovement.status` Avro/AsyncAPI producer.

Scaling:

- Stateless API/event consumer with database-backed journey and movement state.

## Frontend Services

### enterprise-web

Runtime: new integrated Next.js app, with reuse from `apps/auth`, `apps/reference-data`, `apps/charge-agreements`, and shared packages.

Responsibilities:

- Authenticated enterprise shell.
- Routes for pricing/agreements, booking, CMM, D&D, platform admin, operations.
- BFF route handlers where needed to aggregate service responses for UI only.

Contracts:

- Calls service OpenAPI clients generated or typed from contracts.
- Does not own business rules.

### existing apps

`apps/auth`, `apps/reference-data`, and `apps/charge-agreements` remain reusable foundations. Delivery Planning can choose whether they are migrated into `enterprise-web`, kept as independent apps behind nginx, or retained as module dev apps.

## Infrastructure Services

| Service | Purpose | Profile |
|---|---|---|
| PostgreSQL | Local logical databases/users for identity, reference data, pricing, booking, CMM, Keycloak, tools | core/full |
| Keycloak | Local identity provider | core/full |
| Kafka | Async event broker | core/full |
| Schema Registry | Avro/compatibility registry | core/full |
| nginx | Reverse proxy | app/full |
| Prometheus | Metrics | observability/full |
| Grafana | Dashboards | observability/full |
| Jaeger | Tracing | observability/full |
| OpenTelemetry Collector | Telemetry pipeline | observability/full |
| Elasticsearch/Kibana | Logs/search foundation | observability/full |

## Orchestration Patterns

### Flow 1

Pattern: Booking orchestration with synchronous Charge pricing.

- Booking validates draft.
- Booking calls Charge pricing API.
- Booking stores returned pricing snapshot.
- Booking confirms and writes outbox event.

### Flow 2

Pattern: Event choreography.

- Booking publishes `booking.confirmed`.
- CMM consumes and creates/reconciles journey.

### Flow 3

Pattern: CMM ownership plus event notification.

- CMM captures and validates movement.
- CMM derives status.
- CMM publishes `containermovement.status`.
- Booking consumes and updates lifecycle.

### Flow 4

Pattern: Booking-triggered Charge calculation.

- Booking consumes movement status.
- Booking detects D&D boundary.
- Booking calls Charge D&D API.
- Charge calculates and returns result.
- Booking stores D&D charge.

### Flow 5

Pattern: Booking amendment orchestration plus CMM reconciliation event path.

- Booking updates/reconfirms bookingRevision.
- Booking republishes revised confirmation or revision event as contract design finalizes.
- CMM reconciles expected movements.

## Contract Strategy

| Integration | Style | Required artifacts |
|---|---|---|
| Enterprise Web -> services | HTTP | OpenAPI, typed clients, UI integration tests |
| Booking -> Charge pricing | HTTP sync | OpenAPI, HTTP Pact, idempotency tests |
| Booking -> Charge D&D | HTTP sync | OpenAPI, HTTP Pact, idempotency/resilience tests |
| Booking -> CMM `booking.confirmed` | Kafka async | AsyncAPI, Avro, Schema Registry, message-pact |
| CMM -> Booking `containermovement.status` | Kafka async | AsyncAPI, Avro, Schema Registry, message-pact |
| Reference Data changed | Kafka async | Existing Avro/AsyncAPI hardened |

## Lifecycle And Scaling

- Services are independently deployable Spring Boot containers.
- Each service owns its logical database and migrations.
- Consumers use deduplication and idempotency keys.
- HTTP clients use timeout, retry, and circuit-breaker policies.
- Outbox publishers are horizontally safe through claim/lease semantics.
- UI scaling is stateless; session/token state remains with auth provider.

## Traceability

| Source | Service design coverage |
|---|---|
| `requirements.md` | Services map to all module and NFR requirements |
| `stories.md` | Services support walking skeleton and all story groups |
| `architecture.md` | Extends existing modular service pattern and marks missing services |
| `component-inventory.md` | Reuses existing services/packages and adds missing enterprise services |
| `team-practices.md` | Supports local runtime, service boundaries, tests, and Graphify-first practice |


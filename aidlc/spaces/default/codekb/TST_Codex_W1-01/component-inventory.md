# Component Inventory - LinerCore W1-01 Baseline

## Backend Components

| Component | Responsibility | Primary dependencies |
|---|---|---|
| `platform-messaging` | Shared Avro loading, schema registration, Kafka publish, relay scheduling, retries, noop safety | Spring Kafka, Avro, Confluent clients |
| `identity-service` | Authorization policy, roles, permissions | Spring Boot; internal callers |
| `reference-data-service` | Versioned business reference sets and change publication | PostgreSQL, Kafka, Schema Registry |
| `charge-agreement-service` | Agreement lifecycle, active lookup, quote calculation, manual pricing case storage | Reference Data, PostgreSQL, Kafka |
| `booking-service` | Booking lifecycle, validation, pricing orchestration, movement projection, confirmation publication | Identity, Reference Data, Charge, PostgreSQL, Kafka |
| `container-movement-service` | Journey lifecycle, Booking-confirmed ingestion, movement capture, status publication | Reference Data, Booking today, PostgreSQL, Kafka |

## W1 Service Internals

| Component | Role |
|---|---|
| `Booking` aggregate | Immutable lifecycle, pricing snapshot, exceptions, D&D candidates, audit attributes |
| `BookingApplicationService` | Use-case coordinator and outbox transaction boundary |
| `JdbcBookingRepository` | Booking snapshot persistence and queries |
| Booking outbox repository/relay | Claim, publish, retry, and broker metadata lifecycle |
| `KafkaBookingEventPublisher` | Map Booking payload to schema-specific `GenericRecord` and shared publisher |
| `HttpChargePricingClient` | Current active-agreement lookup adapter; builds quote locally |
| `HttpContainerMovementClient` | Transitional synchronous confirmation handoff |
| `ContainerJourney` aggregate | Journey status and movement history |
| `ContainerMovementApplicationService` | Idempotent confirmation ingestion, movement capture, outbox coordination |
| CMM outbox repository/relay | Status event delivery lifecycle |
| `KafkaContainerMovementEventPublisher` | Map CMM status to Avro and shared publisher |
| `HttpBookingMovementStatusClient` | Transitional synchronous status handoff |
| `ChargeAgreementApplicationService` | Agreement lifecycle and pricing engine |

## Frontend Components

| Component | Current state |
|---|---|
| `apps/auth` | Implemented Next.js auth surfaces and tests |
| `apps/reference-data` | Implemented operational workbench, clients, and tests |
| `apps/charge-agreements` | Implemented agreement page and test |
| `apps/booking` | Only `BookingWorkbench.tsx` and manifest; not routable/build-complete |
| `apps/container-movement` | Missing even though Compose declares it |
| `packages/ui` | Shared tokens and operational components such as Card, Table, StatusBadge, and command center |
| `packages/api-core` | Shared API primitives |
| `packages/auth` | Frontend auth helpers |
| `packages/config` | Shared TypeScript configuration |
| `packages/shared-types` | Cross-workspace types |
| `packages/transformers` | Data transformation helpers |
| `packages/utils` | Shared utilities |

## Runtime Components

| Component | Role |
|---|---|
| PostgreSQL | Service-owned databases; host defaults to port 55432 |
| Kafka | Local broker and event topics |
| Confluent Schema Registry | Avro registration and compatibility |
| Keycloak | Local identity provider |
| nginx | Unified local entry point on host port 8088 |
| Seed loader | Applies baseline identities/reference data after dependencies start |
| Prometheus/Grafana | Metrics collection and dashboards |
| Jaeger/OpenTelemetry Collector | Tracing |
| Elasticsearch/Kibana | Log/search observability profile |

## Automation Components

Root scripts perform prerequisite checks, Compose runtime control, seeding, contract validation/provider checks, readiness evidence, quality-gate aggregation, skeleton validation, and smoke tests. GitHub Actions runs the quality aggregator and local readiness on a self-hosted on-prem Linux runner and uploads evidence artifacts.

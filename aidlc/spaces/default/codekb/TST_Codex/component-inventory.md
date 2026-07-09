# Component Inventory - TST_Codex

## Inventory Context

This inventory is based on Graphify queries and focused scans of `apps/`, `packages/`, `services/`, `contracts/`, `scripts/`, `infrastructure/`, and `compose.yaml`.

## Backend Components

| Component | Path | Responsibility | Current maturity |
|-----------|------|----------------|------------------|
| Identity service | `services/identity-service` | Authorization decisions, roles, effective permissions, role assignment, audit seams | MVP foundation |
| Reference data service | `services/reference-data-service` | Reference set/record lifecycle, validation, history, outbox events | MVP foundation with placeholder messaging |
| Charge agreement service | `services/charge-agreement-service` | Agreement lifecycle, charge terms, active agreement lookup | Partial enterprise commercial foundation |

## Key Backend Classes

| Class | Responsibility | Graphify signal |
|-------|----------------|-----------------|
| `IdentityApplicationService` | Authorize, assign roles, effective permissions | Central node referenced by controller/tests |
| `ReferenceDataApplicationService` | Reference CRUD/validation/history/outbox publish | Central node with 42 graph connections |
| `ChargeAgreementApplicationService` | Agreement create/update/approve/suspend/expire/lookup | Central node with 31 graph connections |
| `ReferenceDataController` | Reference data HTTP API | Routes under `/reference-sets` |
| `IdentityAuthorizationController` | Identity internal HTTP API | Routes under `/internal/identity` |
| `ChargeAgreementApiController` | Charge agreement HTTP API | Routes under `/api/charge-agreements` |
| `ReferenceEventMapper` | Maps reference changes to outbox/event envelope | Domain outbox support |
| `InMemoryOutboxRepository` | In-memory outbox persistence | MVP/local adapter |
| `PlaceholderKafkaReferenceEventPublisher` | Placeholder event publication seam | Needs production Kafka hardening |
| `PlaceholderSchemaRegistryAdapter` | Placeholder schema registry seam | Needs real Schema Registry integration |

## Frontend Components

| Component | Path | Responsibility | Current maturity |
|-----------|------|----------------|------------------|
| Auth app | `apps/auth` | Auth-oriented UI | MVP foundation |
| Reference data app | `apps/reference-data` | Reference data workbench | MVP foundation |
| Charge agreements app | `apps/charge-agreements` | Charge agreement UI | Partial commercial UI |
| API core package | `packages/api-core` | Shared API client utilities | Shared foundation |
| Auth package | `packages/auth` | Shared auth utilities | Shared foundation |
| Config package | `packages/config` | Shared config | Shared foundation |
| Shared types | `packages/shared-types` | Shared TS types | Shared foundation |
| Transformers | `packages/transformers` | DTO transformation | Shared foundation |
| UI package | `packages/ui` | Shared React components | Shared foundation |
| Utils | `packages/utils` | Utilities | Shared foundation |

## Runtime and Operations Components

| Component | Path/File | Responsibility | Current maturity |
|-----------|-----------|----------------|------------------|
| Compose runtime | `compose.yaml` | Local infra/services/apps/observability | Partial; no enterprise `full` profile |
| Spring Dockerfile | `infrastructure/docker/spring-service.Dockerfile` | Package Spring service jar | Foundation |
| Next Dockerfile | `infrastructure/docker/next-app.Dockerfile` | Package Next app workspace | Foundation |
| nginx config | `infrastructure/nginx/default.conf` | Reverse proxy | Foundation |
| Local env example | `infrastructure/env/local.env.example` | Local runtime variables | Foundation |
| Seed data | `infrastructure/seeds/shared-platform-mvp-defaults.json` | Deterministic MVP seed data | Shared Platform only |
| Observability | `infrastructure/observability/` | Prometheus, Grafana, Jaeger, OTel, Elastic/Kibana config | Partial foundation |

## Contract and Test Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| Contract catalog | `contracts/catalog/contract-catalog.json` | Contract discovery/status |
| OpenAPI contracts | `contracts/openapi/` | Identity, reference-data, charge-agreements contracts |
| Avro contracts | `contracts/avro/` | Reference data changed events |
| Pact fixtures | `contracts/pact/` | Provider/message fixtures |
| Enterprise contract docs | `docs/enterprise-contracts/` | Booking/CMM/pricing enterprise contract authority |
| Quality workflow | `.github/workflows/quality-gates.yml` | CI quality gate entry |
| Quality scripts | `scripts/run-quality-gates.mjs`, `scripts/validate-contract-catalog.mjs`, `scripts/verify-contract-providers.mjs` | Local and CI validation |

## Missing Enterprise Components

Required but not found as implemented code:

- `booking-service`
- `container-movement-service` or CMM service
- pricing API provider for Booking/Charge contract
- D&D rule/calculation engine
- Booking UI
- CMM/journey/movement UI
- D&D outcome/exception UI
- full local runtime profile with all enterprise services
- enterprise seed data for agreements, tariffs, bookings, journeys, movements, and D&D rules

## Ownership Notes

Current component ownership aligns with the enterprise boundary model only for existing modules:

- Shared Platform owns Identity and Reference Data.
- Charge/Agreement owns current commercial agreement code.
- Booking and CMM ownership must be introduced as separate modules, not folded into existing services.

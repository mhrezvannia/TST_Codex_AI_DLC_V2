# Components - Shared Platform MVP

## Source Trace

This component design is derived from `requirements.md`, `stories.md`, `team-practices.md`, and `application-design-questions.md`. Brownfield-only upstream inputs `architecture.md` and `component-inventory.md` are not applicable because this is a greenfield Shared Platform intent. The design follows Enterprise Technical Environment v1.1 exactly.

## Component Inventory

| Component | Type | Purpose | Owns data? |
|---|---|---|---|
| `reference-data-service` | Backend microservice | Owns canonical reference data, provider/admin APIs, audit, outbox, and reference-change events. | Yes, PostgreSQL schema/database owned by the service. |
| `identity-service` | Backend microservice | Owns carrier authorization model, role/permission decisions, audit, and Keycloak integration adapters. | Yes, PostgreSQL schema/database owned by the service. |
| Kafka + Confluent Schema Registry | Platform integration | Shared asynchronous transport and schema-governed Avro event registry. | Kafka topics/schemas, not domain data. |
| `apps/auth` | Next.js app/BFF | Internal sign-in, callback, sign-out, access-denied, session display, request-access path. | No domain data; session state through approved BFF/auth package pattern. |
| `apps/reference-data` | Next.js app/BFF | Reference admin workspace, read-only lookup, event/status visibility, contract views. | No domain data; consumes APIs. |
| `@erp/*` shared packages | Frontend shared packages | UI, API core, auth, transformers, shared types, config, utilities. | No domain data. |
| Nginx edge | Platform edge | TLS termination, route forwarding, WAF/rate limiting baseline. | No. |
| Vault | Platform secret store | Service secrets and credentials. | Secrets only. |
| Observability stack | Platform integration | ELK logs, Prometheus/Grafana metrics, Jaeger tracing via OpenTelemetry. | Telemetry only. |

## `reference-data-service`

### Responsibilities

- Own nine canonical reference sets: Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, TradeLane.
- Enforce aggregate invariants, including Country-to-Port containment and TradeLane Region-pair validity.
- Expose REST/OpenAPI provider APIs for read access.
- Expose REST/OpenAPI admin APIs for create, update, deactivate, reactivate, search, validation, and status.
- Classify and audit PII/sensitive Party/Customer and authorization-relevant reference activity.
- Persist outbox entries for reference changes.
- Publish typed Avro `referencedata.<entity>.changed` events through Kafka/Schema Registry.
- Expose event publication status to admin/operator consumers.

### Internal Components

| Internal component | Responsibility |
|---|---|
| Reference Domain Core | Aggregates, value objects, invariants, domain events, domain exceptions. |
| Reference Application Service | Use-case handlers, ports, DTOs, transaction boundaries, outbox enqueueing. |
| Reference REST Adapter | Admin/provider controllers, OpenAPI DTOs, error envelope, authz enforcement. |
| Reference Data Access Adapter | JPA repositories and mappers implementing repository ports. |
| Reference Messaging Adapter | Outbox publisher, Avro mappers, Schema Registry producer integration. |
| Reference Published Language | External DTOs, client interfaces, Avro schemas, OpenAPI artifacts. |
| Reference Container | Spring Boot app, configuration, health checks, OpenTelemetry wiring. |

### Public Interfaces

- Admin REST API: reference lifecycle operations.
- Provider REST API: list/detail/search APIs for consumers.
- Event topics: nine typed reference-change event types.
- Status API: event/outbox status and freshness metadata for UI/operator views.
- Health/metrics endpoints.

### Boundaries

- No other component writes the reference datastore.
- Downstream modules consume APIs/events only.
- Kafka topics are integration contracts, not shared ownership of reference state.

## `identity-service`

### Responsibilities

- Own carrier role model and permission decision logic.
- Integrate with Keycloak 24 for authentication/token information without storing passwords.
- Expose authorization decision APIs for apps and services.
- Audit role and permission changes and authorization decisions where required.
- Represent MVP roles: pricing, sales, booking desk, equipment control, customer service, finance-read, reference admin, platform operator, security admin.

### Internal Components

| Internal component | Responsibility |
|---|---|
| Identity Domain Core | Role, permission, assignment, decision, audit domain objects. |
| Identity Application Service | Authorization use cases, assignment use cases, audit ports. |
| Identity REST Adapter | Authorization and administration APIs, OpenAPI, error envelope. |
| Identity Data Access Adapter | Role/permission assignment persistence and audit persistence. |
| Keycloak Adapter | Token/claims lookup, JWKS/OIDC metadata integration, claim translation. |
| Identity Published Language | Authorization API DTOs and client interfaces. |
| Identity Container | Spring Boot app, configuration, health checks, telemetry. |

### Public Interfaces

- Authorization decision API.
- Role/permission query API.
- Role assignment administration API where included in MVP backend scope.
- Audit query API for authorized security/platform users.
- Health/metrics endpoints.

### Boundaries

- Keycloak authenticates; `identity-service` authorizes.
- No custom password store.
- Apps and services conform to the platform authorization decision interface instead of embedding role logic.

## Kafka and Schema Registry Integration

### Responsibilities

- Host Shared Platform event topics.
- Register Avro schemas with backward compatibility checks.
- Support at-least-once publication and idempotent consumer behavior.
- Carry common event envelope fields: id, source, type, time, correlationId, dataSchemaVersion.

### Boundaries

- Kafka is platform infrastructure, not a domain service.
- `reference-data-service` is the producer for reference-change events in this workflow.
- Downstream module consumers are contract participants only; no downstream runtime is built here.

## `apps/auth`

### Responsibilities

- Provide sign-in, callback, sign-out, access-denied, session display, and request-access flows.
- Use Next.js App Router with BFF route handlers.
- Store tokens only in HttpOnly cookies through approved `@erp/auth` patterns.
- Use `proxy.ts` route protection.
- Call `identity-service` for authorization/session role details through BFF routes.

### Boundaries

- Does not implement authentication or password storage.
- Does not own full permission-review administration unless added in a later approved workflow.
- Browser clients do not call backend services directly.

## `apps/reference-data`

### Responsibilities

- Provide reference-data admin workspace.
- Present browse/search/detail/create/edit/deactivate/reactivate workflows based on authorization.
- Show validation, audit, event publication status, and contract/developer views.
- Use read-only mobile lookup by default.
- Use `@erp/ui`, `@erp/api-core`, `@erp/auth`, `@erp/transformers`, and `@erp/shared-types`.

### Boundaries

- Does not store canonical data.
- Does not bypass BFF or service contracts.
- Does not implement Charge, Booking, or Container Movement screens.

## Shared Frontend Packages

| Package | Component use |
|---|---|
| `@erp/ui` | App shell, navigation, forms, tables, dialogs, status badges, tabs. |
| `@erp/api-core` | Axios client, interceptors, request/response error handling. |
| `@erp/auth` | Session handling, BFF auth helpers, token-cookie conventions. |
| `@erp/transformers` | API DTO to UI model transforms. |
| `@erp/shared-types` | Generic API response, API error, pagination, nullable types. |
| `@erp/config` | Environment config and shared constants. |

## Component Ownership Rules

- Backend services own their data and publish contracts.
- Frontend apps own presentation and BFF routes, not domain truth.
- Shared packages are reused but do not contain module-specific domain ownership.
- Consumers integrate through contracts only.

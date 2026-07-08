# Units of Work - Shared Platform MVP

## Source Trace

These units are generated from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, `stories.md`, and approved `units-generation-questions.md`. The units preserve Shared Platform-only scope and do not include Charge, Booking, or Container Movement runtime implementation.

## Decomposition Approach

The units are bounded by architectural seams and independently testable platform capabilities. The set uses standard MVP granularity, mixed deployment models, OpenAPI/Avro/BFF contract boundaries, and explicit cross-cutting units for contracts, CI, observability, and local environment support.

This artifact defines units only. Dependency topology is in `unit-of-work-dependency.md`; economic Bolt sequencing belongs to Delivery Planning.

## Unit U01 - Platform Skeleton and Shared Runtime Baseline

Name: `U01-platform-skeleton`

Description: Establish the repository/platform baseline required by all Shared Platform services and apps.

Boundaries:

- Shared monorepo or workspace structure for backend services, frontend apps, packages, and infrastructure folders.
- Backend service skeleton conventions for Java 21, Spring Boot 3.3, hexagonal Maven modules.
- Frontend workspace conventions for Next.js App Router, Turborepo, Yarn, TypeScript strict mode, `@erp/*` package usage.
- Docker Compose, Nginx edge placeholders, local platform service definitions, and base configuration layout.

Responsibilities:

- Provide the buildable baseline other units can attach to.
- Define shared error envelope, correlation id conventions, and environment config patterns.
- Include baseline lint/format/type/compile scripts where applicable.

Deployment model: Shared foundation, embedded by services/apps.

Complexity: L

Implementation constraints:

- Must follow Enterprise Technical Environment v1.1 exactly.
- Must not introduce npm, pnpm, prohibited frontend libraries, public cloud services, Kubernetes, or non-Java backend domain code.

Story coverage: US-021, US-022, US-023.

## Unit U02 - Identity Authorization Service

Name: `U02-identity-authz-service`

Description: Implement `identity-service` authorization domain, Keycloak adapter boundary, role/permission API, and audit model.

Boundaries:

- `identity-service` hexagonal modules.
- Role catalog, permission decision domain, role assignment, and audit persistence.
- Keycloak token/claims adapter, without custom authentication or password storage.
- Authorization OpenAPI contract.

Responsibilities:

- Evaluate permissions for services and frontend BFFs.
- Represent MVP carrier roles.
- Persist and expose role/permission audit where authorized.
- Fail closed for protected authorization decisions.

Deployment model: Independently deployable backend service.

Complexity: L

Implementation constraints:

- Keycloak 24 remains authentication provider.
- `identity-service` owns authorization only.
- PostgreSQL datastore is owned by `identity-service`.

Story coverage: US-001, US-003, US-004, US-012, US-013, US-014, US-015.

## Unit U03 - Reference Domain and Provider/Admin APIs

Name: `U03-reference-domain-api`

Description: Implement `reference-data-service` domain model, persistence, validation, provider APIs, and admin APIs for the nine MVP reference sets.

Boundaries:

- `reference-data-service` domain core and application service.
- REST adapters for admin and provider APIs.
- Data access adapter and owned PostgreSQL schema.
- OpenAPI contracts for provider/admin APIs.

Responsibilities:

- Own Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.
- Enforce status, validation, unique keys, Location/Port hierarchy, Region grouping, and TradeLane Region-pair invariants.
- Provide list/detail/search/filter/create/update/deactivate/reactivate behavior.
- Persist audit metadata and correlation ids for reference changes.

Deployment model: Independently deployable backend service.

Complexity: XL

Implementation constraints:

- No shared database access by consumers.
- Aggregate modules must preserve explicit invariants rather than collapsing into ungoverned metadata tables.
- Admin mutations require `identity-service` authorization.

Story coverage: US-005, US-006, US-007, US-008, US-009, US-010, US-017.

## Unit U04 - Reference Event Outbox and Kafka Publication

Name: `U04-reference-event-outbox`

Description: Implement transactional outbox, Avro event schemas, Kafka publication adapter, Schema Registry integration, and event status.

Boundaries:

- Outbox persistence and claiming logic inside `reference-data-service`.
- Messaging adapter and Avro mappers.
- Nine typed `referencedata.<entity>.changed` schemas and topic conventions.
- Event publication status API/view model.

Responsibilities:

- Enqueue events in the same transaction as reference changes.
- Publish typed Avro events with common envelope fields.
- Record pending/published/failed/retrying/stale status.
- Support idempotency and compatibility checks.

Deployment model: Embedded in `reference-data-service` plus Kafka/Schema Registry platform integration.

Complexity: L

Implementation constraints:

- At-least-once publication and dedupe by event id.
- Backward-compatible schemas only.
- No downstream runtime consumers are implemented in this workflow.

Story coverage: US-011, US-016, US-018, US-019, US-020, US-022.

## Unit U05 - Auth Frontend App and BFF

Name: `U05-app-auth`

Description: Implement `apps/auth` sign-in, callback, sign-out, access-denied, session display, request-access path, and BFF session handling.

Boundaries:

- Next.js App Router routes and BFF route handlers for auth flows.
- `proxy.ts` route protection.
- `@erp/auth`, `@erp/api-core`, `@erp/ui`, and shared type integration.

Responsibilities:

- Start and complete Keycloak-backed internal sign-in.
- Establish approved HttpOnly-cookie session path.
- Show session/role details and access-denied states.
- Route request-access without implementing full permission-review administration.

Deployment model: Independently deployable frontend app/BFF.

Complexity: M

Implementation constraints:

- Browser JavaScript never accesses tokens.
- No customer-facing identity.
- No custom password storage.

Story coverage: US-001, US-002, US-003, US-004.

## Unit U06 - Reference Data Frontend App and BFF

Name: `U06-app-reference-data`

Description: Implement `apps/reference-data` admin workspace, read-only lookup, forms, validation display, event status, and BFF calls.

Boundaries:

- Next.js App Router routes for reference workspace, set list/detail/new/edit, event status, and contract views.
- BFF route handlers for reference APIs, authorization checks, and event/status queries.
- `@erp/ui` table/form/dialog/status components and `@erp/transformers`.

Responsibilities:

- Browse/search all nine reference sets.
- Create/update/deactivate/reactivate records where authorized.
- Show read-only state where write permission is absent.
- Display event status and validation errors.
- Support desktop admin, tablet adaptive layout, and mobile read-only lookup.

Deployment model: Independently deployable frontend app/BFF.

Complexity: XL

Implementation constraints:

- Use BFF route handlers only for backend calls.
- Use React Hook Form and Zod for forms.
- Meet WCAG 2.1 AA expectations.

Story coverage: US-003, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-019.

## Unit U07 - Published Contracts and Developer Experience

Name: `U07-contracts-dx`

Description: Produce and expose the Shared Platform contract catalog for reference APIs, identity authorization APIs, Avro events, examples, and compatibility status.

Boundaries:

- OpenAPI contract artifacts for `reference-data-service` and `identity-service`.
- Avro schema catalog and event examples.
- Message-pact/provider contract test fixtures.
- Read-only contract view models for `apps/reference-data`.

Responsibilities:

- Make provider APIs and event contracts reviewable.
- Show version, compatibility, and examples.
- Support downstream contract review without adding downstream runtime stubs.

Deployment model: Shared contract artifacts plus embedded app/service views.

Complexity: M

Implementation constraints:

- Downstream modules are future consumers only.
- Contract tests and schema compatibility are required gates.

Story coverage: US-016, US-017, US-018, US-022.

## Unit U08 - CI, Contract, Schema, and Test Quality Gates

Name: `U08-quality-gates`

Description: Implement CI workflows and quality checks for backend, frontend, OpenAPI, Pact/message-pact, Avro compatibility, and coverage.

Boundaries:

- GitHub Actions workflow definitions for self-hosted runners.
- Backend test/coverage gates.
- Frontend type/lint/test/accessibility-relevant checks.
- OpenAPI, Pact/message-pact, and Schema Registry compatibility checks.

Responsibilities:

- Block merge on configured failures.
- Enforce 85% backend line coverage target for both backend services.
- Validate contract/schema compatibility before staging deploy.

Deployment model: CI/CD pipeline unit, not a runtime deployable.

Complexity: L

Implementation constraints:

- Must use Yarn for frontend and Java/Maven backend conventions.
- Must run on self-hosted on-prem GitHub Actions runners.

Story coverage: US-022, US-023.

## Unit U09 - Local Seed Data and Docker Compose Environment

Name: `U09-local-seed-compose`

Description: Implement deterministic seed data and local Docker Compose environment support for Shared Platform development and tests.

Boundaries:

- Docker Compose service composition for local/on-prem parity.
- Seed data scripts/migrations for the nine reference sets.
- Local Keycloak, PostgreSQL, Kafka, Schema Registry, and service wiring assumptions where feasible.

Responsibilities:

- Provide repeatable local startup.
- Seed deterministic reference values for tests and smoke checks.
- Keep configurable trade lanes and regions decoupled from final trade-footprint decisions.

Deployment model: Local/environment support unit.

Complexity: M

Implementation constraints:

- No public cloud services.
- Seed scripts must be idempotent.

Story coverage: US-021, US-023.

## Unit U10 - Observability, Health, and Deployment Readiness

Name: `U10-observability-deployment`

Description: Implement structured logging, metrics, tracing, health checks, deployment descriptors, smoke checks, and runtime readiness hooks.

Boundaries:

- OpenTelemetry/logging/metrics integration across services and BFF apps.
- Health endpoints and smoke checks.
- Docker Compose deployment descriptors, Nginx routing, Vault secret references, registry conventions.

Responsibilities:

- Propagate correlation ids across API, audit, outbox, logs, traces, and Kafka events.
- Emit logs/metrics/traces compatible with ELK, Prometheus/Grafana, and Jaeger.
- Support staging health/smoke checks and production promotion readiness.

Deployment model: Cross-cutting operational unit embedded across deployables and platform definitions.

Complexity: L

Implementation constraints:

- Must align with on-prem Docker Compose, Terraform, Ansible, Nginx, Vault, ELK, Prometheus/Grafana, and Jaeger standards.
- Must not add AWS/public-cloud infrastructure.

Story coverage: US-019, US-020, US-022, US-023.

## Coverage Summary

All approved stories US-001 through US-023 have at least one implementing unit. Cross-cutting stories intentionally map to multiple units where acceptance requires service, app, pipeline, and platform evidence.

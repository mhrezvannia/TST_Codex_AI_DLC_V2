# Units Of Work - LinerCore Enterprise

## Source Context

This artifact consumes `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. The unit boundaries follow the approved Application Design: separate Shared Platform, Charge, Booking, CMM, Enterprise Web, contract, runtime, observability, and operation-readiness ownership.

The units are topology units for Construction. They are not an economic delivery sequence; `delivery-planning` chooses Bolt grouping and build order from the dependency DAG.

## Decomposition Strategy

Accepted answers from `units-generation-questions.md`:

- Boundary strategy: hybrid service/domain units plus explicit cross-cutting units.
- Granularity: medium, roughly 10-14 units.
- Dependency representation: strict DAG only, no delivery-order recommendation.
- Contract strategy: dedicated executable contract platform unit.
- Deployment model: independently deployable backend services, integrated enterprise web app, and shared local runtime.
- Cross-cutting units: security, contracts, observability, local runtime, seed/migration, CI/CD, and Operation readiness are explicit.

## Unit Catalog

| Unit | Name | Classification | Deployable model | Complexity |
|---|---|---|---|---|
| U01 | `local-runtime-foundation` | Infrastructure foundation | Shared Docker Compose/runtime | L |
| U02 | `contract-platform-catalog` | Cross-cutting contract foundation | Shared contract/test tooling | L |
| U03 | `shared-platform-identity-security` | Brownfield Shared Platform hardening | `identity-service`, Keycloak config | L |
| U04 | `shared-platform-reference-events` | Brownfield Shared Platform hardening | `reference-data-service`, Kafka publisher | L |
| U05 | `charge-agreement-pricing-domain` | Mixed Charge/Agreement extension | `charge-service` / evolved `charge-agreement-service` | XL |
| U06 | `booking-lifecycle-domain` | Greenfield Booking service | `booking-service` | XL |
| U07 | `container-movement-domain` | Greenfield CMM service | `container-movement-service` | XL |
| U08 | `booking-charge-pricing-integration` | Cross-module integration | Booking -> Charge HTTP/Pact | L |
| U09 | `booking-confirmed-journey-integration` | Cross-module integration | Booking -> Kafka -> CMM | L |
| U10 | `movement-status-booking-integration` | Cross-module integration | CMM -> Kafka -> Booking | L |
| U11 | `dnd-pricing-integration` | Cross-module integration | Booking -> Charge D&D HTTP/Pact | XL |
| U12 | `enterprise-seed-migrations-devex` | Runtime/devex evidence | Per-service migrations and deterministic seed | L |
| U13 | `enterprise-web-shell-and-workflows` | Frontend application | Integrated `enterprise-web` | XL |
| U14 | `observability-quality-operation-readiness` | Cross-cutting quality/operation | CI/CD, tests, dashboards, runbooks | XL |

## Unit Definitions

### U01 - `local-runtime-foundation`

Description:

Build the local runtime substrate required by all enterprise services and frontends.

Responsibilities:

- Docker Compose profiles `core`, `app`, `observability`, `devtools`, and `full`.
- PostgreSQL, Kafka, Schema Registry, Keycloak, reverse proxy, and development network conventions.
- `.env.example`, local setup/reset/start/stop/logs/health command surfaces.
- Independent IDE development support where infrastructure runs in Docker and one app/service runs locally.

Boundaries:

- Does not implement domain behavior.
- Does not seed business fixtures beyond infrastructure bootstrap.

Deployment model:

Shared local runtime and reverse-proxy foundation.

Implementation notes:

- Must support `docker compose --profile full up -d --build`.
- Must not require remote runtime servers.

### U02 - `contract-platform-catalog`

Description:

Convert enterprise markdown contracts into executable contract assets and validation gates.

Responsibilities:

- OpenAPI catalog for service HTTP APIs.
- Avro and AsyncAPI assets for `booking.confirmed`, `containermovement.status`, and reference-data events.
- HTTP Pact for Booking -> Charge pricing and D&D APIs.
- Message-pact fixtures, Schema Registry compatibility checks, and contract health reporting.

Boundaries:

- Does not replace provider or consumer implementation.
- Does not claim integration readiness from markdown-only contracts.

Deployment model:

Shared contract test tooling used by services, CI, and local runtime.

Implementation notes:

- Backward compatibility is required for schema evolution.
- Contracts must carry correlation, idempotency, auth, and observability fields required by `requirements.md`.

### U03 - `shared-platform-identity-security`

Description:

Enterprise-harden identity, authentication, authorization, capability, audit, JWT, and Keycloak integration.

Responsibilities:

- Keycloak-backed authentication for UI and services.
- Role/capability authorization model and denied-path enforcement.
- Service-to-service JWT/RS256 validation.
- Authorization audit logs and permission catalog APIs.
- Kafka ACL design hooks where service identities are required.

Boundaries:

- Does not own domain records for pricing, booking, CMM, or D&D.
- Does not bypass service-level authorization decisions.

Deployment model:

Existing `identity-service` plus Keycloak realm/config and service-security conventions.

Implementation notes:

- Reuse correct MVP identity code.
- Add least-privilege and test evidence before downstream services rely on it.

### U04 - `shared-platform-reference-events`

Description:

Enterprise-harden reference data lifecycle, validation, canonical events, and transactional outbox.

Responsibilities:

- Reference set/record lifecycle, versioning, history, and dependency visibility.
- Reference validation APIs used by Charge, Booking, CMM, and UI.
- Reference-data changed events through canonical envelope and outbox.
- Schema Registry and Kafka publisher reliability.

Boundaries:

- Reference Data does not own domain state for agreements, bookings, movements, or D&D outcomes.
- Consumers use APIs/events, not `reference_data` database joins.

Deployment model:

Existing `reference-data-service` plus Kafka/Schema Registry integration.

Implementation notes:

- Preserve current domain-core/application-service boundaries.
- Add deterministic seed sets needed by booking, pricing, D&D, and movement validation.

### U05 - `charge-agreement-pricing-domain`

Description:

Extend current charge-agreement foundations into complete Charge Calculation and Customer Agreement domain capability.

Responsibilities:

- Customer agreements, tariffs, validity, applicability, commodity eligibility, pricing basis, pricingRef, and audit.
- Agreement determination and tariff fallback.
- Itemised base freight, surcharges, local charges, manual pricing fallback, idempotency, timeout, retry, and circuit-breaker support.
- D&D rules, free time, rates, boundary applicability, import demurrage, import detention, export detention, chargeable-day calculation, manual D&D fallback.

Boundaries:

- Charge calculates prices and D&D results.
- Charge does not mutate Booking lifecycle and does not query Booking or CMM databases.

Deployment model:

Evolved `charge-agreement-service`, later named or aliased as Charge Service through an approved migration.

Implementation notes:

- Keep domain-core independent of Spring, persistence, messaging, and UI.
- Pricing and D&D public methods must be contract-backed before integration readiness.

### U06 - `booking-lifecycle-domain`

Description:

Create the Customer Booking service domain, persistence, command/query API, and lifecycle orchestration core.

Responsibilities:

- Booking creation, draft updates, validation, customer references, routing, POL/POD, transshipment, voyage, equipment, commodity, reefer, DG, and audit.
- Pricing orchestration state and pricing result snapshots.
- Operational/capacity validation through fixture-backed adapter seam and audited manual override.
- Confirmation, amendment, reconfirmation, bookingRevision, lifecycle status, exception queues, and D&D trigger evaluation.

Boundaries:

- Booking owns booking lifecycle and D&D trigger decisions.
- Booking does not calculate pricing, D&D rates, free time, or CMM movement status.

Deployment model:

New Spring Boot `booking-service`.

Implementation notes:

- Must use database-backed idempotency, outbox, consumer deduplication, and audit.
- Must support both draft and confirmed booking revisions.

### U07 - `container-movement-domain`

Description:

Create Container Movement Management domain, persistence, command/query API, and movement/status logic.

Responsibilities:

- Consume booking facts for journey creation and bookingRevision reconciliation.
- Derive expected POL, transshipment, POD, and equipment movement plans.
- Capture planned, estimated, and actual movement events.
- Validate DCSA v2.2-aligned event, location, time, equipment, empty/laden, and transshipment fields.
- Handle duplicate, late, and out-of-order events.
- Derive and publish movement status.

Boundaries:

- CMM owns movement facts and derived status.
- CMM does not decide whether movement is D&D relevant and does not calculate D&D.

Deployment model:

New Spring Boot `container-movement-service`.

Implementation notes:

- Must preserve occurred time and received time.
- Must expose journey, movement, status, and history APIs.

### U08 - `booking-charge-pricing-integration`

Description:

Implement the synchronous Booking -> Charge pricing seam.

Responsibilities:

- `pricing.request` and `pricing.result` OpenAPI/Pact.
- Booking HTTP client, timeout, retry, circuit breaker, idempotency, and exception handling.
- Charge provider verification and Booking consumer verification.
- Pricing snapshot persistence in Booking and audit/correlation evidence.

Boundaries:

- Booking stores pricing results for booking context.
- Charge remains the pricing authority.

Deployment model:

Integration code and contract tests across `booking-service`, Charge Service, and contract tooling.

Implementation notes:

- Supports Flow 1 and manual pricing fallback.

### U09 - `booking-confirmed-journey-integration`

Description:

Implement Booking -> CMM event integration for confirmed bookings and journey creation.

Responsibilities:

- `booking.confirmed` Avro/AsyncAPI producer in Booking through transactional outbox.
- Schema Registry compatibility and message-pact fixtures.
- CMM consumer with deduplication and bookingRevision reconciliation.
- Journey creation and expected movement derivation from event payload.

Boundaries:

- Booking publishes confirmation facts.
- CMM creates/reconciles journey state.

Deployment model:

Event integration across `booking-service`, Kafka/Schema Registry, `container-movement-service`, and contract tooling.

Implementation notes:

- Supports Flow 2 and forms the event side of the walking skeleton.

### U10 - `movement-status-booking-integration`

Description:

Implement CMM -> Booking event integration for movement status and booking lifecycle update.

Responsibilities:

- `containermovement.status` Avro/AsyncAPI producer in CMM.
- Booking consumer with deduplication, ordering/staleness checks, lifecycle update, and exception queue.
- Message-pact and Schema Registry compatibility.
- Correlation and observability across status publication and consumption.

Boundaries:

- CMM owns movement status derivation.
- Booking consumes status and updates booking lifecycle without recalculating movement status.

Deployment model:

Event integration across CMM, Kafka/Schema Registry, Booking, and contract tooling.

Implementation notes:

- Supports Flow 3 and supplies evidence for D&D trigger inputs.

### U11 - `dnd-pricing-integration`

Description:

Implement Booking-triggered Charge D&D calculation and result storage.

Responsibilities:

- Booking D&D boundary recognition from movement status and booking lifecycle facts.
- `pricing.dnd-request` and `pricing.dnd-result` OpenAPI/Pact.
- Charge D&D rule application, free-time/rate calculation, chargeable days, manual fallback, and audit.
- Booking D&D charge snapshot storage and exception handling.

Boundaries:

- Booking triggers and stores outcomes.
- Charge calculates D&D.
- CMM supplies movement facts/status only.

Deployment model:

Integration code and tests across Booking, Charge, and CMM-produced event facts.

Implementation notes:

- Supports Flow 4 and enforces the Booking/Charge/CMM boundary rules.

### U12 - `enterprise-seed-migrations-devex`

Description:

Implement per-service migrations, deterministic enterprise seed data, and developer command surfaces.

Responsibilities:

- Separate logical databases/users for identity, reference_data, pricing, booking, container_movement, Keycloak, and tool databases.
- Per-service migration execution and reset flows.
- Deterministic seed users, roles, reference data, agreements, tariffs, charges, D&D rules, bookings, journeys, and movements.
- Documented commands for setup, startup, shutdown, reset, migrations, seed, logs, health, tests, and E2E validation.

Boundaries:

- Does not allow cross-service SQL joins.
- Seed fixtures must not replace real business implementation.

Deployment model:

Shared scripts, migrations, fixtures, and documentation across local runtime.

Implementation notes:

- Must make repeated local and CI test runs deterministic.

### U13 - `enterprise-web-shell-and-workflows`

Description:

Build the integrated frontend application using the Claude UI export as preferred visual baseline where compatible.

Responsibilities:

- Authenticated enterprise shell, navigation, permissions, work queue, module routes, exception and audit views.
- UI workflows for reference data, agreements, tariffs, pricing, booking, amendments, manual pricing, journeys, movements, D&D outcomes, and operations.
- Reuse existing shared packages and module app code where useful.
- Replace prototype business logic with real service APIs and event-backed state.

Boundaries:

- UI does not own business rules.
- UI does not query service databases.
- UI must not copy fake prototype behavior from Claude export.

Deployment model:

New integrated Next.js `enterprise-web`, with existing apps retained as reusable foundations or module development apps as Delivery Planning decides.

Implementation notes:

- Preserve refined mockup visual quality, page composition, and UX direction while making ownership visible.

### U14 - `observability-quality-operation-readiness`

Description:

Implement quality gates, end-to-end evidence, observability, CI/CD hooks, and Operation readiness artifacts.

Responsibilities:

- Structured logs, metrics, traces, dashboards, alerts, SLO evidence, and correlationId propagation.
- E2E validation for Flows 1-5.
- Contract, integration, security, resilience, performance, and no-fake-completion checks.
- CI/CD pipelines, deployment pipeline artifacts, rollback, backup, DR, runbooks, incident readiness, and feedback evidence.

Boundaries:

- Does not mark enterprise completion unless real services, migrations, APIs/events, UI, tests, runtime, contracts, and observability evidence are present.
- Operation stages refine production promotion and incident details.

Deployment model:

Cross-cutting quality/operation assets integrated with local runtime, CI, and Operation stages.

Implementation notes:

- This unit packages evidence; it does not mask incomplete domain work.

## Verification Expectations

Every unit must prove:

- Source traceability to `requirements.md` and `stories.md`.
- Boundary compliance from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`.
- Real implementation evidence, not TODO-only methods or mock-only UI.
- Local runtime compatibility and documented verification commands where applicable.

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` could not start under the current Codex account/model configuration.

Findings:

- The unit set preserves the complete enterprise scope: Shared Platform, Charge, Customer Agreement, Booking, D&D, CMM, full UI, integrations, local runtime, observability, quality, and Enterprise Operation.
- Unit boundaries follow approved service/domain ownership and do not collapse the target back to Shared Platform.
- Dedicated contract, runtime, seed/migration, UI, observability, and operation-readiness units keep cross-cutting work visible instead of hiding it inside service units.
- The dependency artifact contains a strict DAG with the required machine-readable `yaml` block and does not recommend an implementation order.
- Story mapping covers every story from `stories.md`, and every unit has story coverage.

Residual risks to carry forward:

- Delivery Planning must choose Bolt grouping and economic sequence without violating the DAG.
- The first Construction Bolt should package a walking skeleton that proves auth/reference readiness, Booking-to-Charge pricing, Booking confirmation, CMM journey creation, enterprise UI access, and local runtime evidence.

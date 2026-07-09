# Architecture Decisions - LinerCore Enterprise

## Source Context

These ADRs consume `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. They record decisions made for Application Design and identify consequences for Units Generation, Delivery Planning, Functional Design, and Construction.

## ADR-001 - Preserve Separate Domain Services

Status: Proposed for approval.

Context:

The enterprise target includes Shared Platform, Charge Calculation and Customer Agreement, Customer Booking, D&D, Container Movement Management, full UI, integrations, local runtime, and Operation. `architecture.md` and `component-inventory.md` show existing identity, reference-data, and charge-agreement foundations, while Booking and CMM are missing.

Decision:

Use separate bounded services for Identity, Reference Data, Charge, Booking, and Container Movement Management. Do not collapse all domains into one service.

Alternatives considered:

- One enterprise service: simpler initial wiring, but violates module ownership, data ownership, and user scope.
- Shared Platform absorbs Booking/CMM: reuses MVP service, but creates wrong business ownership and hidden coupling.

Consequences:

- More contracts and runtime wiring are required.
- Module ownership and test boundaries remain clear.
- Booking/CMM can be built without rewriting valid Shared Platform code.

Reversibility:

Low after implementation because service/database boundaries and contracts become central architecture.

## ADR-002 - Use Existing Spring Modular Service Pattern

Status: Proposed for approval.

Context:

Existing Java services use domain-core, application-service, dataaccess, messaging, container, and published-language modules. Team practices require domain-core to stay free of Spring, persistence, messaging, and frontend concerns.

Decision:

All new backend services use the same multi-module Spring Boot pattern.

Alternatives considered:

- New framework for Booking/CMM: may optimize locally but increases delivery and operations risk.
- Modular monolith: simpler deployment, but conflicts with explicit module/service ownership.

Consequences:

- Developers can reuse patterns from existing services.
- Functional Design can define domain models and ports consistently.
- More Maven modules and Compose entries are needed.

Reversibility:

Medium before Construction; low after services and tests are built.

## ADR-003 - Evolve charge-agreement-service Into Charge Service

Status: Proposed for approval.

Context:

The current `charge-agreement-service` owns agreement lifecycle foundations but not full pricing/D&D. Requirements assign Charge ownership over agreements, tariffs, pricing, D&D rules, free time, rates, and calculation.

Decision:

Extend the existing charge agreement foundation into a Charge Service capability. The code module may initially remain `charge-agreement-service`, but service responsibility expands to pricing and D&D under explicit architecture and future migration naming.

Alternatives considered:

- Create a separate pricing service beside charge agreement: clearer naming, but risks splitting agreement/pricing/D&D rules prematurely.
- Put pricing in Booking: violates ownership and D&D calculation constraints.

Consequences:

- Existing agreement code is reused.
- Pricing and D&D can share agreement/tariff/rule data.
- Naming and package migration must be handled deliberately in Delivery Planning.

Reversibility:

Medium if done before public contract freeze; lower after pricing contracts and DB schema stabilize.

## ADR-004 - Synchronous Pricing, Asynchronous Lifecycle Events

Status: Proposed for approval.

Context:

Booking needs pricing before confirmation. CMM journey creation and movement status are lifecycle/status notifications. Enterprise contracts require `pricing.request`, `pricing.result`, `pricing.dnd-request`, `pricing.dnd-result`, `booking.confirmed`, and `containermovement.status`.

Decision:

Use synchronous HTTP/OpenAPI/Pact for Booking to Charge pricing and D&D request/response. Use Kafka/Avro/AsyncAPI/message-pact for `booking.confirmed` and `containermovement.status`.

Alternatives considered:

- Async-only pricing: better decoupling, but complicates confirmation and manual pricing workflow.
- HTTP-only lifecycle integration: simpler local debugging, but weaker event-driven decoupling and status propagation.

Consequences:

- Pricing APIs need timeout, retry, circuit breaker, idempotency, and manual fallback.
- Events need Schema Registry compatibility, outbox, deduplication, ordering, and correlation.

Reversibility:

Medium. Contracts can evolve, but changing sync/async style affects many flows.

## ADR-005 - Separate Logical Databases Per Service

Status: Proposed for approval.

Context:

Requirements allow one PostgreSQL container locally but require separate logical databases/users and no cross-service SQL joins.

Decision:

Use separate logical databases and users for identity, reference_data, pricing, booking, container_movement, Keycloak, and tool databases where required.

Alternatives considered:

- Single shared schema: easier local setup, but violates ownership.
- Separate PostgreSQL containers per service: strong isolation, but heavier local runtime.

Consequences:

- Migration tooling must run per service.
- Tests can enforce database ownership.
- Local Compose remains practical on Windows.

Reversibility:

Low after migrations and service data models are implemented.

## ADR-006 - Integrated Enterprise Web App With Reused Packages

Status: Proposed for approval.

Context:

Refined mockups define one enterprise shell across modules. Existing apps and shared packages provide useful foundations but do not cover full enterprise workflows.

Decision:

Create an integrated enterprise Next.js web app for the operating console, reusing existing `@erp/*` packages and code patterns. Existing apps may remain as module dev apps or be migrated during Delivery Planning.

Alternatives considered:

- Keep only existing separate apps: preserves code, but produces fragmented UX and misses enterprise shell.
- Copy Claude HTML export: preserves visuals quickly, but imports fake prototype logic and conflicts with requirements.

Consequences:

- UI can present cross-module workflows and exceptions coherently.
- Frontend must not own business rules.
- Application Design must provide route/component contracts to implementation.

Reversibility:

Medium. Frontend topology can be adjusted before Construction, but UX route commitments will shape units.

## ADR-007 - Local Docker Full Runtime As Primary Runtime Gate

Status: Proposed for approval.

Context:

The target is local Windows execution through `docker compose --profile full up -d --build`, with independent development modes. Completion cannot be claimed from containers merely starting.

Decision:

Design local Compose profiles `core`, `app`, `observability`, `devtools`, and `full`, with the `full` profile requiring service health, migrations, seed data, contract support, observability, and E2E flow evidence.

Alternatives considered:

- Host runtime only: fast for development, but weak full-system evidence.
- Remote cloud runtime first: conflicts with local execution requirement.

Consequences:

- Compose, seed data, health checks, and scripts become first-class architecture.
- Application Design must feed Infrastructure Design and Operation stages.

Reversibility:

Medium. Profiles can evolve, but local full-runtime proof remains mandatory.

## ADR-008 - Contract Platform Blocks Integration Readiness Claims

Status: Proposed for approval.

Context:

Enterprise contract documents exist, but executable Booking/CMM/pricing/D&D contracts are not yet implemented. Requirements forbid fake completion.

Decision:

No integration is considered ready until executable OpenAPI, Avro, AsyncAPI, HTTP Pact, message-pact, Schema Registry compatibility, and relevant provider/consumer tests pass.

Alternatives considered:

- Treat markdown contracts as sufficient: quick documentation win, but hides integration risk.
- Delay contracts until after code: faster initial coding, but high rework risk.

Consequences:

- Units Generation must include contract artifact units before dependent integration units.
- CI/CD must gate on contract validation.

Reversibility:

Low, because contract-first sequencing protects enterprise delivery.

## ADR-009 - Explicit Ownership Labels In UI

Status: Proposed for approval.

Context:

The Claude UI visually combines booking, movement, D&D, and finance-like concepts. Requirements require separate ownership.

Decision:

The UI will show ownership labels and evidence separation for Booking trigger, Charge calculation, CMM movement truth, and Shared Platform controls.

Alternatives considered:

- Hide ownership under a smooth journey: simpler UX, but risks wrong implementation and audit confusion.

Consequences:

- Users see why a result exists and which module owns it.
- Audit and exception triage are clearer.

Reversibility:

High at design level, but ownership clarity should remain.

## ADR-010 - Use Graphify As Architecture Understanding Layer

Status: Proposed for approval.

Context:

The active enterprise workflow requires Graphify query/explain/path before broad architecture decisions. codebase-memory MCP resources are not currently exposed.

Decision:

Architecture and later cross-cutting edits use Graphify first, then AI-DLC codekb, then focused file reads. Graph limitations, including raw Claude UI exact-path semantic indexing gaps, are reported explicitly.

Alternatives considered:

- Raw search first: faster in small cases, but violates workflow policy and loses graph context.

Consequences:

- Decisions trace to graph and codekb evidence.
- Gaps are visible instead of over-claimed.

Reversibility:

High if MCP/Graphify tooling changes, but current workflow requires this policy.

## Gate Choices

Approval of this stage accepts:

- Separate backend service boundaries for Shared Platform, Charge, Booking, and CMM.
- Integrated enterprise web shell with reused packages.
- Synchronous pricing/D&D APIs and asynchronous lifecycle/status events.
- Separate logical databases/users per service.
- Local full runtime as the primary runtime gate.
- Contract platform as a prerequisite to integration readiness.


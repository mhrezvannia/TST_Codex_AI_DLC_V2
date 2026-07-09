# Requirements - LinerCore Enterprise

## Source Context

This requirements artifact consumes `intent-statement.md`, `scope-document.md`, `business-overview.md`, `architecture.md`, `code-structure.md`, `team-practices.md`, and `requirements-analysis-questions.md`.

Graphify was used before broad requirements decisions through `graphify query`, `graphify explain "Customer Booking"`, and `graphify path "Customer Booking" "Container Movement Management"`. The graph confirms that Shared Platform and partial Charge Agreement implementation exist, while Booking and Container Movement Management are primarily represented by documents/contracts rather than implemented services.

## Intent Analysis

LinerCore must become a complete integrated production-grade carrier operating application, not an extension of the Shared Platform MVP alone. The business outcome is a local-first enterprise system that connects commercial agreements and pricing, booking capture and confirmation, movement visibility, detention and demurrage, authenticated operations UI, runtime infrastructure, and operational readiness into five verified end-to-end flows.

The enterprise release must reuse valid Shared Platform MVP functionality, preserve the old MVP record and tag, and add missing modules through explicit service and data ownership boundaries. Completion requires real implementation, persistence, contracts, events, UI, security, tests, observability, and local runtime proof.

## Functional Requirements

### Shared Platform

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| FR-SP-001 | The system shall preserve the completed Shared Platform MVP intent at `aidlc/spaces/default/intents/260630-shared-platform` and the `shared-platform-mvp-complete` tag as immutable historical baseline. | Must | Audit review and git/tag verification |
| FR-SP-002 | The system shall provide authenticated user access through Keycloak-backed identity integration. | Must | Auth integration tests and UI login flow |
| FR-SP-003 | The system shall enforce module and action permissions through role and capability authorization. | Must | Denied-path tests and audit records |
| FR-SP-004 | The system shall expose and maintain reference data required by booking, pricing, agreements, D&D, movements, and operations. | Must | API tests, seed validation, UI workflow tests |
| FR-SP-005 | The system shall publish reference-data changes through a canonical event envelope and transactional outbox. | Must | Message contract tests and outbox integration tests |
| FR-SP-006 | The system shall support correlation IDs across HTTP requests, events, logs, and traces. | Must | Integration test and observability evidence |
| FR-SP-007 | The system shall provide contract-test infrastructure for OpenAPI, Avro, AsyncAPI, HTTP Pact, and message-pact assets. | Must | Contract validation pipeline |

### Charge Calculation And Customer Agreement

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| FR-CHG-001 | The system shall manage approved customer agreements with validity, applicability, commodity eligibility, charge terms, and audit history. | Must | Domain/API/UI tests |
| FR-CHG-002 | The system shall support contract customer, spot customer, and manual-pricing customer paths while deferring full customer hierarchy. | Must | Pricing orchestration tests |
| FR-CHG-003 | The system shall determine active agreement pricing where eligible and use tariff fallback where no agreement applies. | Must | Pricing test matrix |
| FR-CHG-004 | The system shall calculate and return itemised base freight, surcharge, local charge, pricing basis, pricingRef, and audit details. | Must | `pricing.result` contract tests |
| FR-CHG-005 | The system shall expose `pricing.request` and `pricing.result` integrations with idempotency, correlation, timeout, retry, and circuit-breaker behavior. | Must | HTTP/message contract and resilience tests |
| FR-CHG-006 | The Charge module shall own D&D rules, free time, rates, chargeable-day calculation, and D&D calculation. | Must | D&D domain tests |
| FR-CHG-007 | The system shall support import demurrage, import detention, and export detention in the first release. | Must | D&D scenario tests |
| FR-CHG-008 | The system shall expose `pricing.dnd-request` and `pricing.dnd-result` integrations with manual override and exception queue support. | Must | Contract and workflow tests |

### Customer Booking

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| FR-BKG-001 | The system shall allow authenticated booking users to create bookings with customer references, routing, POL, POD, transshipment legs, voyage references, equipment, commodity, reefer indicators, and DG indicators. | Must | Booking API/UI tests |
| FR-BKG-002 | The system shall orchestrate pricing by sending pricing requests to Charge and storing auditable pricing results. | Must | E2E Flow 1 |
| FR-BKG-003 | The system shall support manual pricing workflow when automated pricing cannot complete. | Must | Exception workflow tests |
| FR-BKG-004 | The system shall validate bookings against local fixture-backed schedule/capacity adapters and allow audited manual operational override where needed. | Must | Validation and audit tests |
| FR-BKG-005 | The system shall confirm bookings only after required pricing and operational checks or approved manual fallbacks are recorded. | Must | Booking confirmation tests |
| FR-BKG-006 | The system shall publish `booking.confirmed` with bookingRevision, correlationId, idempotency key, and backward-compatible schema registration. | Must | AsyncAPI/Avro/message-pact tests |
| FR-BKG-007 | The system shall support booking amendment, conditional repricing, conditional operational validation, reconfirmation, and bookingRevision increment. | Must | E2E Flow 5 |
| FR-BKG-008 | The system shall consume `containermovement.status` and update booking lifecycle state without recalculating movement status. | Must | E2E Flow 3 |
| FR-BKG-009 | The Booking module shall detect D&D-relevant movement boundaries and trigger D&D pricing requests without calculating free time or rates. | Must | E2E Flow 4 |
| FR-BKG-010 | The system shall provide booking exception queues for pricing, capacity, movement, D&D, and contract failures. | Must | Exception workflow tests |

### Container Movement Management

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| FR-CMM-001 | The system shall consume `booking.confirmed` and create or reconcile container journeys by bookingRevision. | Must | E2E Flow 2 |
| FR-CMM-002 | The system shall derive expected movements for POL, transshipment, POD, and equipment journeys from booking data. | Must | Journey derivation tests |
| FR-CMM-003 | The system shall capture planned, estimated, and actual movement events through UI/API manual capture with deterministic fixtures. | Must | Movement API/UI tests |
| FR-CMM-004 | The system shall validate movement events against DCSA v2.2-aligned event, location, time, equipment, empty/laden, and transshipment rules. | Must | Validation test suite |
| FR-CMM-005 | The system shall handle duplicate, late, and out-of-order movement events deterministically. | Must | Ordering/deduplication tests |
| FR-CMM-006 | The system shall derive container movement status from validated movement facts and operational history. | Must | Status derivation tests |
| FR-CMM-007 | The system shall publish `containermovement.status` with correlationId, event identity, ordering metadata, and backward-compatible schema registration. | Must | AsyncAPI/Avro/message-pact tests |
| FR-CMM-008 | CMM shall report movement facts and status but shall not decide whether a movement is D&D relevant. | Must | Architecture and integration tests |

### Frontend And UX

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| FR-UI-001 | The frontend shall use `design-inputs/claude-ui-export/` as preferred visual and UX baseline where compatible with authoritative requirements. | Must | Design review |
| FR-UI-002 | The frontend shall preserve visual quality, navigation direction, layout intent, and component appearance while replacing prototype business logic with real APIs and events. | Must | Refined mockup and UI tests |
| FR-UI-003 | The frontend shall support authentication, reference data, agreements, tariffs, pricing, bookings, amendments, manual pricing, journeys, movements, D&D outcomes, and operational exceptions. | Must | End-to-end UI workflow tests |
| FR-UI-004 | The UI shall prioritize enterprise workflow density and operational efficiency over marketing-style screens or decorative prototype behavior. | Must | Product/design review |
| FR-UI-005 | The UI shall expose auditable manual fallback and exception handling paths for pricing, capacity, movement, and D&D workflows. | Must | UI acceptance tests |

### Local Runtime And Developer Experience

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| FR-RUN-001 | The complete application shall run locally on Windows using `docker compose --profile full up -d --build` without remote runtime servers. | Must | Local runtime gate |
| FR-RUN-002 | The local runtime shall include PostgreSQL, Kafka, Schema Registry, Keycloak, all backend services, all frontend apps, reverse proxy, contract-test support, and observability support. | Must | Compose health checks |
| FR-RUN-003 | The runtime shall support `core`, `app`, `observability`, `devtools`, and `full` profiles, plus targeted module-development modes where useful. | Must | Compose/profile tests |
| FR-RUN-004 | The local environment shall create separate logical databases and users for identity, reference data, pricing, booking, container movement, Keycloak, and infrastructure tools where required. | Must | Migration/setup verification |
| FR-RUN-005 | No service shall directly query another service's domain database or depend on cross-module SQL joins. | Must | Architecture tests/code review |
| FR-RUN-006 | The repository shall provide `.env.example` without secrets and documented commands for setup, startup, shutdown, reset, migrations, seed, logs, health checks, tests, and E2E validation. | Must | Documentation and script tests |
| FR-RUN-007 | The runtime shall seed deterministic users, roles, reference data, agreements, tariffs, charges, D&D rules, bookings, journeys, and movements. | Must | Seed validation tests |

### End-To-End Business Flows

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| FR-E2E-001 | Flow 1 shall execute booking creation, pricing, agreement or tariff determination, itemised charges, operational validation, confirmation, and `booking.confirmed`. | Must | Automated E2E test |
| FR-E2E-002 | Flow 2 shall execute `booking.confirmed`, CMM journey creation, and expected movement derivation. | Must | Automated E2E test |
| FR-E2E-003 | Flow 3 shall execute movement capture, validation, status derivation, `containermovement.status`, and Booking lifecycle update. | Must | Automated E2E test |
| FR-E2E-004 | Flow 4 shall execute movement boundary detection, `pricing.dnd-request`, Charge free-time/rate calculation, `pricing.dnd-result`, and Booking D&D charge storage. | Must | Automated E2E test |
| FR-E2E-005 | Flow 5 shall execute booking amendment, conditional repricing/revalidation, reconfirmation, bookingRevision increment, and CMM reconciliation. | Must | Automated E2E test |

## Non-Functional Requirements

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| NFR-SEC-001 | The system shall enforce Keycloak-backed authentication and module capability authorization for users. | Must | Auth tests |
| NFR-SEC-002 | The system shall enforce service-to-service JWT/RS256 and Kafka ACLs for protected integrations. | Must | Security integration tests |
| NFR-SEC-003 | The system shall prove denied access paths and authorization audit records in tests. | Must | Negative test suite |
| NFR-SEC-004 | Local auth bypass shall be explicit, development-only, and impossible to enable accidentally in non-local modes. | Must | Config tests |
| NFR-REL-001 | All cross-module calls shall include idempotency, deduplication where applicable, timeouts, retries, and circuit-breaking. | Must | Resilience tests |
| NFR-REL-002 | Asynchronous publishing shall use transactional outbox and recoverable retry behavior. | Must | Outbox integration tests |
| NFR-OBS-001 | The system shall emit structured logs, metrics, traces, correlation IDs, dashboards, alerts, and SLO evidence. | Must | Observability smoke tests |
| NFR-PERF-001 | The first release shall use seeded deterministic load profiles for all five enterprise flows and set formal SLOs during NFR Requirements. | Must | NFR/performance stage |
| NFR-COMP-001 | OpenAPI, Avro, AsyncAPI, HTTP Pact, message-pact, and Schema Registry compatibility shall be executable and backward-compatible before integration readiness is claimed. | Must | Contract pipeline |
| NFR-OPS-001 | Operation phase shall produce deployment, provisioning, rollback, backup, disaster recovery, runbook, incident, performance, feedback, and optimization evidence. | Must | Operation gate |

## Constraints

- The old Shared Platform MVP intent shall not be reopened, overwritten, scope-changed, or reused for enterprise work.
- The enterprise scope shall not be reduced to Shared Platform only.
- Shared Platform, Charge, Booking, CMM, frontend, runtime, and operations shall remain explicit workstreams.
- Booking owns D&D trigger logic but shall not calculate D&D rates or free time.
- Charge owns D&D rules, free time, rates, and D&D calculation.
- CMM reports movement facts and status but shall not decide D&D relevance.
- First-release external integrations shall be local deterministic adapters with documented provider seams until all five internal flows pass locally.
- Raw Claude UI HTML and screenshots shall not be claimed as semantically Graphify-indexed exact source paths unless later Graphify evidence proves it.
- Completion shall not be claimed from documents, diagrams, skeleton APIs, mock screens, hardcoded business results, or containers merely starting.

## Assumptions

- The active enterprise parent intent remains the coordination spine through Application Design; Delivery Planning will decide whether to split coordinated child intents.
- Full customer hierarchy is deferred, but contract, spot, and manual-pricing customer paths are required.
- Schedule and capacity authority is fixture-backed through adapter interfaces for first release, with audited manual override where needed.
- Movement capture starts with UI/API manual capture and deterministic fixtures, while preserving future adapter seams.
- The Claude UI export is a UX baseline, not a business-rule authority.
- codebase-memory MCP is unavailable in the current session; Graphify and AI-DLC codekb remain the active indexed understanding layers.

## Out Of Scope

- Rebuilding correct Shared Platform MVP code unnecessarily.
- Production-like external finance, schedule, capacity, or movement-feed adapters before all five internal flows pass locally.
- Payment card processing and PCI scope unless explicitly introduced later.
- HIPAA/PHI scope unless explicitly introduced later.
- Cross-module SQL joins or direct database access across service ownership boundaries.
- Fake prototype business behavior copied from the Claude UI export.
- Public-cloud production dependency as a first-release runtime requirement.

## Open Questions

- Delivery Planning must decide whether the enterprise parent intent remains the only workflow record or whether module child intents are created.
- NFR Requirements must set formal SLOs, coverage gates, load profile volumes, and resilience thresholds.
- Application Design must decide exact API/event schemas, schema-subject naming, and database migration strategy.
- Refined Mockups must decide which Claude UI screens map to first walking-skeleton routes and which are deferred.
- Operation stages must define production promotion environments, rollback strategy, backup/DR details, and incident readiness targets.

## Traceability Matrix

| Source | Requirements informed |
|---|---|
| `intent-statement.md` | FR-E2E-001 through FR-E2E-005, FR-SP-001, FR-RUN-001, NFR-OPS-001 |
| `scope-document.md` | All module functional requirements, constraints, out-of-scope decisions |
| `business-overview.md` | Workstream classification and implementation-status assumptions |
| `architecture.md` | Service boundaries, missing Booking/CMM implementation, runtime topology |
| `code-structure.md` | Backend/frontend structure, missing modules, runtime/profile gaps |
| `team-practices.md` | Walking skeleton, testing posture, local runtime, Graphify-first practice |
| `requirements-analysis-questions.md` | External integration depth, schedule/capacity authority, customer model, D&D scope, movement strictness, UI conversion, runtime threshold, security depth, workstream structure, load baseline |

## Review

Verdict: READY

Product Lead review was completed inline after the declared reviewer subagent failed because its configured model is not supported for this Codex account. The artifact is business-aligned with the enterprise intent, preserves the MVP baseline, keeps module ownership boundaries explicit, translates the approved clarifying answers into testable requirements, and includes enough traceability for User Stories, Application Design, NFR Requirements, and Delivery Planning to proceed.

Findings:

- No blocking requirement gaps were found for this stage.
- Later stages must refine exact schema fields, API paths, SLO values, coverage thresholds, route-level UI behavior, and Bolt sequencing; those are correctly left as downstream design/planning decisions rather than hidden assumptions.
- The requirements intentionally defer production-like external adapters until internal enterprise flows pass locally, consistent with the approved answers and local-first scope.

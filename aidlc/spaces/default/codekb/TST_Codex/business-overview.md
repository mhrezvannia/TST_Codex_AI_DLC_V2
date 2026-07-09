# Business Overview - TST_Codex

## Reverse Engineering Context

This code knowledge base was refreshed for the LinerCore Enterprise AI-DLC intent `aidlc/spaces/default/intents/260708-linercore-enterprise`.

Inputs used:

- Graphify graph at `graphify-out/graph.json`, queried before codebase decisions.
- Current repository metadata and focused file reads.
- AI-DLC Ideation handoff artifacts under `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/`.

Subagent caveat: the requested `aidlc-developer-agent` reverse-engineering subagent could not run because `openai.gpt-5.5` is not supported for the current Codex account. The scan was completed inline with Graphify-first discovery. codebase-memory MCP resources were not exposed in this session.

## Business Domain

The repository implements the LinerCore carrier operating platform baseline. The current codebase is strongest in Shared Platform capabilities and has partial Charge/Agreement capability. It does not yet implement the full enterprise target described by the active intent.

Current business domains visible in code:

- Identity and authorization: internal authorization decisions, roles, role assignment, effective permissions, and audit repository seams.
- Reference data: reference sets and records for carrier master data, validation, change history, reference-data change events, and outbox publication seams.
- Charge and customer agreement: customer agreement lifecycle, charge terms, validity, status transitions, active agreement lookup, reference validation, and authorization seams.
- Frontend applications: auth, reference data workbench, and charge agreements UI.
- Local runtime: PostgreSQL, Keycloak, Kafka, Schema Registry, Spring services, Next apps, reverse proxy, and observability profile foundations.

Enterprise target domains not yet implemented as services:

- Customer Booking.
- Container Movement Management.
- Booking-owned D&D trigger workflow.
- Charge-owned pricing request/result and D&D request/result behavior beyond agreement and charge-term foundations.
- Complete enterprise UI across booking, movement, D&D outcomes, operations, and exceptions.

## Product Purpose

The codebase is a brownfield foundation for a production-grade LinerCore enterprise application. Its current business purpose is to provide platform foundations and early commercial agreement capability:

- establish identity and authorization controls;
- manage reference data and publish reference-data change events;
- manage customer agreements and charge terms;
- expose contract artifacts and local readiness tooling;
- run the MVP platform locally for development and verification.

The enterprise program must extend this foundation into a complete carrier workflow: booking creation and amendment, pricing orchestration, CMM journey/movement status, D&D trigger/calculation integration, full UI, local full-runtime, and Operation evidence.

## Implementation Status by Workstream

| Workstream | Current code status | Evidence |
|------------|---------------------|----------|
| Shared Platform | Brownfield implemented foundation | `identity-service`, `reference-data-service`, `apps/auth`, `apps/reference-data`, contracts, Compose profiles |
| Charge Calculation & Customer Agreement | Mixed partial implementation | `charge-agreement-service`, `apps/charge-agreements`, OpenAPI artifact; pricing and D&D contract behavior still missing |
| Customer Booking | Not implemented as service/app | No `booking-service` module or booking frontend app found |
| Container Movement Management | Not implemented as service/app | No CMM service module found |
| Enterprise UI | Partial | Auth, reference data, charge agreements apps exist; Claude UI export is design input only |
| Local runtime/Operation | Partial | Compose has infra, identity/reference-data apps, observability; no full enterprise profile or booking/CMM services |

## Business Capability Gaps

The repository cannot yet claim enterprise completion. Missing capabilities include:

- executable `booking.confirmed` producer and CMM consumer;
- executable `containermovement.status` producer and Booking consumer;
- executable pricing request/result and pricing D&D request/result APIs;
- Booking lifecycle, amendments, confirmation, manual pricing, exceptions, movement consumption, and D&D triggers;
- CMM journey creation, expected movement derivation, movement validation, dedupe, ordering, and status publication;
- D&D rule calculation engine and audit-ready D&D outcomes;
- full UI bound to real APIs, permissions, and events;
- Docker `full` enterprise runtime including all backend services and frontends;
- complete contract-test, E2E, performance, and Operation evidence.

## Business Interpretation for Inception

This is a mixed brownfield enterprise codebase:

- Brownfield for Shared Platform.
- Mixed for Charge/Agreement.
- Greenfield or not-yet-created for Booking and CMM.
- Mixed for frontend/runtime because some platform apps and Compose infrastructure exist but the full enterprise application does not.

Inception should use this classification when producing requirements, refined mockups, application design, units, and delivery planning.

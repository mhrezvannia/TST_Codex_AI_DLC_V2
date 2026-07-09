# Intent Statement - LinerCore Enterprise

## Problem Statement

LinerCore needs to move from a completed Shared Platform MVP and partial module implementation into a complete integrated production-grade enterprise application for container liner and feeder carriers. The business problem is the fragmented operating model across commercial pricing, customer agreements, booking capture/confirmation, container movement visibility, detention and demurrage charging, and operational exception handling.

The new enterprise program is not a restart of the historical Shared Platform MVP. It must preserve the completed MVP intent at `aidlc/spaces/default/intents/260630-shared-platform`, the `shared-platform-mvp-complete` Git tag, existing valid implementation, authoritative documents, and Graphify analysis while creating a new enterprise execution record.

## Target Customer

The target customer is a container liner or feeder carrier that needs one coherent operating platform for:

- commercial teams managing agreements, tariffs, charges, pricing, and manual fallbacks;
- booking teams creating, amending, validating, pricing, confirming, and monitoring bookings;
- equipment and operations teams managing container journeys, movements, exceptions, and status;
- platform administrators operating reference data, identity, contracts, local runtime, observability, security, and delivery pipelines.

The user-facing scope includes internal carrier staff first, with the Claude UI export used as the preferred visual and UX baseline. Prototype behavior must be replaced by real business behavior.

## Success Metrics

Success requires real implemented outcomes, not document-only or skeleton-only completion:

- End-to-end Flow 1: booking creation -> pricing -> agreement or tariff determination -> itemised charges -> operational validation -> confirmation -> `booking.confirmed`.
- End-to-end Flow 2: `booking.confirmed` -> CMM journey creation -> expected movement derivation.
- End-to-end Flow 3: movement capture -> DCSA-aligned validation -> status derivation -> `containermovement.status` -> Booking lifecycle update.
- End-to-end Flow 4: movement boundary detection -> `pricing.dnd-request` -> D&D free-time/rate calculation in Charge -> `pricing.dnd-result` -> Booking stores D&D charge.
- End-to-end Flow 5: booking amendment -> conditional repricing/revalidation -> reconfirmation -> `bookingRevision` increment -> CMM reconciliation.
- Full local runtime starts with `docker compose --profile full up -d --build`.
- Separate logical databases and service users exist for identity, reference data, pricing, booking, container movement, Keycloak, and infrastructure tools where required.
- All integrations use approved APIs or events; no service queries another service's domain database.
- Enterprise security, resilience, observability, CI/CD, operational runbooks, and full Operation-phase artifacts are completed.
- Tests include unit, integration, contract, end-to-end, performance, and operational validation as applicable.

## Initiative Trigger

Graphify preparation and enterprise gap analysis are complete enough to start a new enterprise AI-DLC program. The current graph is the primary codebase-understanding layer, with `graphify query`, `graphify explain`, and `graphify path` used before broad architecture decisions or cross-cutting edits. Codebase-memory MCP is secondary when available; in this session no MCP resources were exposed.

## Initial Scope Signal

Scope: `enterprise`.

Depth: Comprehensive.

Test strategy: Comprehensive.

The enterprise target explicitly includes:

- Shared Platform;
- Charge Calculation;
- Customer Agreement;
- Customer Booking;
- Detention & Demurrage;
- Container Movement Management;
- complete frontend applications;
- all synchronous and asynchronous integrations;
- local Docker runtime;
- Enterprise Operation.

This scope must not be reduced to Shared Platform only.

## Old MVP Preservation

| Item | Status |
|------|--------|
| Intent path | `aidlc/spaces/default/intents/260630-shared-platform` |
| Scope | MVP, Shared Platform only |
| Completion status | Completed: 21 of 21 in-scope stages, final stage `ci-pipeline` |
| Preservation status | Immutable historical baseline; not reopened, overwritten, scope-changed, or reused |
| Git tag | `shared-platform-mvp-complete` detected |

## New Enterprise Workflow Structure

| Item | Status |
|------|--------|
| Parent intent path | `aidlc/spaces/default/intents/260708-linercore-enterprise` |
| Scope | Enterprise, all 32 stages |
| Current stage | `intent-capture` |
| Next stage after approval | `market-research` |
| Coordination model | One enterprise parent intent now; module workstreams tracked explicitly and may become separate module intents if later stages require it |

## Module Workstreams and Classification

| Workstream | Classification | Rationale | First required AI-DLC stage |
|------------|----------------|-----------|-----------------------------|
| Shared Platform | Brownfield hardening | Existing MVP implementation and completed history exist; enterprise work must reuse valid functionality and harden identity, reference data, Kafka, contracts, security, observability, runtime, and operations. | Parent `intent-capture`; module detail begins in `scope-definition` and `requirements-analysis` unless split into a child intent. |
| Charge Calculation & Customer Agreement | Mixed | Graphify shows existing `charge-agreement-service` and agreement lifecycle code, but complete pricing, tariffs, D&D, resilience, integrations, and UI are not complete. | Parent `intent-capture`; child module intent would also start at `intent-capture` if spawned. |
| Customer Booking | Greenfield to mixed pending reverse engineering | No completed Booking service baseline was established in preparation; requirements and implementation must cover booking lifecycle, pricing orchestration, movement consumption, D&D triggers, exceptions, and UI. | Parent `intent-capture`; child module intent would start at `intent-capture` if spawned. |
| Container Movement Management | Greenfield to mixed pending reverse engineering | No completed CMM service baseline was established in preparation; implementation must cover `booking.confirmed` consumption, journey creation, movement validation/status, and `containermovement.status`. | Parent `intent-capture`; child module intent would start at `intent-capture` if spawned. |
| Full UI and local runtime | Mixed | `apps/reference-data` exists and Claude UI export exists; broader agreement, booking, CMM, D&D, exception, and runtime UX must be implemented against real APIs. | Parent `intent-capture`; detailed split in `rough-mockups`, `refined-mockups`, and `application-design`. |

## Authoritative Inputs Found

- `docs/program-vision-document.md`
- `docs/program-execution-plan.md`
- `docs/enterprise-technical-environment.md`
- `docs/shared-platform-module-vision.md`
- `docs/shared-platform-module-tech-env.md`
- `docs/enterprise-gap-summary.md`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`

## Contract Documents Detected

- `docs/enterprise-contracts/async-event-contract-booking-confirmed.md`
- `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md`
- `docs/enterprise-contracts/async-event-contract-containermovement-status.md`

These cover `booking.confirmed`, `containermovement.status`, `pricing.request`, `pricing.result`, `pricing.dnd-request`, and `pricing.dnd-result` at the enterprise contract level. They still need concrete OpenAPI, Avro, AsyncAPI, Schema Registry, Pact, and message-pact implementation in downstream stages.

## Claude UI Detected

`design-inputs/claude-ui-export/` is present and non-empty. It contains exported HTML, `support.js`, uploads, screenshots, and a thumbnail. Graphify currently represents `support.js` and uploaded markdown, but raw HTML and screenshots are not fully semantically indexed by exact source path. AI-DLC stages may use the export as a preferred UX baseline, with that caveat preserved.

## Missing Module Documents

The following module-specific documents were not found under `docs/` during this stage:

- Charge Calculation & Customer Agreement module vision document.
- Charge Calculation & Customer Agreement module technical environment document.
- Customer Booking module vision document.
- Customer Booking module technical environment document.
- Container Movement Management module vision document.
- Container Movement Management module technical environment document.
- Detention & Demurrage-specific module addendum, if D&D is separated from the Charge module in later governance.

The enterprise workflow can proceed because the Program Vision, Program Execution Plan, Enterprise Technical Environment, Shared Platform documents, and enterprise contracts define enough starting authority, but missing module documents must be resolved by Ideation/Inception artifacts before construction.

## Graphify and MCP Status

| Layer | Status |
|-------|--------|
| Graphify graph | Present and usable: 19,040 nodes, 19,564 links, 1,304 communities |
| Graphify report | Present at `graphify-out/GRAPH_REPORT.md` |
| Graphify limitation | Raw Claude UI HTML and screenshots are not fully semantically graph-indexed by exact source path |
| codebase-memory MCP | No MCP resources were exposed to this session; use if tools become available later |

## Program-Wide Delta Summary

The program delta from the historical MVP is substantial:

- Shared Platform moves from MVP completion to enterprise hardening and operation.
- Charge moves from partial agreement lifecycle toward complete pricing, tariffs, D&D ownership, fallback, auditability, resilience, and contract behavior.
- Booking must be built as the orchestration owner for booking lifecycle, pricing orchestration, movement consumption, D&D trigger logic, amendments, and exceptions.
- CMM must be built as the movement reporting owner, not the D&D relevance decision-maker.
- UI must expand from existing reference-data coverage to authenticated enterprise workflows for agreements, tariffs, pricing, bookings, amendments, manual pricing, container journeys, movements, D&D outcomes, and operational exceptions.
- Runtime must become a full local Windows-compatible Docker Compose environment with profiles, deterministic seed data, observability, contract-test support, health checks, and developer commands.
- Operation phase is in scope and must produce deployment, environment, observability, incident, performance, feedback, and optimization artifacts.

## Proposed Build Sequence

Follow the Program Execution Plan:

1. Preserve and harden Shared Platform foundation.
2. Freeze Shared Platform reference-data, identity, event envelope, and contract surfaces.
3. Complete Charge Calculation & Customer Agreement, including D&D rule ownership and pricing APIs.
4. Build Customer Booking against Shared Platform and Charge contracts.
5. Build Container Movement Management against `booking.confirmed` and publish `containermovement.status`.
6. Integrate flows M0-M4 and validate all five end-to-end business flows.
7. Complete local runtime, CI/CD, observability, resilience, and Operation-phase readiness.

## Approval Gate Basis

Approving this stage means accepting the new enterprise intent-capture baseline:

- historical MVP preserved;
- enterprise scope confirmed;
- parent enterprise path established;
- module workstreams identified;
- classifications recorded;
- authoritative documents and missing documents listed;
- Graphify and MCP status recorded;
- first stage and proposed sequence set for the enterprise lifecycle.

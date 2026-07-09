# Initiative Brief - LinerCore Enterprise

## Source Context

This initiative brief consumes:

- `intent-statement`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `scope-document`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/scope-document.md`
- `intent-backlog`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/intent-backlog.md`
- `competitive-analysis`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/competitive-analysis.md`
- `feasibility-assessment`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/feasibility-assessment.md`
- `constraint-register`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/constraint-register.md`
- `team-assessment`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/team-formation/team-assessment.md`
- `wireframes`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/rough-mockups/wireframes.md`

Graphify was queried during this stage for approval-handoff consistency. It continues to show a usable graph with Shared Platform and partial Charge/Agreement implementation visible, and reinforces the need for Graphify-first reverse engineering before broad Inception or construction decisions.

## Executive Summary

LinerCore Enterprise is ready to leave Ideation and enter Inception, with conditions. The initiative is a complete integrated production-grade carrier operating platform spanning Shared Platform, Charge Calculation, Customer Agreement, Customer Booking, Detention & Demurrage, Container Movement Management, enterprise UI, integrations, local runtime, and Enterprise Operation.

This is not a restart of the completed Shared Platform MVP. The historical MVP record at `aidlc/spaces/default/intents/260630-shared-platform` and tag `shared-platform-mvp-complete` remain immutable traceability anchors. The active enterprise record is `aidlc/spaces/default/intents/260708-linercore-enterprise`.

Recommendation: GO to Inception for reverse engineering, requirements analysis, refined UX, application design, units generation, and delivery planning. Do not start construction from the Ideation package alone.

## Problem and Intent

The problem is a fragmented carrier operating model across commercial pricing, agreements, booking, movement visibility, D&D charging, exception handling, local runtime, and operations. The intent-statement frames the target as a complete enterprise application, not a Shared Platform-only expansion.

The customer is a container liner or feeder carrier with internal users across commercial, booking, operations, platform administration, quality, security, and support. Success requires real implementation evidence across APIs, events, persistence, frontend workflows, authentication, authorization, tests, contract tests, local Docker runtime, observability, and operational artifacts.

## Market and Investment Rationale

The competitive-analysis supports a build-first approach for carrier-owned core domain logic:

- Booking networks, TMS suites, visibility tools, and D&D products cover parts of the problem, but rarely provide carrier-owned agreement/pricing, booking orchestration, CMM movement truth, and D&D calculation as one bounded, auditable enterprise system.
- DCSA standardization and market demand for visibility and D&D cost control support investment.
- Commodity or network-heavy capabilities should be integrated or bought where they are not core differentiation.

Investment rationale: build LinerCore's core domains and contracts; adopt or integrate commodity infrastructure and external network/data feed capabilities later where needed.

## Scope Boundary

In scope:

- Shared Platform enterprise hardening.
- Charge Calculation and Customer Agreement.
- D&D rule ownership and calculation inside Charge.
- Customer Booking lifecycle, pricing orchestration, amendments, D&D trigger logic, movement consumption, exceptions, and audit.
- Container Movement Management journey creation, movement capture, validation, status derivation, and `containermovement.status`.
- Contracts: `booking.confirmed`, pricing request/result, D&D request/result, and `containermovement.status`.
- Full enterprise UI using the Claude export as preferred visual baseline.
- Full local Docker runtime and developer experience.
- Enterprise security, resilience, observability, CI/CD, infrastructure, and Operation.

Out of scope:

- Reopening or reusing the historical MVP intent.
- Cross-module SQL joins or direct database access across module boundaries.
- Collapsing domains into one service.
- Generic carrier network marketplace scope.
- SaaS-only runtime.
- Fake placeholder APIs or mock-only screens called complete.

## Feasibility and Risk Highlights

The feasibility-assessment says the program is feasible only as staged, contract-driven enterprise delivery. It is not feasible as a single unsequenced implementation pass.

Primary risks:

| Risk | Severity | Handoff treatment |
|------|----------|-------------------|
| Scope size and integration complexity | High | Use workstreams, contract freeze, unit decomposition, and integration milestones. |
| Booking and CMM greenfield or unknown effort | High | Start Inception with Graphify-first reverse engineering and brownfield classification. |
| D&D correctness and dispute risk | High | Require rule fixtures, boundary tests, chargeable-day tests, audit trail, and manual fallback. |
| Local runtime complexity | High | Keep `docker compose --profile full up -d --build` as a hard release gate. |
| Raw Claude UI over-trust | Medium | Normalize UI requirements; preserve design while replacing prototype logic. |
| Contract testing delayed | High | Freeze executable OpenAPI/Avro/AsyncAPI/Pact/message-pact before integration claims. |

## Constraints

The constraint-register defines the operating guardrails for Inception:

- Preserve module boundaries.
- Preserve the old MVP baseline.
- Use APIs and events for all integration.
- Use separate logical PostgreSQL databases/users for service ownership.
- Use Graphify query/explain/path before broad architecture decisions.
- Treat codebase-memory MCP as secondary when available; no MCP resources were exposed in the current session.
- Preserve Claude UI visual direction but do not copy fake prototype logic.
- Keep local runtime and Operation in scope.

Open constraints carried forward:

- External finance API depth.
- Vessel schedule/capacity source.
- Trade/regulatory footprint and data residency.
- Customer type expansion.
- Whether to spawn child module intents or keep module work under the parent as units.

## Team and Workstream Plan

The team-assessment recommends stream-aligned module mobs with platform and enabling support:

| Workstream | Classification | Delivery shape |
|------------|----------------|----------------|
| Shared Platform | Brownfield hardening | Platform team, reuse valid MVP functionality and harden identity/reference/events/runtime. |
| Charge Calculation & Customer Agreement | Mixed | Stream-aligned commercial team, extend existing partial code. |
| Customer Booking | Greenfield to mixed pending reverse engineering | Stream-aligned booking team, Graphify-first analysis before construction. |
| Container Movement Management | Greenfield to mixed pending reverse engineering | Stream-aligned movement team, DCSA/domain specialist support. |
| Enterprise UI | Mixed | Cross-module frontend stream with UX and module API collaboration. |
| Runtime and Operation | Cross-cutting | Platform, DevSecOps, quality, operations enabling team. |

Named staff and allocation are not yet confirmed. Delivery Planning must resolve staffing, availability, Bolt ownership, and child-intent versus parent-units strategy.

## Concept and UX Direction

The wireframes define an operational console, not a marketing experience. The preferred direction is:

- compact module rail;
- top search/context bar;
- contextual journey ribbon;
- dense module workspace;
- right-side status/action rail;
- explicit module ownership and audit evidence.

The UI must support authentication, reference data, agreements, tariffs, pricing, bookings, amendments, manual pricing, container journeys, movements, D&D outcomes, exceptions, runtime health, and observability.

The Claude UI export is an input for visual quality and layout, but raw HTML/screenshots are not fully semantically Graphify-indexed by exact path. Inception should normalize UI requirements before refined mockups and implementation.

## Proposed Inception Sequence

1. Reverse Engineering: use Graphify first, then codebase-memory MCP if available, then focused file reads. Confirm brownfield/mixed/greenfield boundaries.
2. Practices Discovery: validate repo practices, local runtime constraints, CI posture, testing posture, and existing architecture conventions.
3. Requirements Analysis: convert Ideation scope into testable requirements across all workstreams.
4. User Stories: create vertical stories for all five business flows and core admin/operation workflows.
5. Refined Mockups: refine the Claude export into implementation-ready UX mapped to real APIs, roles, states, and permissions.
6. Application Design: design bounded contexts, APIs, events, persistence, security, resilience, observability, and runtime.
7. Units Generation: decompose work into traceable units across workstreams.
8. Delivery Planning: decide parent-only units versus child module intents, sequence Bolts, assign mobs, and define gates.

## Go/No-Go Recommendation

Recommendation: GO to Inception.

Approval means:

- Ideation is complete enough to proceed.
- The enterprise scope remains complete and is not reduced to Shared Platform.
- The historical MVP remains immutable.
- Inception must not start code implementation before reverse engineering, requirements, refined UX, application design, units, and delivery planning are complete.
- Construction completion remains evidence-based, not document-based.

Go conditions:

- Preserve Graphify-first discovery.
- Keep contracts and local runtime as hard gates.
- Keep Operation in scope.
- Carry open risks into Inception artifacts instead of resolving them by assumption.

No-go triggers:

- Sponsor rejects complete enterprise scope.
- Team/resource commitment cannot support a staged multi-workstream program.
- Local runtime or Operation scope is removed.
- Module boundaries or data ownership rules are rejected.

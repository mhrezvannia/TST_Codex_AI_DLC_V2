# Initiative Brief - W1-01 Booking Quote-to-Cash

## Executive Decision

**Recommendation: GO to Inception.** Build one contract-true, live-observed booking quote-to-cash walking skeleton on the existing LinerCore architecture. A booking-desk agent creates one direct-leg, dry-FCL, quantity-one, USD booking; validates canonical references; obtains and persists a live Charge quote; confirms atomically; observes CMM create one journey from real Kafka; receives movement status back into Booking; and sees the complete state on a stable Booking detail route.

This brief consolidates `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`, `ideation/market-research/competitive-analysis.md`, `ideation/feasibility/feasibility-assessment.md`, `ideation/feasibility/constraint-register.md`, `ideation/team-formation/team-assessment.md`, and `ideation/rough-mockups/wireframes.md`.

## Problem And Value

The current Booking model and UI are too flat to represent contract-true routing/equipment, event delivery still contains synchronous shortcuts, consumers are absent, and the Booking frontend lacks real routes/data files. This prevents one reliable commercial record from flowing from customer request through price, confirmation, CMM journey, and movement feedback without re-keying.

W1-01 creates the thin commercial spine that later amendment, broader track-and-trace, D&D, invoicing, multi-leg, and special-cargo intents can extend. Value is observed in one user journey, not inferred from endpoint or schema existence.

## Evidence And Investment Rationale

- Mature liner/TMS alternatives establish routing, voyage, equipment, pricing, and status visibility as operational table stakes.
- Buying a full suite is a program-level migration and operating-model decision with unknown cost and fit; it is not evidence that W1 would close faster.
- The selected approach builds carrier-specific Booking/Charge/CMM behavior while adopting W0 Kafka/outbox/Schema Registry infrastructure, canonical reference services, DCSA vocabulary, and standard libraries.
- Explicit bounded-context contracts keep future vendor integration or procurement reversible.
- No unsupported market-size, financial budget, headcount, velocity, or completion-date claim is part of the approval.

## Release Boundary

### Must deliver

1. Contract-true Booking identity, routing, equipment, and compatible existing-record migration.
2. Booking-local list, create, and stable detail routes with real server data and required UI states.
3. Live canonical Reference Data validation and live Charge quote persistence.
4. Exact `booking.confirmed` publication and idempotent CMM journey consumption.
5. Exact `containermovement.status` publication and atomic Booking dedupe/projection.
6. Kafka-only event delivery, restart/redelivery safety, browser proof, automated suites, both audits, and `artifacts/w1-01-live/` evidence.

### Explicitly deferred

Global shell/auth (W2-01), package-wide design-system migration (W2-02), tariff breadth (W2-03), broad T&T/EDI/OHS (W2-04/P2), D&D and invoices (W3-01/W3-02), amendments (W3-03), multi-leg routing, and reefer/DG detail.

## Delivery Sequence

| Order | Proto-Unit | Confidence gained |
|---:|---|---|
| 1 | Contract-true create/read and compatible migration | One stable record crosses domain, data, API, and real list/detail UI |
| 2 | Live canonical validation | No hidden fixture/reference gap blocks the journey |
| 3 | Live Charge quote | Commercial value is real and persisted |
| 4 | Transactional confirmation to CMM | Exact Kafka path creates one journey independent of request-path CMM availability |
| 5 | CMM status return to Booking detail | Atomic projection/dedupe produces browser-visible movement truth |
| 6 | Kafka-only resilient live closure | HTTP callbacks are removed and restart/redelivery plus all gates are green |

The order is walking-skeleton and risk-first. Both consumers are proven before synchronous callbacks are removed; UI evolves with each increment rather than in a final horizontal batch.

## Concept Direction

The approved `wireframes.md` defines Booking list, dedicated create, and stable detail routes. It inherits W2-02's operational-console visual language only: neutral work surfaces, restrained navy anchors, semantic status colors, IBM Plex typography, compact radii, lifecycle visibility, and a wide-screen pricing rail. It reuses `@erp/ui`, supports responsive reflow and WCAG 2.1 AA, and excludes W2 shell/auth/package-wide migration scope and unsupported fake capacity or D&D behavior.

## Feasibility And Blocking Risks

**Feasible with controlled high-risk migrations.** Existing service boundaries, PostgreSQL repositories, transactional producer outboxes, live Charge seam, W0 relay, Schema Registry, and Compose topology are usable foundations.

| Blocking risk | Required mitigation / evidence |
|---|---|
| Flat JSON snapshots/indexes break after typed model | Legacy fixture plus deterministic migration/upcaster; no destructive reset |
| Domain/wire/UI contract drift | Authoritative `.avsc`, explicit mappings, serde/contract/fidelity tests |
| Consumers acknowledge before local commit | Transactional application methods and forced rollback/redelivery tests |
| HTTP plus Kafka becomes permanent dual delivery | Prove both consumers, remove callback calls/config, source detector |
| Booking projection and dedupe diverge | One transaction keyed by envelope ID; duplicate/stale tests |
| Incomplete Booking frontend baseline | Restore page/BFF/test tree in PU-01 and keep real data only |
| Docker/runtime failure hides integration defects | Canonical Compose with non-default PostgreSQL host port; real topics/schema/DB/browser evidence |

Stop and escalate if compatible migration, atomic consumption, frozen-contract fidelity, or real Compose proof cannot be achieved.

## Team And Governance

- User: stakeholder, scope, gate, and merge approval owner.
- Codex: implementation driver in the dedicated W1 worktree.
- Booking: accountable journey owner.
- Charge, CMM, Shared Platform, UI, quality, and live-proof: explicit review hats at owned seams.
- One active intent at a time; tests, migration, review, live proof, and evidence are planned work.
- Cross-service contract changes require producer and consumer review; shared infrastructure remains Platform-owned.

## Exit And Handoff

Inception must turn this brief into traced requirements, stories, refined interaction specifications, application design, vertical Units, and a delivery plan without widening scope. W1 closes only after the live Compose journey, restart/redelivery, browser verification, tests, `aidlc-audit`, and `erp-fidelity-audit` are green and evidence is committed.

**Decision requested:** approve Ideation and proceed to Inception under these constraints.

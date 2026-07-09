# Intent Backlog - LinerCore Enterprise

## Source Context

This backlog consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/feasibility-assessment.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/constraint-register.md`

Prioritization uses MoSCoW plus a delivery sequence that is dependency-first and risk-first.

## Prioritization Summary

Must Have items define the complete enterprise release boundary. Should Have items are important but may be scheduled after the first complete release if they do not block required flows. Could Have items are explicit enhancements. Won't Have items prevent scope creep.

## Must Have Backlog

| ID | Item | Workstream | Priority | Dependencies | Outcome |
|----|------|------------|----------|--------------|---------|
| M-001 | Preserve historical MVP baseline and establish enterprise traceability | Program | Must | None | Old MVP path/tag preserved; new enterprise record owns all new work |
| M-002 | Reverse-engineer current codebase with Graphify-first baseline | Program/Architecture | Must | M-001 | Brownfield code boundaries and reusable assets are mapped |
| M-003 | Harden Shared Platform reference-data service | Shared Platform | Must | M-002 | Canonical references remain single-owned and production-ready |
| M-004 | Harden identity, Keycloak, authn/authz, capability model | Shared Platform | Must | M-002 | Users/services have enforceable permissions |
| M-005 | Implement Kafka, Schema Registry, event envelope, transactional outbox foundation | Shared Platform | Must | M-002 | Async contracts have reliable transport and compatibility checks |
| M-006 | Freeze enterprise contracts | Program/Integration | Must | M-003, M-004, M-005 | OpenAPI/Avro/AsyncAPI/Pact/message-pact are executable |
| M-007 | Complete agreements, tariffs, charge terms, validity, applicability | Charge/Agreement | Must | M-003, M-004, M-006 | Commercial agreement source of truth exists |
| M-008 | Complete pricing request/result APIs | Charge/Agreement | Must | M-007 | Booking can request itemised pricing |
| M-009 | Complete D&D rules and calculation | Charge/D&D | Must | M-007 | Import demurrage, import detention, export detention are calculable |
| M-010 | Build Booking lifecycle core | Booking | Must | M-003, M-004, M-008 | Bookings can be created, amended, validated, confirmed |
| M-011 | Implement Booking pricing orchestration and manual pricing fallback | Booking | Must | M-008 | Booking stores pricing results and handles exceptions |
| M-012 | Publish `booking.confirmed` | Booking/Integration | Must | M-010, M-006 | CMM receives confirmed bookings |
| M-013 | Build CMM journey creation and expected movement derivation | CMM | Must | M-012 | Confirmed bookings create equipment journeys |
| M-014 | Implement movement capture and DCSA-aligned validation | CMM | Must | M-013 | Planned/estimated/actual movements are recorded correctly |
| M-015 | Publish `containermovement.status` | CMM/Integration | Must | M-014, M-006 | Booking receives movement status updates |
| M-016 | Implement Booking movement consumption and lifecycle updates | Booking | Must | M-015 | Booking reflects operational movement state |
| M-017 | Implement D&D trigger logic in Booking | Booking/D&D | Must | M-016, M-009 | Booking detects D&D boundaries without calculating rates |
| M-018 | Implement D&D request/result integration and storage | Booking/Charge | Must | M-017, M-009, M-006 | D&D charges are calculated by Charge and stored by Booking |
| M-019 | Build complete enterprise UI mapped to real APIs/permissions | Frontend | Must | M-003 through M-018 | Users can operate reference data, agreements, booking, movements, D&D, exceptions |
| M-020 | Implement full local Docker runtime and dev profiles | Runtime | Must | M-003 through M-019 | `docker compose --profile full up -d --build` works locally |
| M-021 | Add deterministic seed data and developer commands | Runtime/DevEx | Must | M-020 | First-time setup, reset, logs, health, migrations, tests are documented |
| M-022 | Implement observability, security evidence, CI/CD, and Operation artifacts | Operation | Must | M-020 | Enterprise Operation is demonstrable and auditable |
| M-023 | Validate all five end-to-end business flows | Program/Quality | Must | M-006 through M-022 | Complete business behavior is proven |

## Should Have Backlog

| ID | Item | Workstream | Priority | Dependencies | Outcome |
|----|------|------------|----------|--------------|---------|
| S-001 | Normalize Claude UI HTML/screenshots into design requirements | Frontend/Design | Should | M-001 | UI baseline becomes graph- and artifact-friendly |
| S-002 | External finance adapter contract prototype | Integration | Should | M-008, M-018 | Finance seam is ready for later production integration |
| S-003 | Visibility/feed partner adapter stubs | CMM/Integration | Should | M-014 | External movement data can be simulated and later integrated |
| S-004 | Advanced operational exception dashboards | Frontend/Operation | Should | M-016, M-019 | Operational teams get stronger triage views |
| S-005 | Performance baseline and load fixtures beyond critical paths | Quality | Should | M-023 | Capacity assumptions are measurable |

## Could Have Backlog

| ID | Item | Workstream | Priority | Dependencies | Outcome |
|----|------|------------|----------|--------------|---------|
| C-001 | Additional carrier network integrations | Integration | Could | M-023 | Wider external ecosystem reach |
| C-002 | Advanced predictive ETA/exception enrichment | CMM | Could | M-014 | More proactive movement management |
| C-003 | Expanded analytics beyond operational dashboards | Frontend/BI | Could | M-023 | Management reporting improvements |
| C-004 | Full customer-facing self-service portal | Frontend | Could | M-023 | External user expansion |

## Won't Have This Release

| ID | Item | Reason |
|----|------|--------|
| W-001 | Reopening the old Shared Platform MVP intent | Historical baseline must remain immutable |
| W-002 | Cross-module shared database or joins | Violates enterprise architecture |
| W-003 | Generic global ocean booking marketplace/network | Network-heavy scope is partner/integration candidate |
| W-004 | SaaS-only core runtime | Local/on-prem runtime is mandatory |
| W-005 | Payment-card processing | Not in current business target |
| W-006 | HIPAA/PHI workflows | Not in current business target |
| W-007 | Fake placeholder APIs or mock-only UI called complete | Violates completion criteria |

## Value Stream Map

1. Platform foundation: identity, reference data, event bus, contracts.
2. Commercial truth: agreements, tariffs, pricing, D&D rules.
3. Booking orchestration: create/amend/price/validate/confirm.
4. Movement truth: confirmed booking to journey, movement capture, status publication.
5. D&D closure: movement boundary detection, Charge calculation, Booking charge storage.
6. User operation: authenticated UI across reference data, agreements, booking, movements, D&D, exceptions.
7. Enterprise readiness: local runtime, seeds, tests, observability, CI/CD, runbooks, incident/performance readiness.

## Proposed Build Sequence

| Sequence | Focus | Backlog IDs | Rationale |
|----------|-------|-------------|-----------|
| 1 | Baseline and reverse engineering | M-001, M-002 | Protect history and map brownfield code before edits |
| 2 | Shared Platform and contracts | M-003 to M-006 | Unblocks every downstream module |
| 3 | Charge/Agreement and D&D base | M-007 to M-009 | Creates pricing authority |
| 4 | Booking core and pricing orchestration | M-010 to M-012 | Creates booking source of truth and confirmation event |
| 5 | CMM journey/movement/status | M-013 to M-015 | Creates movement truth and status event |
| 6 | Booking movement and D&D integration | M-016 to M-018 | Completes operational-to-commercial loop |
| 7 | Full UI and runtime | M-019 to M-021 | Makes the system usable and locally runnable |
| 8 | Operation and E2E validation | M-022, M-023 | Proves enterprise readiness |

## Dependency Notes

- Booking must not start real integration against Charge until pricing contracts and active agreement lookup are verified.
- CMM must not start real journey integration until `booking.confirmed` is frozen and testable.
- Booking D&D trigger logic depends on CMM movement status and Charge D&D rules.
- Full UI should be incrementally wired but cannot be called complete until real APIs and permissions exist.
- Operation artifacts should start early but complete after runtime and E2E behavior are demonstrable.

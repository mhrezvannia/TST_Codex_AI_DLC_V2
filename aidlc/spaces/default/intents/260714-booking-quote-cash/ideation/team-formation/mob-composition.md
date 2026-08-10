# Mob Composition - W1-01 Booking Quote-to-Cash

## Source And Topology

This plan assigns the scope in `ideation/scope-definition/scope-document.md` and the proto-Units in `ideation/scope-definition/intent-backlog.md`, with risk controls from `ideation/feasibility/feasibility-assessment.md`.

Topology: one stream-aligned W1-01 mob owns the booking quote-to-cash journey. Booking is the driver boundary. Charge, CMM, Shared Platform, UI, quality, and live-proof are rotating navigator/reviewer hats invoked at their seams. W0 shared eventing is consumed X-as-a-Service; it is not recreated inside each service.

## Roles

| Role | Accountabilities | Engagement |
|---|---|---|
| Stakeholder / approval owner | Scope decisions, AI-DLC gates, exceptions, merge authorization | User at explicit gates |
| Implementation driver | Discovery, design, code, tests, evidence, branch hygiene | Codex throughout W1-01 |
| Booking journey owner | End-to-end record, domain/API/persistence/UI coherence, delivery sequence | All proto-Units |
| Charge navigator | Pricing request/result semantics, provider compatibility | PU-03 and affected regressions |
| CMM navigator | Confirmation consumption, journey reconciliation, status production | PU-04-PU-06 |
| Shared Platform navigator | Reuse of publisher/relay/Schema Registry patterns | PU-04-PU-06 when platform seams are touched |
| UI navigator | Booking list/detail interaction and state coverage | PU-01-PU-05 |
| Quality navigator | Test design, contract trace, failure injection, detector evidence | Every proto-Unit |
| Live-proof navigator | Compose preflight, broker/schema/database/browser evidence | Integration checkpoints and PU-06 |

Roles are logical responsibilities, not separate named personnel. Codex may perform multiple hats but must keep their review criteria explicit in artifacts, tests, and completion evidence.

## Proto-Unit Mob Assignments

| Proto-Unit | Driver | Primary navigators | Required checkpoint |
|---|---|---|---|
| PU-01 Contract-true create/read | Booking | Data, UI, quality | Legacy records readable; green create/list/detail baseline |
| PU-02 Live validation | Booking | Reference Data contract, UI, quality | Live canonical accept/reject behavior |
| PU-03 Live Charge quote | Booking | Charge, data, UI, quality | Frozen bilateral behavior and persisted quote |
| PU-04 Confirmation to CMM | Booking | CMM, Shared Platform, data, quality, live proof | Exact event, atomic outbox, idempotent journey, no request dependency on CMM |
| PU-05 Status return | Booking | CMM, Shared Platform, UI, data, quality, live proof | Atomic projection/dedupe and browser-visible status |
| PU-06 Kafka-only closure | Booking | All hats | HTTP callbacks removed; restart/redelivery and all gates green |

## RACI Matrix

Legend: A = accountable, R = responsible, C = consulted, I = informed.

| Decision / deliverable | User | Codex | Booking | Charge | CMM | Platform | UI | Quality/live proof |
|---|---|---|---|---|---|---|---|---|
| Scope and release boundary | A | R | C | I | I | I | C | C |
| Booking domain/API/persistence | I | R | A | I | C | I | C | C |
| Pricing contract mapping | I | R | A | C | I | I | C | C |
| `booking.confirmed` contract | I | R | A | I | C | C | I | C |
| `containermovement.status` contract | I | R | C | I | A | C | C | C |
| Shared messaging behavior | I | R | C | I | C | A | I | C |
| Booking UI behavior | I | R | A | I | C | I | C | C |
| Tests and live evidence | I | R | C | C | C | C | C | A |
| AI-DLC gate approval and merge | A | R | C | C | C | C | C | C |

## Decision And Escalation Rules

- The user is final decision-maker for scope, quality exceptions, phase gates, and merge.
- Booking drives implementation but cannot unilaterally alter frozen cross-service contracts.
- Producer and consumer hats jointly review any event-contract interpretation; Charge reviews bilateral pricing changes; Shared Platform reviews shared-infrastructure changes.
- Contract, migration, transactionality, or live-runtime blockers are escalated with executable evidence and options.
- Codex does not infer silent approval from an earlier gate when a later design changes the agreed scope or contract.

## Capacity Allocation Agreement

1. One proto-Unit is active at a time unless the dependency DAG explicitly permits isolated research.
2. Tests, migration fixtures, contract review, frontend verification, and evidence collection are included in each unit's capacity.
3. Should/Could polish starts only after the active unit's Must evidence is green.
4. Competing intent implementation remains paused until a clean W1 checkpoint or explicit user reprioritization.
5. No fixed hours, velocity, sprint count, or completion date is promised without availability data.

## Team API

- **Owns:** W1-01 journey changes on `intent/W1-01-booking-quote-to-cash`, associated tests, and `artifacts/w1-01-live/` evidence.
- **Consumes:** frozen HTTP/event contracts, W0 shared messaging APIs, W0-02 canonical references, and repository quality gates.
- **Provides:** contract-reviewed changes, green automated tests, reproducible Compose commands, machine-readable evidence, and gate summaries.
- **Needs:** explicit user decisions at AI-DLC gates, available local Docker resources, and producer/consumer review when contract interpretation changes.
- **Communicates through:** AI-DLC artifacts/audit, code/tests, branch history, and final evidence paths.

## Working Checklist

- Start each proto-Unit from its dependency and relevant constraint/RAID entries.
- Keep driver and navigator criteria visible in the unit plan and tests.
- Run focused tests during implementation and broader suites at ownership boundaries.
- Record exact service/topic/schema/database/browser observations at live checkpoints.
- Stop before merge when any critical issue lacks evidence or either audit is not green.

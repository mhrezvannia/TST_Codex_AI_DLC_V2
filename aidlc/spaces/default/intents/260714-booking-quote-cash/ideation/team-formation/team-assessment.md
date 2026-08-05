# Team Assessment - W1-01 Booking Quote-to-Cash

## Source And Operating Model

This assessment implements the release boundary in `ideation/scope-definition/scope-document.md`, the six proto-Units in `ideation/scope-definition/intent-backlog.md`, and the delivery risks in `ideation/feasibility/feasibility-assessment.md`.

W1-01 is executed as one stream-aligned, AI-assisted delivery mob. The user is the stakeholder and approval owner. Codex is the implementation driver in the dedicated W1 worktree. Booking owns the journey and coordinates explicit Charge, CMM, Shared Platform, UI, quality, and live-proof review roles. These are responsibility hats grounded in repository boundaries, not claims that named human staff are available.

## Availability And Capacity

| Participant / role | Availability assumption | Allocation | Constraint |
|---|---|---|---|
| User / stakeholder | Available at AI-DLC decision and approval gates | Gate decisions and scope/contract escalation | No daily-hours or calendar capacity supplied |
| Codex / implementation driver | Active in the W1-01 worktree for this intent | Primary analysis, implementation, test, evidence, and documentation work | One active delivery stream; must surface blockers rather than invent staff or dates |
| Booking driver role | Represented by W1 implementation ownership | Accountable across all six proto-Units | Cannot unilaterally change producer/consumer contracts |
| Charge reviewer role | Engaged when PU-03 changes pricing mappings or provider behavior | Focused review, tests, and contract fidelity | No broad tariff/agreement scope |
| CMM reviewer role | Engaged for PU-04 and PU-05 event/journey behavior | Focused review, tests, and contract fidelity | No broad T&T scope |
| Shared Platform reviewer role | Engaged only when shared messaging behavior is touched | Guard reuse of W0 infrastructure | Shared producer infrastructure must not be reinvented |
| UI and quality roles | Engaged in every increment with browser-visible or verification impact | Frontend states, test strategy, audit and evidence review | UI cannot be deferred to a final horizontal batch |

No fixed date, velocity, utilization percentage, or parallel-team throughput is asserted. The capacity agreement is to keep W1-01 as the active delivery intent until a safe checkpoint, while treating test, live Compose, and audit work as planned capacity rather than optional cleanup.

## Work Volume And Cognitive Load

The intent touches three service domains, a shared messaging platform, PostgreSQL migration behavior, two authoritative event contracts, synchronous service clients, Docker Compose, and a Booking frontend. This exceeds a simple solo component change, but the one-record thin slice and closed W0 prerequisites keep it suitable for one coordinated mob.

Primary cognitive-load controls:

- follow one booking record through six ordered proto-Units rather than parallel horizontal workstreams;
- reuse the W0 publisher/relay/Schema Registry platform as an existing service;
- hold contract and migration decisions in explicit artifacts and tests;
- use focused specialist review hats at ownership boundaries;
- preserve a small fixture: one leg, one dry FCL line, quantity one, USD, one revision, one journey.

## Competing Work And Location

- No competing active implementation intent is planned in parallel with W1-01.
- The work is coordinated through the branch/worktree and AI-DLC record, not synchronous multi-person ceremonies.
- The authoritative runtime is local Docker Compose in the user's Asia/Tehran environment, with PostgreSQL exposed on a non-default host port.
- No contractor, external partner, or AWS Professional Services dependency is required for local closure.
- A later production deployment can trigger a new staffing and cloud-readiness assessment; it is not inferred here.

## Gap Remediation

| Gap / uncertainty | Treatment | Escalation condition |
|---|---|---|
| Latest brownfield code relationships may be absent from the graph | Use graph-first discovery, verify against source, and refresh graph after major code changes | Source and graph disagree on a release-blocking ownership seam |
| Existing Booking snapshots may not deserialize after model migration | Build a legacy fixture/upcaster or deterministic migration before model cutover | Existing records cannot be preserved deterministically |
| Kafka consumer pattern is absent | Research official Spring Kafka/Confluent APIs and adapt shared repository infrastructure; add rollback/redelivery tests | Consumer cannot commit local state before acknowledgement |
| Frontend baseline is incomplete | Restore the minimum page/BFF/test tree in PU-01 and keep it green through later units | Missing package infrastructure requires unrelated shell/auth scope |
| Live-runtime evidence is environment-sensitive | Preflight Docker disk/images/ports, reuse W0 evidence method, and capture exact commands/results | Real Kafka, Schema Registry, or PostgreSQL cannot run after documented retries |

## Onboarding Checklist

- Read the intent Context Pack and frozen Booking-Charge and async event contracts.
- Read W0-01/W0-02 live evidence and the shared messaging module before changing eventing code.
- Confirm branch/worktree and a clean baseline; preserve unrelated user changes.
- Run current backend/frontend tests before the first implementation edit.
- Inspect the legacy Booking snapshot schema and prepare a migration fixture.
- Use the authoritative `.avsc` field names in domain-to-wire mapping tests.
- Keep the non-default PostgreSQL host port in all local proof commands.
- Link each critical RAID closure to `artifacts/w1-01-live/` before requesting merge.

## Assessment

The confirmed user-plus-Codex model is sufficient for W1-01 when responsibilities remain explicit and work stays sequential. The principal risk is not missing headcount; it is cross-domain cognitive load and contract drift. The stream-aligned mob, focused ownership reviews, and risk-first proto-Unit order address that risk without fabricating organizational capacity.

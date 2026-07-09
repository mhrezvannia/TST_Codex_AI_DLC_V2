# Bolt Plan - LinerCore Enterprise

## Source Context

This plan consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. It uses the accepted answers in `delivery-planning-questions.md`.

Graphify was used before planning. `py -3.11 -m graphify update .` refreshed the code graph, but Graphify reported that document/image changes require assistant-side `/graphify --update` and a Gemini key for semantic extraction. Newly generated unit artifacts are therefore treated as focused file-read inputs, not as semantically graph-indexed facts.

## Planning Stance

Sequencing heuristic:

- Bolt 1 is walking-skeleton-first, per `team-practices.md`.
- Remaining Bolts use risk-first WSJF-style sequencing.
- The unit DAG in `unit-of-work-dependency.md` constrains dependencies; this plan may bundle dependent units in the same Bolt when the confidence hypothesis requires an integrated proof.

Gate stance:

- Bolt 1 must be gated as the enterprise walking skeleton.
- After Bolt 1 approval, AI-DLC must ask the standard Construction autonomy ladder before remaining Bolts run gated or autonomous.
- Parallel batches are allowed only where `unit-of-work-dependency.md` permits and after the autonomy ladder allows them.

## Bolt Sequence

| Bolt | Name | Units or slices | Walking skeleton | Primary mob |
|---|---|---|---|---|
| B01 | Enterprise Walking Skeleton | U01, U02, U03, U04, skeleton slices of U05, U06, U07, U08, U09, U10, U12, U13, U14 | Yes | Platform Foundation Mob plus Booking, Charge/D&D, CMM, Enterprise UI, Runtime/Operation representatives |
| B02 | Contract And Runtime Foundation Completion | U01, U02, U03, U04 completion | No | Platform Foundation Mob |
| B03 | Charge Agreement Pricing Completion | U05 completion and U08 provider side | No | Charge/D&D Mob |
| B04 | Booking Lifecycle Completion | U06 completion and U08 consumer side | No | Booking Orchestration Mob |
| B05 | CMM Movement Completion | U07 completion and U09/U10 producer-consumer foundations | No | CMM Movement Mob |
| B06 | Booking-CMM Event Loop Completion | U09 and U10 completion | No | Booking Orchestration Mob plus CMM Movement Mob |
| B07 | D&D Pricing And Boundary Completion | U11 completion | No | Charge/D&D Mob plus Booking Orchestration Mob |
| B08 | Enterprise Web Workflow Completion | U13 completion | No | Enterprise UI Mob |
| B09 | Seed, Migration, And Developer Experience Completion | U12 completion | No | Runtime/Operation Mob |
| B10 | Quality, Observability, CI/CD, And Operation Readiness | U14 completion | No | Runtime/Operation Mob plus QA/security/operations reviewers |

## Bolt Details

### B01 - Enterprise Walking Skeleton

Included scope:

- Local runtime starts core dependencies: PostgreSQL, Keycloak, Kafka, Schema Registry, and reverse proxy shell.
- Contract catalog holds executable draft OpenAPI/Avro/AsyncAPI/Pact/message-pact assets for the skeleton seams.
- Identity authenticates a booking-capable user and denies an unauthorized action.
- Reference Data provides customer, port, equipment, commodity, charge-code, currency, and movement reference values.
- Charge returns an itemised pricing result from approved agreement or tariff fallback for one deterministic booking scenario.
- Booking creates a draft, requests pricing, stores pricing, validates deterministic capacity, confirms, and publishes `booking.confirmed`.
- CMM consumes `booking.confirmed`, creates a journey, derives expected movements, records one status-producing movement, and publishes `containermovement.status`.
- Booking consumes status and updates lifecycle without calculating movement status.
- Enterprise Web shows authenticated shell, booking detail, pricing evidence, journey/status evidence, and runtime health.
- Observability proves one correlationId across HTTP, event, logs, traces, and health evidence.

Definition of Done:

- Flow 1 and Flow 2 pass for one deterministic seeded booking.
- Minimal Flow 3 status publication and Booking lifecycle update pass.
- No module boundary is violated: Charge calculates pricing, Booking owns lifecycle, CMM owns movement status.
- Local skeleton can be run on Windows through documented commands.
- Contract tests exist for skeleton seams and fail on incompatible schema/API change.
- UI uses real APIs and does not copy fake Claude prototype business logic.

Confidence hypothesis:

Shipping B01 proves that the enterprise architecture can move an authenticated booking through pricing, confirmation, event publication, CMM journey/status, UI evidence, and local runtime health without reducing scope to Shared Platform.

Expected demo:

Sign in, create a seeded booking, price it, confirm it, observe `booking.confirmed`, see CMM journey/status, see Booking lifecycle update, and inspect correlation/runtime evidence in the UI or local evidence bundle.

### B02 - Contract And Runtime Foundation Completion

Included units:

- `local-runtime-foundation`
- `contract-platform-catalog`
- `shared-platform-identity-security`
- `shared-platform-reference-events`

Definition of Done:

- Compose profiles `core`, `app`, `observability`, `devtools`, and `full` are defined enough for downstream services.
- Identity and Reference Data hardening is complete for enterprise modules.
- Executable contract catalog exists for all required HTTP and event seams.
- Reference events use transactional outbox and schema compatibility checks.

Confidence hypothesis:

Shipping B02 proves the foundation can support remaining module work without hidden runtime, auth, reference-data, or contract blockers.

Expected demo:

Run local core runtime, validate authz, mutate reference data, publish reference event, and run contract catalog checks.

### B03 - Charge Agreement Pricing Completion

Included units:

- `charge-agreement-pricing-domain`
- Provider-side support for `booking-charge-pricing-integration`

Definition of Done:

- Agreement, tariff, charge terms, active lookup, tariff fallback, itemised pricing, manual pricing fallback, and pricing audit are complete.
- D&D rules and calculation foundations are present for later B07 completion.
- Charge provider contracts and tests pass.

Confidence hypothesis:

Shipping B03 proves Charge can own commercial calculation without Booking lifecycle leakage.

Expected demo:

Create/approve agreement, simulate agreement pricing, simulate tariff fallback, and inspect pricing audit.

### B04 - Booking Lifecycle Completion

Included units:

- `booking-lifecycle-domain`
- Consumer-side support for `booking-charge-pricing-integration`

Definition of Done:

- Booking draft, validation, pricing orchestration state, confirmation, exception queues, amendment, reconfirmation, revisioning, and audit are complete.
- Booking does not calculate prices, free time, D&D rates, or movement status.

Confidence hypothesis:

Shipping B04 proves Booking can own lifecycle orchestration while respecting Charge and CMM ownership boundaries.

Expected demo:

Create booking, validate reference and capacity fixtures, handle pricing exception, confirm, amend, and reconfirm.

### B05 - CMM Movement Completion

Included units:

- `container-movement-domain`
- CMM foundations for `booking-confirmed-journey-integration` and `movement-status-booking-integration`

Definition of Done:

- Journey creation, expected move derivation, movement capture, DCSA-aligned validation, duplicate/late/out-of-order handling, status derivation, and history query are complete.
- CMM does not decide D&D relevance.

Confidence hypothesis:

Shipping B05 proves CMM can own movement facts and status independently from Booking and Charge.

Expected demo:

Create/reconcile a journey, capture planned/estimated/actual movement events, and derive status with validation evidence.

### B06 - Booking-CMM Event Loop Completion

Included units:

- `booking-confirmed-journey-integration`
- `movement-status-booking-integration`

Definition of Done:

- `booking.confirmed` producer/consumer path is fully contract-tested and recoverable.
- `containermovement.status` producer/consumer path is fully contract-tested and recoverable.
- Deduplication, stale revision handling, ordering metadata, outbox, Schema Registry, message-pact, and correlation evidence pass.

Confidence hypothesis:

Shipping B06 proves the asynchronous Booking-CMM lifecycle loop works beyond the skeleton happy path.

Expected demo:

Run Flow 2 and Flow 3 with duplicate, late, stale, and out-of-order scenarios.

### B07 - D&D Pricing And Boundary Completion

Included units:

- `dnd-pricing-integration`

Definition of Done:

- Booking detects D&D-relevant boundaries from movement status and booking facts.
- Booking sends `pricing.dnd-request`; Charge returns `pricing.dnd-result`.
- Charge calculates import demurrage, import detention, export detention, free time, rates, chargeable days, manual fallback, and audit.
- Booking stores D&D charge snapshot without calculating D&D.

Confidence hypothesis:

Shipping B07 proves the highest-risk Booking-Charge-CMM ownership split works for D&D.

Expected demo:

Run Flow 4, including normal result, missing rule/manual fallback, and audit evidence.

### B08 - Enterprise Web Workflow Completion

Included units:

- `enterprise-web-shell-and-workflows`

Definition of Done:

- Integrated enterprise shell implements authenticated routes for work queue, pricing/agreement, booking, amendment, CMM journey/movement, D&D outcome, platform administration, and operations.
- UI preserves compatible Claude visual direction while using real APIs and permissions.
- UI displays ownership evidence and exception actions.

Confidence hypothesis:

Shipping B08 proves operators can perform enterprise workflows through the UI without hidden API-only steps or fake prototype logic.

Expected demo:

Navigate from work queue to booking, pricing, movement, D&D, platform, and operations workspaces using seeded data and real service calls.

### B09 - Seed, Migration, And Developer Experience Completion

Included units:

- `enterprise-seed-migrations-devex`

Definition of Done:

- Separate logical databases/users and migrations exist for all service owners.
- Deterministic seed data covers users, roles, reference data, agreements, tariffs, charges, D&D rules, bookings, journeys, movements, and exceptions.
- Developer commands for setup, startup, shutdown, reset, migrations, seed, logs, health, tests, and E2E validation are documented and tested.

Confidence hypothesis:

Shipping B09 proves the enterprise system can be reset and validated repeatably by a local Windows developer.

Expected demo:

Reset, migrate, seed, run health checks, and execute E2E validations from documented commands.

### B10 - Quality, Observability, CI/CD, And Operation Readiness

Included units:

- `observability-quality-operation-readiness`

Definition of Done:

- Full E2E Flow 1 through Flow 5 passes.
- Contract, integration, security, resilience, performance, readiness, and no-fake-completion gates pass.
- Logs, metrics, traces, dashboards, alerts, SLO evidence, runbooks, incident readiness, rollback, backup, DR, and feedback artifacts are available for Operation stages.

Confidence hypothesis:

Shipping B10 proves the enterprise application has enough evidence to enter Operation without pretending that documents, skeletons, or container startup are completion.

Expected demo:

Run full local profile, execute all flow suites, inspect dashboards/traces/logs, review CI evidence, and walk through runbook and incident artifacts.

## Dependency Compliance

- B01 intentionally bundles dependency foundations and dependent skeleton slices in one gated walking-skeleton Bolt; this satisfies `team-practices.md` while preserving the approved ownership boundaries.
- B02 through B10 respect the unit DAG from `unit-of-work-dependency.md`.
- No Bolt requires a unit before its prerequisite is either included in the same Bolt or already completed.
- Delivery order is economic and confidence-driven; the topology still comes from Units Generation.

## Approval Gate Implication

Approval of Delivery Planning accepts B01 as the first Construction walking-skeleton Bolt. It does not approve autonomous execution of remaining Bolts; AI-DLC must still ask the standard autonomy ladder after the walking-skeleton gate.


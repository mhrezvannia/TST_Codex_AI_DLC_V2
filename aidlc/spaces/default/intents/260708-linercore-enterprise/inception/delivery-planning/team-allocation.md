# Team Allocation - LinerCore Enterprise

## Source Context

This allocation consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`, `mob-composition.md`, and `skill-matrix.md`.

Team Formation executed for this enterprise intent. This plan therefore uses the approved mobs instead of defaulting all Bolts to a single AI developer.

## Mob Model

| Mob | Primary focus | Core skills |
|---|---|---|
| Platform Foundation Mob | Runtime, Keycloak, Kafka, Schema Registry, contracts, Shared Platform | Platform, backend, security, QA/contract, architecture |
| Charge/D&D Mob | Agreements, tariffs, pricing, D&D rules/calculation | Charge backend, pricing SME, QA, Booking representative, architect |
| Booking Orchestration Mob | Booking lifecycle, pricing orchestration, confirmation, exceptions, D&D trigger | Booking backend, domain SME, Charge representative, CMM representative, QA |
| CMM Movement Mob | Journey, movement validation, ordering, status events | CMM backend, DCSA/EDI specialist, Booking representative, QA, architect |
| Enterprise UI Mob | Claude UI normalization, authenticated workflows, UI/BFF/API mapping | Frontend, UX/product, module backend representative, security, QA |
| Runtime/Operation Mob | Compose, observability, CI/CD, runbooks, health checks | Platform/DevOps, SRE/operations, QA, security, module representatives |

## Bolt Allocation

| Bolt | Assigned mob | Supporting mobs | Coordination forum |
|---|---|---|---|
| B01 - Enterprise Walking Skeleton | Platform Foundation Mob | Charge/D&D, Booking Orchestration, CMM Movement, Enterprise UI, Runtime/Operation | Program coordination, contract council, runtime council |
| B02 - Contract And Runtime Foundation Completion | Platform Foundation Mob | Runtime/Operation, security, QA | Contract council and runtime council |
| B03 - Charge Agreement Pricing Completion | Charge/D&D Mob | Platform Foundation, Booking representative, Enterprise UI | Contract council |
| B04 - Booking Lifecycle Completion | Booking Orchestration Mob | Charge/D&D, CMM Movement, Enterprise UI | Program coordination |
| B05 - CMM Movement Completion | CMM Movement Mob | Booking Orchestration, Platform Foundation, Enterprise UI | Contract council |
| B06 - Booking-CMM Event Loop Completion | Booking Orchestration Mob plus CMM Movement Mob | Platform Foundation, QA | Contract council |
| B07 - D&D Pricing And Boundary Completion | Charge/D&D Mob plus Booking Orchestration Mob | CMM Movement, Enterprise UI, QA | Program coordination |
| B08 - Enterprise Web Workflow Completion | Enterprise UI Mob | All module mobs, security, QA | UX review and program coordination |
| B09 - Seed, Migration, And Developer Experience Completion | Runtime/Operation Mob | All module mobs | Runtime council |
| B10 - Quality, Observability, CI/CD, And Operation Readiness | Runtime/Operation Mob | QA, security, operations, all module representatives | Runtime council and operation readiness review |

## Team API Expectations

Each mob publishes a lightweight Team API before its first Bolt starts:

- Ownership: services, contracts, data, routes, tests, and runbooks owned by the mob.
- Interfaces: APIs/events, review channels, and expected inputs from other mobs.
- Service levels: response expectations for contract reviews, runtime blockers, and cross-module design questions.
- Evidence: tests, contract reports, observability evidence, and demo criteria the mob will provide.

## Capacity And Skill Risks

| Risk | Affected Bolt | Mitigation |
|---|---|---|
| Named SMEs are not confirmed | B01 through B07 | Use documented assumptions, schedule product/domain review gates, and capture unresolved decisions as exceptions. |
| DCSA/EDI specialist unavailable | B05, B06, B07 | Keep first-release movement data deterministic and fixture-backed; flag DCSA edge cases for expert review. |
| Contract testing expertise thin | B01, B02, B06, B07, B10 | Assign QA/contract specialist to contract council and pair with module mobs. |
| Runtime/platform bottleneck | B01, B02, B09, B10 | Runtime council meets twice weekly during Construction and owns unblock decisions. |
| UI/backend handoff drift | B01, B08 | Enterprise UI Mob includes module backend representatives and uses real APIs only. |

## Branching And Gate Allocation

- Branching follows `team-practices.md` and `project.md`: short-lived feature or Bolt branches against `main`; no long-lived environment release branches.
- Bolt 1 is gated as the walking skeleton.
- After Bolt 1 approval, AI-DLC asks the Construction autonomy ladder. If the user chooses gated mode, every later Bolt or parallel batch gets a gate; if autonomous, failures still halt and ask.
- Each Bolt must trace to `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `requirements.md`, and `stories.md`.

## Review Cadence

| Cadence | Session | Output |
|---|---|---|
| Per Bolt kickoff | Assigned mob plus dependency representatives | Goal, scope, Definition of Done, risks |
| Twice weekly | Contract council | API/event/schema/Pact decisions and blockers |
| Twice weekly | Runtime council | Compose, CI/CD, observability, Keycloak/Kafka/SR blockers |
| Weekly | Program coordination | Dependency changes, scope risk, delivery evidence |
| Per Bolt close | Mob review | Demo, evidence bundle, open risks, next-Bolt impacts |


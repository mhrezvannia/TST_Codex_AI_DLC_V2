# Initiative Brief - Shared Platform Local Functionality

## Recommendation

Go to Inception with constraints.

This brief consumes `intent-statement`, `scope-document`, `intent-backlog`, `competitive-analysis`, `feasibility-assessment`, `constraint-register`, `team-assessment`, and `wireframes`. The approved initiative is to make Shared Platform locally functional and integration-ready before starting Charge & Customer Agreement, Customer Booking, and Container Movement Management.

## Intent and Problem

The prior Shared Platform work produced a scaffold, but the current platform is not yet a usable local foundation. The `intent-statement` identifies concrete gaps:

- backend services are not running locally;
- BFF routes do not call real backend APIs for core flows;
- the reference-data UI is mostly read-only;
- authentication relies on local bypass/placeholder behavior;
- seed loading is dry-run oriented;
- full quality evidence is blocked by Java/Maven runtime availability.

The business consequence is direct: downstream LinerCore modules depend on Shared Platform reference data, identity, and event transport. Building those modules before Shared Platform works would create integration debt.

## Market and Build Strategy

The `competitive-analysis` supports an adopt-plus-build strategy:

| Capability | Strategy |
| --- | --- |
| Authentication | Adopt Keycloak; do not build auth from scratch. |
| Authorization | Build `identity-service` carrier/module authorization seams. |
| Event transport | Use self-managed Kafka and Schema Registry; build outbox and schema compatibility evidence. |
| Contracts | Use OpenAPI, Avro, Pact/provider, and message checks. |
| Local/on-prem runtime | Use Docker Compose and self-hosted runner/registry surfaces. |
| Product differentiation | Build LinerCore-specific reference data, BFF integration, seeds, publication status, and downstream-ready contracts. |

## Scope Boundary

The `scope-document` defines the accepted in-scope outcomes:

1. local toolchain/runtime checks;
2. Compose image/build strategy;
3. backend compile/test/run for `identity-service` and `reference-data-service`;
4. Keycloak and identity authorization;
5. reference-data persistence/admin APIs;
6. BFF and UI mutation flows;
7. seed apply mode;
8. outbox, Kafka, Schema Registry verification;
9. contract/provider/message tests;
10. full quality gates and CI readiness;
11. observability, smoke scripts, and runbook;
12. local-only auth-bypass safeguards.

Out of scope: Charge, Booking, Container Movement runtime work, external finance integration, production deployment, public cloud substitutions, public customer identity, DCSA public T&T, EDI intake, multi-entity, and multi-currency.

## Backlog and Build Sequence

The `intent-backlog` defines twelve units:

| Unit | Purpose | Priority |
| --- | --- | --- |
| U01 | Local toolchain and runtime readiness | P0 |
| U02 | Compose image and build strategy | P0 |
| U03 | Backend compile/test/run baseline | P0 |
| U04 | Local Keycloak and identity authorization | P0 |
| U05 | Reference-data persistence and admin APIs | P0 |
| U06 | Reference-data BFF and UI mutation flows | P0 |
| U07 | Service-backed seed apply mode | P0 |
| U08 | Outbox, Kafka, and Schema Registry verification | P0 |
| U09 | Contracts and provider/message tests | P1 |
| U10 | Full quality gates and CI readiness | P1 |
| U11 | Observability, smoke, and runbook | P1 |
| U12 | Local-only bypass cleanup and production safeguards | P2 |

The functional MVP cut is U01-U08. Integration readiness requires U09-U11. U12 is a production-safety guardrail tied to the auth work.

## Feasibility and Risk Highlights

The `feasibility-assessment` verdict is feasible with prerequisite remediation.

| Risk / blocker | Status | Mitigation |
| --- | --- | --- |
| Java 21 missing | Blocking backend local evidence | Install Java 21 or use provisioned runner. |
| Maven missing | Blocking backend test gate | Install Maven 3.9+ or use provisioned runner. |
| Docker daemon unavailable | Blocking Compose proof | Start Docker Desktop or approved runtime. |
| No Dockerfiles/build definitions found | Blocking app image startup | Add Dockerfiles, build contexts, or dev profiles. |
| Static/read-only BFF/UI behavior | Blocking product functionality | Implement BFF clients and mutation flows. |
| Keycloak bootstrap absent | Blocking real auth path | Add deterministic realm/client/user/role bootstrap. |
| Seed loader dry-run only | Blocking local data setup | Add idempotent apply mode through services. |
| Event/contract drift | Blocking downstream trust | Add outbox publication and provider/message checks. |

The `constraint-register` also locks no public cloud, browser-to-BFF-only traffic, Keycloak plus `identity-service`, PII ownership in reference data, Kafka/Avro/Schema Registry/outbox, OWASP/API/CIS controls, and backend Maven quality gates.

## Concept Visuals

The `wireframes` define operational screens:

- Auth sign-in and session summary;
- Reference Data Workbench;
- Create/edit record drawer;
- Deactivate confirmation;
- Seed data runs;
- Local readiness dashboard.

The product-lead review verdict is READY. The visual direction supports the approved goal: it targets permission-aware mutations, BFF/backend integration, persistence/history, seed apply mode, publication status, contracts, and local readiness.

## Team and Delivery Plan

The `team-assessment` defines a local AI-assisted delivery cell:

| Role | Owner |
| --- | --- |
| Product owner / approver | User |
| Delivery conductor | Codex with AI-DLC |
| Implementation executor | Codex |
| Specialist perspectives | AI-DLC agents |
| Local environment owner | User and local machine |

Delivery sequence:

1. Runtime Baseline Mob: U01-U02.
2. Service Skeleton Mob: U03.
3. Identity Mob: U04 and U12.
4. Reference Data Mob: U05-U07.
5. Event and Contract Mob: U08-U09.
6. Readiness Mob: U10-U11.

## Go / No-Go Decision

Go to Inception.

Conditions carried into Inception and Construction:

1. Do not expand this intent into downstream module implementation.
2. Treat Java/Maven/Docker availability as explicit blockers for local proof.
3. Prioritize the first walking skeleton around local runtime, auth, one reference-data mutation, persistence, outbox/status, and smoke evidence.
4. Preserve `AUTH_BYPASS=true` as local-only and add safeguards before leaving the intent.
5. Keep all browser traffic through Next.js BFF routes.

## Next Phase Entry Criteria

Inception should produce:

- reverse-engineering evidence for current frontend, backend, compose, contracts, and seed code;
- requirements tied to U01-U12;
- user stories for reference-data admin, security/IT, platform operator, and downstream module consumers;
- refined mockups preserving testable states;
- application design and units that can drive construction without reopening scope.

# Intent Backlog - Shared Platform Local Functionality

## Prioritization Method

This backlog consumes `intent-statement`, `feasibility-assessment`, and `constraint-register`. Items are ordered by dependency-first and risk-first sequencing: unblock the runtime, prove backend behavior, wire auth and reference data end-to-end, then harden contracts and operation evidence.

Priority uses MoSCoW plus a lightweight WSJF note:

- P0 / Must: required for "real functional" Shared Platform.
- P1 / Should: required for integration readiness and quality evidence.
- P2 / Could: cleanup and safeguards that reduce future risk.

## Backlog

| ID | Priority | Unit | Scope | Dependencies | Acceptance Signal |
| --- | --- | --- | --- | --- | --- |
| U01 | P0 Must | Local toolchain and runtime readiness | Add/confirm checks and docs for Java 21, Maven 3.9+, Docker runtime, Node, Yarn, env vars, and ports. | None | A single documented verification path reports all local prerequisites and blockers clearly. |
| U02 | P0 Must | Compose image and build strategy | Add service/app Dockerfiles, Compose build contexts, or local dev profiles so current image references are resolvable. | U01 | Compose can build or run all required Shared Platform services/backing services in a documented profile. |
| U03 | P0 Must | Backend compile/test/run baseline | Make `identity-service` and `reference-data-service` compile, test, and expose local health/API endpoints. | U01, U02 | Maven tests pass in the available runner and both services run with health checks. |
| U04 | P0 Must | Local Keycloak and identity authorization | Bootstrap realm/client/users/roles and wire `apps/auth` through Keycloak plus `identity-service`; preserve `AUTH_BYPASS=true` as local-only. | U02, U03 | User can sign in locally or explicitly bypass auth; authorization decisions are exercised and logged. |
| U05 | P0 Must | Reference-data persistence and admin APIs | Implement persistence, migrations, validation, history, lifecycle state, and admin APIs for MVP reference sets. | U03 | API supports list, detail, create, update, deactivate, history, and status against persisted data. |
| U06 | P0 Must | Reference-data BFF and UI mutation flows | Replace static BFF data with service clients and enable authorized create/update/deactivate/history/status flows in `apps/reference-data`. | U04, U05 | UI is no longer view-only for authorized users and core flows round-trip through BFF/backend. |
| U07 | P0 Must | Service-backed seed apply mode | Convert seed loader from dry-run-only to idempotent apply mode through service/admin APIs with validation and failure reporting. | U05 | Seed apply creates or updates live reference data and can be safely re-run. |
| U08 | P0 Must | Outbox, Kafka, and Schema Registry verification | Publish reference-data changes through transactional outbox, Kafka, Avro, and Schema Registry with visible publication status. | U05, U07 | Mutations produce verifiable messages and UI/API can show publication status or failure. |
| U09 | P1 Should | Contracts and provider/message tests | Align OpenAPI, Avro, Pact/provider tests, and message tests to the running services. | U03, U05, U08 | Contract checks pass and downstream modules can consume stable stubs/contracts. |
| U10 | P1 Should | Full quality gates and CI readiness | Make gate runner cover frontend checks, backend Maven tests, contracts, and security-relevant checks on local or self-hosted CI. | U03, U06, U09 | Quality-gate command passes or reports only documented external prerequisite failures. |
| U11 | P1 Should | Observability, smoke, and runbook | Add health checks, correlation id propagation evidence, smoke scripts, logs guidance, startup/shutdown, and troubleshooting. | U02, U03, U06, U08 | Operator/developer can verify the local platform without reading implementation code. |
| U12 | P2 Could | Local-only bypass cleanup and production safeguards | Add guardrails that prevent `AUTH_BYPASS=true` and insecure defaults from leaking into non-local profiles. | U04, U10 | Tests/config checks fail when local-only bypass is enabled in non-local profiles. |

## Critical Path

```text
U01 -> U02 -> U03 -> U04 -> U05 -> U06 -> U07 -> U08 -> U09 -> U10 -> U11
                         \                         /
                          +----------- U12 --------+
```

## MVP Cut Line

The functional MVP cut for this intent is U01 through U08. U09 through U11 are still required before the intent can be considered integration-ready for the next LinerCore modules. U12 can run after U04 once the real auth path exists, but it should not delay proving the main local path.

## Delivery Notes

- Build U01 and U02 first because feasibility identified missing Java/Maven/Docker runtime and missing image build definitions as immediate blockers.
- Build U03 before UI work so BFF route handlers have real targets.
- Build U04 before mutations because authorization affects all write flows.
- Build U05 and U06 as the main user-visible functional slice.
- Build U07 and U08 before downstream modules because those modules depend on shared reference data and event patterns.
- Keep Charge, Booking, and Container Movement out of this backlog; they become the next intents after this Shared Platform foundation is functional.

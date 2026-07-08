# Bolt Plan - Shared Platform MVP

## Source Trace

This Bolt plan is based on `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`, and approved `delivery-planning-questions.md`.

The plan preserves Shared Platform-only scope: `reference-data-service`, `identity-service`, Kafka/Schema Registry event integration, `apps/reference-data`, and `apps/auth`. Charge, Booking, and Container Movement remain future consumers and are not built here.

## Planning Stance

- Sequencing heuristic: gated walking skeleton first, then risk/contract readiness.
- Scoring model: qualitative value, risk reduction, time criticality, job size, and rationale.
- Parallelism: serial until the walking skeleton is approved; after that, independent DAG branches may run in parallel when gates permit.
- Team practice: the first Construction Bolt is gated.
- Bolt count: 10 planned Bolts. Bolt 1 is a thin multi-unit walking skeleton; Bolts 2-10 complete the underlying units.

## Bolt 1 - Gated Walking Skeleton

Walking skeleton: Yes.

Included units: thin validation slices from U01-platform-skeleton, U02-identity-authz-service, U03-reference-domain-api, U04-reference-event-outbox, U05-app-auth, U06-app-reference-data, U08-quality-gates, U09-local-seed-compose, and U10-observability-deployment.

Definition of Done:

- Repository/platform skeleton builds for backend and frontend.
- Minimal Keycloak-backed auth path or approved local equivalent validates the BFF/session pattern.
- Minimal `identity-service` authorization decision returns allow/deny for one reference-admin action.
- Minimal `reference-data-service` can create/read one seeded reference record.
- One reference-change outbox item is persisted and published or simulated against Kafka/SR in the local environment.
- `apps/auth` and `apps/reference-data` show a thin sign-in/reference flow.
- One CI path runs compile/type checks and a smoke test.
- Correlation id appears across at least one API request, log, audit/outbox entry, and event/status surface.

Confidence hypothesis:

Shipping this Bolt proves the mandated on-prem, BFF, service, persistence, outbox, event, frontend, CI, and observability patterns can work end to end before full feature build-out.

Expected demo:

- Sign in or use local auth equivalent.
- Create or view one reference record.
- Show event/outbox status and correlation id trace.
- Show CI/smoke evidence.

## Bolt 2 - Identity Authorization Service Completion

Walking skeleton: No.

Included units: U02-identity-authz-service.

Definition of Done:

- MVP role catalog implemented.
- Authorization decision API published with OpenAPI.
- Role assignment and audit persistence implemented where in MVP scope.
- Keycloak adapter boundary and fail-closed behavior tested.
- Unit and adapter integration tests cover authorization decisions and audit.

Confidence hypothesis:

Shipping this Bolt proves Shared Platform authorization can be centralized and consumed by apps/services without embedding role logic elsewhere.

Expected demo:

- Evaluate permissions for representative users and roles.
- Show denied/allowed decisions and audit evidence.

## Bolt 3 - Reference Domain and Provider/Admin APIs Completion

Walking skeleton: No.

Included units: U03-reference-domain-api.

Definition of Done:

- Nine MVP reference sets modeled.
- Admin/provider REST APIs exposed and documented.
- Core validation and invariants implemented, including Location/Port and TradeLane rules.
- Audit metadata and correlation id persisted for reference changes.
- Unit and adapter integration tests cover successful and failed admin operations.

Confidence hypothesis:

Shipping this Bolt proves canonical reference ownership can enforce business invariants and provide stable provider/admin APIs.

Expected demo:

- Create, search, update, deactivate, and reactivate representative records.
- Show validation failures for duplicate keys, orphan Port, and invalid TradeLane Region references.

## Bolt 4 - Reference Event Outbox and Kafka Completion

Walking skeleton: No.

Included units: U04-reference-event-outbox.

Definition of Done:

- Transactional outbox persists reference-change events.
- Nine typed Avro event schemas exist and pass compatibility checks.
- Kafka publisher handles pending, published, failed, and retrying statuses.
- Event id, schema version, source, time, correlation id, entity id, and operation are present.
- Message-pact or equivalent message contract tests cover envelope and payload.

Confidence hypothesis:

Shipping this Bolt proves downstream consumers can rely on traceable, schema-governed reference-change notifications.

Expected demo:

- Commit a reference change.
- Show outbox row, published event, schema compatibility result, and event status API response.

## Bolt 5 - Auth Frontend App Completion

Walking skeleton: No.

Included units: U05-app-auth.

Definition of Done:

- Sign-in, callback, sign-out, access-denied, session display, and request-access paths implemented.
- BFF/session handling uses HttpOnly cookies and `proxy.ts` route protection.
- Authorization-denied states display correlation id and safe user guidance.
- Frontend tests cover happy path, denied path, and sign-out path.

Confidence hypothesis:

Shipping this Bolt proves internal staff can enter the platform through the mandated frontend security model.

Expected demo:

- Sign in, view session roles, sign out, and show access-denied/request-access behavior.

## Bolt 6 - Reference Data Frontend App Completion

Walking skeleton: No.

Included units: U06-app-reference-data.

Definition of Done:

- Reference workspace navigation covers all nine reference sets.
- Browse/search/detail/create/edit/deactivate/reactivate flows implemented where authorized.
- Read-only state shown where write permission is absent.
- Validation, event status, and freshness warning surfaces implemented.
- Desktop, tablet, and mobile read-only behavior follow refined mockups.
- WCAG 2.1 AA-oriented checks are included where practical.

Confidence hypothesis:

Shipping this Bolt proves reference administrators can maintain canonical data through usable governed workflows.

Expected demo:

- Navigate reference sets, edit a record, see validation errors, publish a change, and inspect event status.

## Bolt 7 - Published Contracts and Developer Experience

Walking skeleton: No.

Included units: U07-contracts-dx.

Definition of Done:

- Reference provider/admin OpenAPI contracts published.
- Identity authorization OpenAPI contract published.
- Avro schema catalog and event examples published.
- Contract catalog or equivalent developer view exposes API/event versions and compatibility status.
- Downstream review package is contract-only and contains no runtime stubs.

Confidence hypothesis:

Shipping this Bolt proves later module teams can review and build against stable Shared Platform contracts without this workflow implementing their runtime code.

Expected demo:

- Show OpenAPI, authorization API, Avro event schemas, examples, and compatibility status.

## Bolt 8 - Local Seed Data and Docker Compose Environment

Walking skeleton: No.

Included units: U09-local-seed-compose.

Definition of Done:

- Docker Compose local environment starts required platform components.
- Deterministic seed data covers all nine reference sets.
- Seed loading is idempotent.
- Configurable Regions and TradeLanes do not hard-code final trade-footprint decisions.
- Local smoke tests can run against seeded environment.

Confidence hypothesis:

Shipping this Bolt proves developers and tests can reproduce platform behavior locally with deterministic canonical data.

Expected demo:

- Start local environment, load seeds twice idempotently, and run a smoke test against seeded records.

## Bolt 9 - CI, Contract, Schema, and Test Quality Gates

Walking skeleton: No.

Included units: U08-quality-gates.

Definition of Done:

- GitHub Actions workflows run on self-hosted runner profile.
- Backend compile, unit, adapter integration, and 85% coverage gates configured.
- Frontend type/lint/test checks configured.
- OpenAPI, Pact/message-pact, and Avro compatibility gates configured.
- Required gate failure blocks merge or deployment.

Confidence hypothesis:

Shipping this Bolt proves the foundation cannot regress silently through code, API, or event-contract changes.

Expected demo:

- Show green CI path and one intentionally failing contract/schema gate blocking progression.

## Bolt 10 - Observability, Health, and Deployment Readiness

Walking skeleton: No.

Included units: U10-observability-deployment.

Definition of Done:

- Services and BFF apps emit structured logs with correlation id.
- OpenTelemetry metrics/traces export to approved observability stack.
- Health and smoke checks are available for staging promotion.
- Docker Compose/Nginx/Vault/registry deployment descriptors are ready for environment stages.
- Event freshness, outbox lag, request latency, and error metrics are visible.

Confidence hypothesis:

Shipping this Bolt proves the Shared Platform can be operated, traced, and promoted safely in the on-prem environment.

Expected demo:

- Show health checks, smoke checks, dashboard/trace/log evidence, and correlation across an admin change.

## Dependency Validation

The sequence respects the unit dependency DAG in `unit-of-work-dependency.md` except for Bolt 1, which is intentionally a gated thin walking-skeleton validation slice across core layers. Full unit completion after Bolt 1 follows the DAG dependencies and does not introduce downstream runtime work.

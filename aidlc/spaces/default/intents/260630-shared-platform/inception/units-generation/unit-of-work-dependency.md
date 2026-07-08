# Unit Dependency DAG - Shared Platform MVP

## Source Trace

This dependency topology is generated from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, `stories.md`, and `units-generation-questions.md`.

This artifact describes direct dependencies only. It does not choose implementation order, Bolt sequence, or a critical path; Delivery Planning makes those economic sequencing decisions.

## Dependency Principles

- A unit depends only on units whose outputs it directly needs.
- Independent units are left independent so multiple valid topological paths remain available.
- Contract-only downstream consumers are represented through contract artifacts, not runtime components.
- No unit depends on Charge, Booking, or Container Movement runtime implementation.

## Machine-Readable Edge Block

```yaml
units:
  - name: U01-platform-skeleton
    depends_on: []
  - name: U02-identity-authz-service
    depends_on: [U01-platform-skeleton]
  - name: U03-reference-domain-api
    depends_on: [U01-platform-skeleton, U02-identity-authz-service]
  - name: U04-reference-event-outbox
    depends_on: [U03-reference-domain-api]
  - name: U05-app-auth
    depends_on: [U01-platform-skeleton, U02-identity-authz-service]
  - name: U06-app-reference-data
    depends_on: [U02-identity-authz-service, U03-reference-domain-api, U04-reference-event-outbox]
  - name: U07-contracts-dx
    depends_on: [U02-identity-authz-service, U03-reference-domain-api, U04-reference-event-outbox]
  - name: U08-quality-gates
    depends_on: [U02-identity-authz-service, U03-reference-domain-api, U04-reference-event-outbox, U05-app-auth, U06-app-reference-data, U07-contracts-dx]
  - name: U09-local-seed-compose
    depends_on: [U01-platform-skeleton, U03-reference-domain-api]
  - name: U10-observability-deployment
    depends_on: [U02-identity-authz-service, U03-reference-domain-api, U04-reference-event-outbox, U05-app-auth, U06-app-reference-data]
```

## Direct Dependency Rationale

| Unit | Direct dependencies | Rationale |
|---|---|---|
| U01-platform-skeleton | none | Provides the shared repo/runtime baseline. |
| U02-identity-authz-service | U01 | Needs backend skeleton and shared conventions. |
| U03-reference-domain-api | U01, U02 | Needs backend skeleton and authorization decision integration for protected admin APIs. |
| U04-reference-event-outbox | U03 | Needs reference domain changes and persistence before outbox/event publication. |
| U05-app-auth | U01, U02 | Needs frontend baseline and authorization/session surface. |
| U06-app-reference-data | U02, U03, U04 | Needs authz, reference APIs, and event/status APIs. |
| U07-contracts-dx | U02, U03, U04 | Needs authz API, reference APIs, and event schemas to publish contract catalog. |
| U08-quality-gates | U02, U03, U04, U05, U06, U07 | Needs runtime and contract surfaces to wire CI checks. |
| U09-local-seed-compose | U01, U03 | Needs environment skeleton and reference domain/schema to seed data. |
| U10-observability-deployment | U02, U03, U04, U05, U06 | Needs services/apps/events to add telemetry, health, smoke, and deployment readiness. |

## Integration Points

| From unit | To unit | Integration |
|---|---|---|
| U05-app-auth | U02-identity-authz-service | BFF REST/OpenAPI authorization/session calls. |
| U06-app-reference-data | U02-identity-authz-service | BFF REST/OpenAPI permission checks and read-only decisions. |
| U06-app-reference-data | U03-reference-domain-api | BFF REST/OpenAPI reference admin/provider calls. |
| U06-app-reference-data | U04-reference-event-outbox | Event status/freshness APIs. |
| U07-contracts-dx | U02/U03/U04 | OpenAPI, Avro, examples, compatibility metadata. |
| U08-quality-gates | U02/U03/U04/U05/U06/U07 | CI checks, contract tests, schema compatibility, coverage. |
| U10-observability-deployment | U02/U03/U04/U05/U06 | Logs, metrics, traces, health, smoke checks. |

## Parallel Development Opportunities

These are topology observations, not implementation-order recommendations:

- After U01, U02 and some U05 shell work have no direct dependency between them except where U05 needs the authz contract.
- After U02, U03 and U05 are separate service/app surfaces.
- After U04, U06 and U07 can advance independently once their direct API/event contracts exist.
- U09 depends on U03 but is otherwise separate from frontend and CI contract catalog work.
- U10 is cross-cutting and can attach to multiple completed service/app surfaces as they become available.

## Cycle Check

The graph is acyclic. Every `depends_on` entry names a declared unit, no unit depends on itself, and downstream modules are not declared as units.

## Review

Verdict: READY

Fallback architecture review found no blocking issues. The 10-unit decomposition is coherent, the DAG is topology-only and cycle-free, the required fenced YAML block is valid, story coverage is complete, and no unit introduces Charge, Booking, or Container Movement runtime implementation.

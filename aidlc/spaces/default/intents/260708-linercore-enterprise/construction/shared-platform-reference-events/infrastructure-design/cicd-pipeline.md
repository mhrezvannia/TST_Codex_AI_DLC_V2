# CI/CD Pipeline - shared-platform-reference-events

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Stages

| Stage | Gate |
|---|---|
| Build and unit tests | Reference lifecycle, validation, outbox, and publisher code compiles and tests pass. |
| SAST/dependency/secret scan | Critical/high exploitable findings and secrets block merge. |
| API contract validation | OpenAPI for admin and validation APIs is executable. |
| Event contract validation | Avro/AsyncAPI reference-data changed events and Schema Registry compatibility pass. |
| Outbox integration tests | State, history/audit context, and outbox rows commit atomically. |
| Publisher tests | Claim/lease, retry, dedupe, and blocked-state behavior pass. |
| Security tests | Capability-gated APIs, service identity, denied mutations, and audit evidence pass. |
| Readiness evidence | Outbox health, schema compatibility, and Kafka publish evidence are generated. |

## Blocking Rules

| Gate | Blocking rule |
|---|---|
| No cross-service SQL | Consumers must use API/event evidence only. |
| Atomic outbox | Mutation without outbox or outbox without state blocks readiness. |
| Schema compatibility | Required reference event schema failure blocks integration readiness. |
| Audit evidence | Mutations, denied access, and sensitive lifecycle actions require audit records. |
| Publisher health | Stale failed/blocked outbox rows block readiness. |

## Rollback And Recovery

Rollback uses git revert plus database migration rollback/forward policy defined by implementation. Event schema rollback must preserve compatibility rules and cannot silently republish incompatible events as green.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests lookup, validation, mutation, history, outbox, and publisher budgets. |
| `security-design.md` | Enforces access, service identity, audit, event security, and DB boundaries. |
| `scalability-design.md` | Validates reference scale, history pagination, and outbox batching. |
| `reliability-design.md` | Proves transactional outbox, at-least-once publish, retry, and blocked-state behavior. |
| `logical-components.md` | Maps CI checks to Reference Events components. |
| `components.md` | Preserves Reference Data ownership. |
| `services.md` | Integrates Reference Data Service, PostgreSQL, Kafka, Schema Registry, OpenAPI, Avro, and Keycloak/JWT. |
| `business-logic-model.md` | Covers lifecycle, validation, publishing, outbox health, and exception workflows. |

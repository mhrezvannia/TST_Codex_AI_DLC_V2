# CI/CD Pipeline - U04 Reference Event Outbox

## Pipeline Stages

U04 uses backend, contract, and schema gates:

| Stage | Checks |
|---|---|
| Compile/test | Java 21 / Maven compile, unit tests, coverage. |
| Outbox integration | PostgreSQL claim/status/recovery tests. |
| Messaging integration | Kafka/SR Testcontainers-compatible publish tests. |
| Avro validation | Nine typed schemas and examples validate. |
| Compatibility | Schema Registry compatibility against accepted baseline. |
| Fixtures | Pact/message-pact or equivalent message fixtures. |
| Smoke | One reference change creates outbox row, publishes event, and marks PUBLISHED. |

## Deployment Stages

Local uses Compose Kafka/SR/PostgreSQL. Non-local deployment uses Vault references, worker configuration, readiness, smoke evidence, and registry tags.

## Rollback

Rollback preserves outbox rows and stable event ids. Container rollback must not delete publication status or retry state. Schema rollback follows compatibility rules.

## Secrets in CI/CD

CI redacts Kafka, Schema Registry, PostgreSQL, Vault, and telemetry credentials. Compatibility findings avoid raw stack traces and unsafe payloads.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

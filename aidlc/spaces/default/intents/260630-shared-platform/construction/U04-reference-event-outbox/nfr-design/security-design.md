# Security Design - U04 Reference Event Outbox

## Security Goals

U04 protects reference-change event data, broker credentials, operational metadata, and publication status while preserving the event contract needed by future consumers. Events are contracts, not shared ownership of reference data, and consumers integrate through Kafka events and provider APIs rather than shared databases.

## Payload Controls

Event payloads contain only approved reference-change data needed by consumers. Party/Customer payload mapping respects Confidential or Restricted classification where PII or commercial sensitivity exists. Payload snapshots avoid unsafe internal persistence fields and are reviewed through typed Avro schemas.

Schema subjects are typed by reference event family, avoiding one generic event that leaks variable internals or weakens compatibility review.

## Access Control

Event publication status APIs require authorized admin/operator access. Status responses expose safe lifecycle state, attempts, timestamps, correlation id, reference set, event id, entity id, and broker metadata where safe. They do not expose broker credentials, internal stack traces, unsafe payload internals, or raw infrastructure URLs beyond approved operational metadata.

U04 does not implement downstream runtime consumers, replicas, service stubs, or downstream authorization logic.

## Logging and Secret Handling

Structured logs include service, event id, reference set, entity id, status, attempt count, safe failure code, and correlation id. Logs omit broker credentials, client secrets, raw stack traces, sensitive Party/Customer payload details, and unsafe provider responses.

Correlation id propagates from the original API request into audit/change history, outbox row, publisher logs, traces, status APIs, and Kafka event envelope.

## Transport and Storage

Internal HTTP/event infrastructure must support TLS 1.2 or stronger where the environment supports it. Kafka persistence, outbox storage, operational backups, and Schema Registry storage must remain compatible with later encryption-at-rest requirements.

## Source Trace

This design implements constraints from `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

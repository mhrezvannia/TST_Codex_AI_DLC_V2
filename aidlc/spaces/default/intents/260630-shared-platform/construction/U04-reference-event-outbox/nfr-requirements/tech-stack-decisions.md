# Tech Stack Decisions - U04 Reference Event Outbox

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines outbox rows, Avro mapping, Schema Registry, Kafka publication, broker metadata, retry status, and status APIs. `business-rules.md` mandates Java 21, Spring Boot 3.3, PostgreSQL 15+, Kafka, Confluent Schema Registry, Avro 1.11, OpenAPI, message contract checks, and Docker Compose/Testcontainers-compatible local dependencies. `requirements.md` fixes C-003, C-006, FR-021 through FR-027, and NFR-011.

## Decision Summary

U04 uses the mandated backend/event stack: Java/Spring service modules, PostgreSQL transactional outbox, Kafka, Confluent Schema Registry, Avro 1.11, OpenAPI status APIs, and Pact/message-pact or equivalent message tests.

## Stack Decisions

| Concern | Selection | Rationale |
|---|---|---|
| Service runtime | Java 21, Spring Boot 3.3 | Mandated backend stack. |
| Outbox storage | PostgreSQL 15+ in `reference-data-service` boundary | Enables transaction with canonical reference mutation. |
| Broker | Kafka | Mandated event infrastructure. |
| Schema registry | Confluent Schema Registry | Required for Avro schema registration and compatibility. |
| Schema format | Avro 1.11 | Required for typed reference-change events. |
| API | OpenAPI status/query APIs | Supports U06/admin/operator views and contract checks. |
| Contract checks | Message-pact or equivalent plus compatibility checks | Required gates finalized in U08. |
| Observability | JSON logs, OpenTelemetry, Prometheus/Grafana, Jaeger, ELK | Required for freshness, retries, and failure visibility. |

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Direct publish without outbox | Can silently lose events after committed changes. |
| One generic reference-data changed event | Violates typed event contract scope. |
| JSON events without Schema Registry | Violates Avro/SR contract requirement. |
| Exactly-once promise | Not required; at-least-once plus dedupe id is the MVP contract. |
| Downstream runtime stubs | Out of scope for this workflow. |

## Implementation Guidance for Later Units

- U07 publishes Avro examples and contract catalog material.
- U08 enforces compatibility and message-contract gates.
- U06 consumes status APIs/view models for admin visibility.
- U10 exposes freshness, lag, retry, failure, and correlation telemetry.


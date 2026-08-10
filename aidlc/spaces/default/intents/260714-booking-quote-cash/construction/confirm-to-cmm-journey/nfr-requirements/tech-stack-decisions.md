# Tech Stack Decisions - U04 Confirm to CMM Journey

## Selections

| Concern | Selection | Rationale |
|---|---|---|
| Broker/listener | Spring Kafka, existing Kafka topics | Brownfield integration and bounded retry/DLT support. |
| Contract | Apache Avro 1.11.4, Confluent 7.7.1 | Exact GenericRecord schema and registry compatibility. |
| Publication | Shared `KafkaGenericRecordPublisher`, `ConfluentSchemaRegistrar`, `ScheduledOutboxRelay` | Adopt W0 infrastructure without reinvention. |
| Persistence | Spring JDBC/PostgreSQL plus Flyway core/PostgreSQL 10.10.0 from Boot BOM | Atomic receipts/journey/outbox and additive migration. |
| Verification | JUnit serde/transaction/redelivery plus live console/DB evidence | Proves wire and business effects. |

## Constraints

No sync Booking-to-CMM HTTP client, Kafka fallback, custom producer/registrar/relay, shared inbox database, exactly-once broker transaction claim, or alternate serializer is introduced. Versions follow `technology-stack.md`.

## Source Coverage

Decisions realize U04 `business-logic-model.md`, `business-rules.md`, and `requirements.md` by adopting `technology-stack.md` messaging/persistence components.

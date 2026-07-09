# Infrastructure Services - UOW-07 Outbox Publication Status

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Services

| Service | Use |
| --- | --- |
| PostgreSQL | Durable outbox state. |
| Kafka | Reference-data changed events. |
| Schema Registry | Avro schema registration/compatibility. |
| reference-data-service | Publisher and status APIs. |

## Topics and Schemas

Use existing `contracts/avro/referencedata.*.changed.avsc` subjects.


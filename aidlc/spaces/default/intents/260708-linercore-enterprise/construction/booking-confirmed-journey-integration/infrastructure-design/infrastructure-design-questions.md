# Infrastructure Design Questions - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required. Prior stages resolve `booking.confirmed` outbox publication, Kafka, Avro/AsyncAPI, Schema Registry compatibility, message-pact evidence, CMM consumer deduplication, and journey reconciliation.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Booking and CMM services run in `app`/`full`; Kafka and Schema Registry run in `core`. |
| Storage | Booking outbox stores confirmation event rows; CMM stores consumed-event dedupe and journey reconciliation state. |
| Networking | Kafka topic with Schema Registry subject and message-pact fixtures. |
| Monitoring | Outbox lag, publish status, consumer lag, dedupe, stale revision, schema compatibility, and journey reconciliation evidence. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact topic names, schema subjects, partition keys, consumer group names, and retry timings are implementation details constrained by this design.

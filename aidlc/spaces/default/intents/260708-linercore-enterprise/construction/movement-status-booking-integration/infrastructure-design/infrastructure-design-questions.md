# Infrastructure Design Questions - movement-status-booking-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required. Prior stages resolve `containermovement.status` publication, Kafka, Avro/AsyncAPI, Schema Registry compatibility, message-pact evidence, Booking consumer deduplication, staleness handling, lifecycle update, and D&D trigger input evidence.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | CMM and Booking services run in `app`/`full`; Kafka and Schema Registry run in `core`. |
| Storage | CMM status outbox; Booking consumed-status, lifecycle update, quarantine, and D&D trigger input records. |
| Networking | Kafka topic with Schema Registry subject and message-pact fixtures. |
| Monitoring | Publish lag, consumer lag, duplicate/stale counts, lifecycle updates, quarantine, schema compatibility, and trigger evidence. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact topic names, schema subjects, partition keys, consumer group names, staleness thresholds, and quarantine states are implementation details constrained by this design.

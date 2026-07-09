# NFR Design Questions - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define event latency, producer/consumer identity, metadata, scale baseline, transactional outbox, compatibility, message-pact, deduplication, revision reconciliation, and the Kafka/Avro/Schema Registry stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Transactional outbox, compatibility gate, message-pact evidence, CMM deduplication, revision reconciliation, and retry visibility. |
| Scalability | First release supports 10,000 `booking.confirmed` events, 2,000 revision events, 2,000 replay cases, and 10,000 journey creations/reconciliations. |
| Performance | Confirmation commit to outbox p95 <= 200 ms, publish p95 <= 2 seconds, delivery p95 <= 1 second, CMM consume/reconcile p95 <= 2 seconds, end-to-end p95 <= 5 seconds. |
| Security | Producer and consumer identity, event metadata, protected AsyncAPI/Avro context, audit, and no direct database coupling. |
| Logical boundaries | Booking produces confirmation facts; CMM consumes and creates/reconciles journeys. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact outbox poll interval, claim lease, retry thresholds, and schema subject names are implementation choices constrained by this design.

# Functional Design Questions - U04 Reference Event Outbox and Kafka Publication

## Source Trace

This questions record derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Question Posture

Approved inception artifacts already settle the core U04 decisions:

- `reference-data-service` is the sole producer of reference-change events.
- Publication uses a transactional outbox.
- Events are typed Avro records registered with Confluent Schema Registry.
- Delivery is at-least-once, with idempotency by event id.
- No downstream runtime consumers are implemented in this workflow.

## Recorded Answers

### Q1. What is the publication reliability pattern?

A. Transactional outbox in `reference-data-service`, claimed by a publisher adapter.  
B. Publish directly to Kafka inside REST controllers.  
C. Shared database triggers read by consumers.  
X. Other (please specify)

[Answer]: A. Transactional outbox in `reference-data-service`, claimed by a publisher adapter.

### Q2. What event contract shape is required?

A. Nine typed Avro `referencedata.<entity>.changed` events with a common envelope.  
B. One untyped JSON event for all reference changes.  
C. Database row replication only.  
X. Other (please specify)

[Answer]: A. Nine typed Avro `referencedata.<entity>.changed` events with a common envelope.

### Q3. Should U04 implement downstream consumers?

A. No; publish contracts/examples only. Downstream modules are future consumers.  
B. Yes; build consumer replicas for Charge, Booking, and Container Movement now.  
C. Build mock downstream services.  
X. Other (please specify)

[Answer]: A. No; publish contracts/examples only. Downstream modules are future consumers.

## Ambiguity Analysis

No blocking ambiguity remains for U04 functional design. Exact broker/topic credentials and environment endpoints are infrastructure/deployment concerns; schema compatibility gates are finalized by U08.

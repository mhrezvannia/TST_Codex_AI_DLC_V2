# NFR Requirements Questions - booking-confirmed-journey-integration

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Event Latency

What latency should the confirmed booking to journey path target?

A. p95 <= 5 seconds from Booking confirmation commit to CMM journey created/reconciled under seeded local load. Recommended.
B. p95 <= 30 seconds.
C. No target.
D. Batch-only processing.
E. Defer latency.
X. Other (please specify)

[Answer]: A

## Q2 - Security

What security controls are mandatory?

A. Producer/consumer service identity, Kafka ACL hooks, schema/auth metadata, correlation ID, idempotency/deduplication keys, and no direct database access. Recommended.
B. Broker network trust only.
C. No auth for events.
D. UI auth only.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Scale

What first-release event scale should be supported?

A. At least 10,000 booking.confirmed events, 2,000 amendment/revision events, and 2,000 duplicate/replay cases in local/CI evidence. Recommended.
B. Demo events only.
C. Unlimited no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability controls are required?

A. Booking transactional outbox, Schema Registry compatibility, message-pact, CMM deduplication/revision reconciliation, retry visibility, and fail-closed contract evidence. Recommended.
B. Best-effort publish.
C. Direct synchronous CMM call only.
D. Manual journey creation only.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. Booking/CMM Spring services with Kafka, Avro, AsyncAPI, Schema Registry, message-pact fixtures, PostgreSQL outbox/deduplication, and local Docker evidence. Recommended.
B. Shared database trigger.
C. UI posts directly to CMM.
D. Mock event broker.
E. Defer stack.
X. Other (please specify)

[Answer]: A

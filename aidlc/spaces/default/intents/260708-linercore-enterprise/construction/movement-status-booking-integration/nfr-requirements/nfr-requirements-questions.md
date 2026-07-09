# NFR Requirements Questions - movement-status-booking-integration

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Status Event Latency

What latency should the CMM -> Booking status path target?

A. p95 <= 5 seconds from CMM status derivation to Booking lifecycle update under seeded local load. Recommended.
B. p95 <= 30 seconds.
C. No target.
D. Batch-only processing.
E. Defer latency.
X. Other (please specify)

[Answer]: A

## Q2 - Security

What security controls are mandatory?

A. Producer/consumer service identity, Kafka ACL hooks, schema/auth metadata, correlation ID, deduplication/staleness keys, and no direct database access. Recommended.
B. Broker network trust only.
C. No auth for status events.
D. UI auth only.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Scale

What first-release status-event scale should be supported?

A. At least 10,000 status events, 2,000 duplicate cases, 2,000 stale/out-of-order cases, and 5,000 Booking lifecycle updates in local/CI evidence. Recommended.
B. Demo events only.
C. Unlimited no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability controls are required?

A. CMM recoverable status publication, Schema Registry compatibility, message-pact, Booking deduplication/staleness checks, idempotent lifecycle update, and explicit exception handling. Recommended.
B. Best-effort publish.
C. Direct DB update.
D. Manual status entry only.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. CMM/Booking Spring services with Kafka, Avro, AsyncAPI, Schema Registry, message-pact fixtures, PostgreSQL deduplication/update state, and local Docker evidence. Recommended.
B. Shared database trigger.
C. UI polling CMM directly for lifecycle updates.
D. Mock event broker.
E. Defer stack.
X. Other (please specify)

[Answer]: A

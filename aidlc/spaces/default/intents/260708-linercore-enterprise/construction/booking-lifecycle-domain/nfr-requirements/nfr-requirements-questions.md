# NFR Requirements Questions - booking-lifecycle-domain

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Booking Command Performance

What latency should booking command/query operations target?

A. p95 <= 300 ms for draft/query operations, p95 <= 1 second for confirm/reconfirm excluding external pricing/validation calls, and async continuation for longer orchestration. Recommended.
B. p95 <= 2 seconds for all operations.
C. No performance targets.
D. UI perceived speed only.
E. Defer to Operation.
X. Other (please specify)

[Answer]: A

## Q2 - Booking Security

What security controls are mandatory?

A. Keycloak/JWT auth, capability authorization, service-to-service auth for Charge/CMM seams, audit on lifecycle/pricing/override actions, and no cross-service database joins. Recommended.
B. User auth only.
C. Route hiding only.
D. Network trust only.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Booking Scale

What first-release booking scale should be supported?

A. At least 10,000 bookings, 25,000 booking revisions, 5,000 exception records, and 1,000 lifecycle events in seeded local/CI validation. Recommended.
B. Demo data only.
C. Unlimited with no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability posture should booking lifecycle use?

A. Database-backed idempotency, transactional outbox for confirmation/revision events, deduplicated consumers, explicit exception queues, and fail-closed boundary checks. Recommended.
B. Best-effort events.
C. In-memory idempotency.
D. Manual recovery only.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. New `booking-service` on Java 21/Spring Boot 3.3.7/Maven/PostgreSQL, OpenAPI, Kafka/Avro/Schema Registry, Pact/message-pact, and existing auth/runtime foundations. Recommended.
B. Implement booking in frontend only.
C. Store booking in Charge database.
D. Use documents only.
E. Defer stack.
X. Other (please specify)

[Answer]: A

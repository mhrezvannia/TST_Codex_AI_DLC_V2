# NFR Requirements Questions - container-movement-domain

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Movement Performance

What movement API/status targets should CMM meet?

A. p95 <= 300 ms for journey/status query, p95 <= 500 ms for movement capture/validation, and p95 <= 1 second for status derivation under seeded local load. Recommended.
B. p95 <= 2 seconds for all operations.
C. No target.
D. UI-only target.
E. Defer performance.
X. Other (please specify)

[Answer]: A

## Q2 - Security

What security controls are mandatory?

A. Keycloak/JWT auth, capability checks, service identity for booking events/status publication, audit for movement capture/status changes, and no Booking/Charge database access. Recommended.
B. Network trust only.
C. UI checks only.
D. No auth for movement capture.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Scale

What first-release CMM scale should be supported?

A. At least 10,000 journeys, 100,000 movement events, 25,000 status snapshots, and 10,000 duplicate/out-of-order event scenarios in local/CI evidence. Recommended.
B. Demo data only.
C. Unlimited with no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability posture should CMM use?

A. Database-backed deduplication, ordering/staleness checks, idempotent event handling, transactional status publication, and fail-closed boundary checks. Recommended.
B. Best-effort status events.
C. In-memory deduplication.
D. Manual reconciliation only.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. New `container-movement-service` on Java/Spring Boot/PostgreSQL with OpenAPI, Kafka/Avro/AsyncAPI/Schema Registry, and message-pact evidence. Recommended.
B. Implement CMM in Booking.
C. Use frontend-only movement state.
D. Use documents only.
E. Defer stack.
X. Other (please specify)

[Answer]: A

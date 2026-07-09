# NFR Requirements Questions - dnd-pricing-integration

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - D&D Integration Performance

What latency should the D&D request/result seam target?

A. p95 <= 2 seconds from Booking boundary trigger to stored D&D result for standard cases under seeded local load. Recommended.
B. p95 <= 10 seconds.
C. No target.
D. Manual fallback only.
E. Defer performance.
X. Other (please specify)

[Answer]: A

## Q2 - Security

What security controls are mandatory?

A. Service-to-service JWT/RS256, Booking user/action context, idempotency key, correlation ID, audit for trigger/result/manual fallback, and no Booking-owned D&D calculation. Recommended.
B. Network trust only.
C. UI checks only.
D. No service auth.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Scale

What first-release D&D scale should be supported?

A. At least 5,000 D&D requests/results, 2,000 manual fallback cases, and 20 Pact interactions in local/CI evidence. Recommended.
B. Demo data only.
C. Unlimited no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability controls are required?

A. Timeout, bounded retry, circuit breaker, database-backed idempotency, auditable trigger/result snapshot, manual fallback exception, and Pact verification. Recommended.
B. Retry indefinitely.
C. Best-effort call.
D. Manual D&D only.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. Booking and Charge Spring services with OpenAPI, HTTP Pact, PostgreSQL idempotency/snapshots, and local runtime evidence. Recommended.
B. Shared database integration.
C. CMM calculates D&D.
D. Mock D&D service.
E. Defer stack.
X. Other (please specify)

[Answer]: A

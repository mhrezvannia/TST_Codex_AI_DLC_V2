# NFR Requirements Questions - booking-charge-pricing-integration

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Pricing Seam Performance

What latency should the Booking -> Charge pricing seam target?

A. p95 <= 1.5 seconds end-to-end for successful pricing orchestration, with Charge calculation budget owned by Charge and Booking snapshot persistence included. Recommended.
B. p95 <= 5 seconds.
C. No target.
D. Manual pricing replaces latency targets.
E. Defer performance.
X. Other (please specify)

[Answer]: A

## Q2 - Security

What security controls are mandatory?

A. Service-to-service JWT/RS256, Booking user/capability context propagation, idempotency key, correlation ID, denied-path evidence, and no direct database access. Recommended.
B. Network trust only.
C. User token only.
D. No service auth.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Scale

What first-release integration scale should be supported?

A. At least 10,000 pricing requests, 2,000 failure/manual-fallback cases, and 20 Pact interactions in local/CI evidence. Recommended.
B. Demo data only.
C. Unlimited no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability controls are required?

A. Timeout, bounded retry, circuit breaker, database-backed idempotency, auditable snapshot, manual fallback exception, Pact verification, and no fake readiness. Recommended.
B. Retry indefinitely.
C. Best-effort call.
D. Manual pricing only.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. Booking and Charge Spring services with OpenAPI, HTTP Pact, typed clients where useful, PostgreSQL idempotency/snapshots, and local runtime evidence. Recommended.
B. Shared database integration.
C. Frontend calls Charge directly.
D. Mock pricing service.
E. Defer stack.
X. Other (please specify)

[Answer]: A

# NFR Design Questions - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define booking command/query budgets, authorization and audit controls, scale baseline, idempotency, outbox, exception queues, stale revision behavior, and the greenfield `booking-service` stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Database-backed idempotency, transactional outbox, deduplication, stale revision rejection, and explicit exception queues. |
| Scalability | First release supports 10,000 bookings, 25,000 revisions, 5,000 exceptions, 1,000 lifecycle events, and 50 concurrent users. |
| Performance | Draft commands p95 <= 300 ms, query by ID p95 <= 200 ms, search p95 <= 500 ms, confirmation p95 <= 1 second excluding external calls. |
| Security | Keycloak/JWT, capability checks, service-to-service auth, audit, database isolation, and strict Booking/Charge/CMM ownership boundaries. |
| Logical boundaries | Booking owns lifecycle state and orchestration records, not pricing calculations, D&D rates/free time, or movement status. |

## Ambiguity Analysis

No blocking ambiguity was found. Integration-specific timeout, retry, and circuit-breaker values are intentionally left to the Booking/Charge/CMM integration units while this unit records pending/exception state.

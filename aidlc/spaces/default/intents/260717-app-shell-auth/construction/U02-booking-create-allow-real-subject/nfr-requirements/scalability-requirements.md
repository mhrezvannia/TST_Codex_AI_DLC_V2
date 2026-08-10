# Scalability Requirements - U02 Booking Create Allow

## Source Context

These scalability requirements consume U02 `business-logic-model.md`, U02 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U02 adds a write path but should not change the system's scaling topology.

## Scaling Requirements

| ID | Requirement | Rationale |
| --- | --- | --- |
| SCALE-01 | Authorization state remains in identity-service/catalog, not shell memory. | Supports stateless shell/BFF scaling. |
| SCALE-02 | Create idempotency and persistence remain owned by booking-service. | Avoids shell-owned domain state. |
| SCALE-03 | U02 must not add new client global stores, background polling, cache layers, or cloud scaling components. | Keeps walking-skeleton Bolt bounded. |
| SCALE-04 | Create/detail implementation preserves existing pagination/read paths and does not add unbounded list reloads after create. | Prevents avoidable load growth. |

## Load Assumptions

U02 validates single-user local create/detail proof. Production write throughput and autoscaling are deferred. Implementation should remain request-scoped and horizontally scalable by avoiding in-process user/session/authorization caches.

## Escalation Triggers

- Authorization calls exceed the local 5 second create path budget outside cold start.
- Implementation adds cross-request mutable actor or authorization state.
- Create success requires broad reloads of unrelated modules or unbounded Booking data.

# Scalability Requirements - U04 Sign-Out and Session Expiry Guard

## Source Context

These scalability requirements consume U04 `business-logic-model.md`, U04 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U04 preserves stateless session validation and request-scoped BFF actor guards.

## Scaling Requirements

| ID | Requirement | Rationale |
| --- | --- | --- |
| SCALE-01 | Shell session authority remains the server-readable cookie/session, not client global state. | Supports horizontal scaling and stale-state prevention. |
| SCALE-02 | Booking BFF stale-call guard is request-scoped and does not require shared cache. | Avoids new bottlenecks. |
| SCALE-03 | Sign-out does not introduce polling, background workers, or new runtime services. | Keeps W2-01 bounded. |
| SCALE-04 | The guard covers read and proxy paths consistently: `proxyBooking`, `loadBookings`, `loadBooking`. | Prevents fragmented scaling/fan-in risks. |

## Load Assumptions

U04 validates single-user local proof. Production logout throughput is outside this unit, but design must remain stateless and horizontally scalable.

## Escalation Triggers

- Sign-out depends on in-memory session authority.
- BFF missing-actor guard requires a cross-request cache.
- Post-sign-out UI starts polling protected Booking APIs.

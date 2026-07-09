# Infrastructure Design Questions - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required for this Construction unit. Prior stages already resolve the Booking Service, PostgreSQL booking database, transactional outbox, idempotency, Charge/CMM seams, exception queues, audit, and service-boundary posture.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Greenfield Booking Service runs as a Spring Boot service in `app`/`full` profiles. |
| Compute | Stateless command/query API with database-backed lifecycle, idempotency, exceptions, outbox, and consumer state. |
| Storage | `booking` logical database/user with bookings, revisions, pricing snapshots, exceptions, idempotency, outbox, audit, and consumed-event records. |
| Networking | OpenAPI routes through nginx; synchronous Charge pricing/D&D APIs; Kafka producer/consumer for Booking/CMM events. |
| Monitoring | Command/query latency, confirmation events, Charge seam states, CMM event conflicts, exception queues, outbox lag, and audit health. |
| Security | JWT/capability enforcement, service identity, no cross-service DB joins, and durable denied/sensitive audit. |
| Scaling | Booking/revision/exception/event/concurrent-user scale through indexed tables, pagination, idempotency, and partitioned health. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact route paths, table/index names, topic names, schema subjects, retry timings, and exception status codes are implementation details constrained by this design.

# Infrastructure Design Questions - container-movement-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required for this Construction unit. Prior stages already resolve the CMM Service, container movement database, DCSA validation, movement facts, status projection, deduplication, ordering, Kafka publication, and boundary posture.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Greenfield CMM Service runs as a Spring Boot service in `app`/`full` profiles. |
| Compute | Stateless API/consumer service with database-backed journeys, movements, snapshots, dedupe, outbox, and audit. |
| Storage | `container_movement` logical database/user for journeys, expected movements, movement facts, status snapshots, exceptions, consumed events, outbox, and audit. |
| Networking | OpenAPI routes through nginx; Kafka consumer for booking context and producer for `containermovement.status`. |
| Monitoring | Journey/status latency, movement validation, ordering conflicts, dedupe, outbox lag, schema compatibility, and audit health. |
| Security | JWT/capability enforcement, service identity, event security, no Booking/Charge database access, and durable audit. |
| Scaling | Indexed journey/status/history paths, materialized snapshots, dedupe keys, paginated history, and partitioned event health. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact topic names, schema subjects, table/index names, ordering policy thresholds, and status route names are implementation details constrained by this design.

# Infrastructure Design Questions - shared-platform-reference-events

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required for this Construction unit. Prior stages already resolve the Reference Data Service, PostgreSQL outbox, Kafka, Schema Registry, OpenAPI/Avro, audit, validation API, and health posture.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Reference Data Service runs as a Spring Boot service in local `app`/`full`, backed by PostgreSQL, Kafka, and Schema Registry from `core`. |
| Compute | Stateless API/service container plus independently scalable outbox publisher workers. |
| Storage | `reference_data` logical database/user with reference records, history, audit context, and transactional outbox tables. |
| Networking | API routes through nginx and service calls; Kafka publishes reference-data changed events. |
| Monitoring | Lookup/mutation latency, outbox lag, publisher status, schema compatibility, audit, and health evidence. |
| Security | Capability-gated admin/history APIs, service identity for validation APIs, producer identity for events, and no direct consumer DB access. |
| Scaling | Indexed validation/read paths, paginated history, claim/lease outbox batches, and consumer-side versioned caches. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact table/index names, topic names, schema subjects, batch sizes, retry timings, and route names are implementation details constrained by this design.

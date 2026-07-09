# Scalability Design - shared-platform-reference-events

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reference Data must support enterprise validation for Charge, Booking, CMM, Enterprise Web, and operations without collapsing service ownership boundaries.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Reference sets | At least 50 active sets. |
| Active reference records | At least 10,000. |
| History rows | At least 100,000. |
| Changed events | At least 10,000 in local/CI evidence. |
| Consumer modules | Charge, Booking, CMM, Enterprise Web, operations workflows. |

## Data Partitioning And Query Shape

Reference queries partition by reference set, record key/code, version, effective date, status, and owner. History queries are paginated and filterable by reference set, record, lifecycle action, actor, and time range. Outbox processing partitions by event type, aggregate id, sequence, and claim status.

## Publisher Scaling

The outbox publisher scales independently from command/API handling through claim/lease batches. Each event carries deduplication keys so at-least-once publish does not become duplicate business state for consumers.

## Growth Controls

| Trigger | Design response |
|---|---|
| Reference sets exceed 50 | Review index selectivity and set-level ownership conventions. |
| Active records exceed 10,000 | Add pagination and cacheable validation read model if p95 targets slip. |
| History rows exceed 100,000 | Enforce pagination and retention/archive policy. |
| Changed events exceed 10,000 evidence rows | Tune outbox batch size, lease timeout, and publisher metrics. |
| New consumer module | Add service identity, validation contract, and no-direct-database-access tests. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements set, record, history, changed-event, and consumer-module baselines. |
| `performance-requirements.md` | Uses indexed lookups, paginated history, and independent publisher scale to preserve latency and throughput. |
| `security-requirements.md` | Scales service access, audit, event identity, and database boundary controls across consumers. |
| `reliability-requirements.md` | Uses outbox claim/lease and deduplication to avoid lost or duplicated business effects. |
| `tech-stack-decisions.md` | Uses Reference Data Service, PostgreSQL, Kafka, Schema Registry, Avro, OpenAPI, Java/Spring, and Keycloak/JWT. |
| `business-logic-model.md` | Implements lifecycle, validation, event, outbox, and health workflows. |

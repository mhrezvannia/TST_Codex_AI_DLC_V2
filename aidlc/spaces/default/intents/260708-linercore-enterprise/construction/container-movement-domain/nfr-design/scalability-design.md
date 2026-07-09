# Scalability Design - container-movement-domain

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

CMM must support realistic first-release movement history and status derivation volume without redesign.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Journeys | At least 10,000. |
| Movement events | At least 100,000 planned, estimated, and actual records. |
| Status snapshots | At least 25,000. |
| Duplicate/out-of-order scenarios | At least 10,000 evidence cases. |
| Concurrent users | At least 50 local simulated users. |

## Data Partitioning

| Data area | Index/filter strategy |
|---|---|
| Journey | Booking id/revision, equipment, status, route, date, and owner. |
| Movement facts | Journey, equipment, event type, location, source event id, event time, received time. |
| Status snapshots | Journey, equipment, status, version, and timestamp. |
| Deduplication | Stable event identity, source, schema version, event time, and payload hash. |
| Publication outbox | Aggregate id, event type, sequence, claim status, and age. |

## Growth Controls

| Trigger | Design response |
|---|---|
| Movement history p95 exceeds 500 ms | Enforce pagination and add targeted history indexes. |
| Status derivation exceeds 1 second | Use incremental derivation from current snapshot and newest fact. |
| Duplicate/out-of-order cases grow | Tune deduplication indexes and exception queue filters. |
| Publication lag grows | Tune outbox batch/lease and expose lag health. |
| Concurrent users exceed baseline | Verify snapshot query and movement write contention. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements journey, movement, status snapshot, duplicate/out-of-order, and concurrent user baselines. |
| `performance-requirements.md` | Uses snapshots, incremental derivation, and paginated history to preserve latency targets. |
| `security-requirements.md` | Scales capability, event identity, audit, and database boundary enforcement. |
| `reliability-requirements.md` | Keeps deduplication, ordering, idempotency, and publication evidence indexed and queryable. |
| `tech-stack-decisions.md` | Uses CMM Service, PostgreSQL, Kafka/Avro/AsyncAPI/Schema Registry, OpenAPI, message-pact, Java/Spring, and Keycloak/JWT. |
| `business-logic-model.md` | Implements journey, expected movement, movement capture, validation, status derivation, and publication workflows. |

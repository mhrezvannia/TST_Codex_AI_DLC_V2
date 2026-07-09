# Scalability Design - movement-status-booking-integration

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The integration must handle first-release status-event volume, duplicate events, stale events, and lifecycle updates.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Status events | At least 10,000 `containermovement.status` events. |
| Duplicate cases | At least 2,000 cases. |
| Stale/out-of-order cases | At least 2,000 cases. |
| Booking lifecycle updates | At least 5,000 updates. |
| Message-pact fixtures | Happy path, duplicate, stale, invalid payload, and auth/context failure cases. |

## Data Partitioning

| Data area | Index/filter strategy |
|---|---|
| CMM status outbox | Journey/status identity, event type, claim status, age, schema version. |
| Kafka evidence | Topic, partition, offset, event id, schema version, producer, correlation ID. |
| Booking deduplication | Event id, status identity, booking id, booking revision, payload hash. |
| Lifecycle updates | Booking id, revision, status input, update result, D&D trigger evidence, timestamp. |
| Quarantine/exception | Stale reason, ordering key, owner, age, correlation ID. |

## Growth Controls

| Trigger | Design response |
|---|---|
| Status event lag grows | Tune CMM publisher and Booking consumer batch/lease settings. |
| Duplicate/stale cases grow | Validate dedup and ordering indexes plus quarantine filtering. |
| Lifecycle update p95 exceeds 1 second | Add current-state projection and targeted Booking indexes. |
| Message-pact fixtures grow | Group fixtures by happy, duplicate, stale, invalid, and auth/context behavior. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements status event, duplicate, stale/out-of-order, lifecycle update, and message-pact baselines. |
| `performance-requirements.md` | Uses indexed outbox, deduplication, lifecycle update, and quarantine paths to preserve latency targets. |
| `security-requirements.md` | Scales identity, metadata, audit, and boundary controls. |
| `reliability-requirements.md` | Keeps publication, compatibility, message-pact, deduplication, staleness, and update evidence queryable. |
| `tech-stack-decisions.md` | Uses CMM producer, Booking consumer, Kafka, Avro, AsyncAPI, Schema Registry, message-pact, PostgreSQL, and Docker Compose. |
| `business-logic-model.md` | Implements status publish/consume and lifecycle update workflow. |

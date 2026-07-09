# Scalability Design - booking-confirmed-journey-integration

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The integration must handle first-release confirmation and amendment volume plus replay/deduplication evidence.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| `booking.confirmed` events | At least 10,000 in local/CI evidence. |
| Amendment/revision events | At least 2,000. |
| Duplicate/replay cases | At least 2,000. |
| CMM journey records affected | At least 10,000 creations/reconciliations. |
| Message-pact fixtures | Happy path, duplicate, stale revision, schema incompatibility, and auth/context failure cases. |

## Data Partitioning

| Data area | Index/filter strategy |
|---|---|
| Booking outbox | Aggregate id, event type, booking revision, claim status, and age. |
| Kafka event evidence | Topic, partition, offset, event id, schema version, producer, and correlation ID. |
| CMM deduplication | Event id, booking id, booking revision, source, schema version, and payload hash. |
| Journey reconciliation | Booking id, booking revision, journey id, reconciliation status, and timestamp. |
| Message-pact evidence | Interaction type, schema version, status, producer, consumer, and fixture hash. |

## Growth Controls

| Trigger | Design response |
|---|---|
| Publish lag exceeds target | Tune outbox batch, lease, and poll interval. |
| Consumer lag grows | Scale CMM consumer workers and inspect deduplication index contention. |
| Duplicate/replay cases grow | Validate dedup indexes and replay tooling. |
| Journey reconciliation slows | Add targeted journey lookup indexes by booking id/revision. |
| Message-pact fixture set grows | Split fixtures by success, duplicate, stale, schema, and auth groups. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements event, revision, duplicate/replay, journey, and message-pact scale. |
| `performance-requirements.md` | Uses indexed outbox, deduplication, and journey reconciliation to preserve latency targets. |
| `security-requirements.md` | Scales identity, metadata, schema, audit, and boundary controls across event volume. |
| `reliability-requirements.md` | Keeps outbox, compatibility, message-pact, deduplication, and retry visibility queryable. |
| `tech-stack-decisions.md` | Uses Kafka, Avro, AsyncAPI, Schema Registry, message-pact, PostgreSQL, Spring, and Docker Compose. |
| `business-logic-model.md` | Implements event publish/consume and journey creation/reconciliation workflow. |

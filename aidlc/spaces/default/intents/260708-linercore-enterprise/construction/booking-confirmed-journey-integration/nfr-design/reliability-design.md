# Reliability Design - booking-confirmed-journey-integration

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability means confirmation events are durable, compatible, deduplicated, and reconciled deterministically by CMM.

## Reliability Patterns

| Control | Design |
|---|---|
| Outbox | Booking writes `booking.confirmed` through transactional outbox. |
| Compatibility | Avro/AsyncAPI/Schema Registry compatibility blocks readiness when red or stale. |
| Message-pact | Producer/consumer fixtures cover success, duplicate, stale revision, schema incompatibility, auth/context failure, and invalid payloads. |
| Deduplication | CMM deduplicates by event ID, booking id, booking revision, source, and payload hash. |
| Reconciliation | CMM reconciles changed bookingRevision deterministically. |
| Retry visibility | Publish and consume failures appear in logs, metrics, health, and readiness evidence. |

## Failure Handling

| Failure | Behavior |
|---|---|
| Kafka unavailable | Preserve outbox and expose publish blocker. |
| Schema incompatible | Block publish/readiness until contract is fixed. |
| Duplicate event | Ignore or return prior journey result with duplicate evidence. |
| Stale revision | Preserve evidence and apply stale-revision rule. |
| CMM processing failure | Keep event retryable and surface exception/readiness blocker. |

## Recovery Model

Outbox and consumer processing are replay-safe. Replay never creates a second journey for the same booking revision; it reuses the existing journey or records duplicate evidence.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements outbox, compatibility, message-pact, deduplication, reconciliation, retry visibility, and failure behavior. |
| `performance-requirements.md` | Keeps publish, delivery, consume, and journey readiness within measurable budgets. |
| `security-requirements.md` | Preserves producer/consumer identity, event metadata, schema context, audit, and boundaries. |
| `scalability-requirements.md` | Supports event, revision, duplicate/replay, journey, and message-pact evidence volumes. |
| `tech-stack-decisions.md` | Uses Kafka, Schema Registry, Avro, message fixtures, PostgreSQL, Spring, and Docker Compose. |
| `business-logic-model.md` | Implements outbox, publish, consume, deduplicate, reconcile, and journey workflows. |

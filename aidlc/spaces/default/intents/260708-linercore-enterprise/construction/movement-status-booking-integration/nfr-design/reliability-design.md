# Reliability Design - movement-status-booking-integration

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability means CMM status events are compatible and recoverable, and Booking lifecycle updates are idempotent and ordering-aware.

## Reliability Patterns

| Control | Design |
|---|---|
| Publication | CMM status publication is recoverable and visible in readiness evidence. |
| Compatibility | Avro/AsyncAPI/Schema Registry compatibility blocks readiness when red or stale. |
| Message-pact | Producer/consumer fixtures cover success, duplicate, stale, invalid payload, auth/context failure, and lifecycle conflict. |
| Deduplication | Booking deduplicates by event ID, status identity, booking id, revision, and payload hash. |
| Staleness | Booking rejects or quarantines stale/out-of-order status events deterministically. |
| Lifecycle update | Booking updates lifecycle idempotently and records D&D trigger input evidence. |

## Failure Handling

| Failure | Behavior |
|---|---|
| Kafka unavailable | Preserve publish evidence and expose blocker. |
| Schema incompatible | Block publish/readiness until contract fixed. |
| Duplicate event | Ignore/reuse prior result with duplicate evidence. |
| Stale event | Apply stale rule and surface exception where needed. |
| Booking update conflict | Preserve event evidence and open exception. |

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements recoverable publication, compatibility, message-pact, deduplication, staleness, idempotent update, and failure behavior. |
| `performance-requirements.md` | Keeps publish, consume, lifecycle update, and end-to-end budgets measurable. |
| `security-requirements.md` | Preserves producer/consumer identity, metadata, audit, boundaries, and database isolation. |
| `scalability-requirements.md` | Supports status, duplicate, stale, lifecycle update, and fixture evidence volumes. |
| `tech-stack-decisions.md` | Uses Kafka, Schema Registry, Avro, message fixtures, PostgreSQL, Spring, and Docker Compose. |
| `business-logic-model.md` | Implements status publish/consume, deduplication, staleness, lifecycle, and evidence workflow. |

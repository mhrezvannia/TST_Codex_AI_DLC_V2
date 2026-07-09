# Reliability Requirements - movement-status-booking-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability means CMM status events are compatible and recoverable, and Booking lifecycle updates are idempotent and ordering-aware.

## Reliability Controls

| Control | Requirement |
|---|---|
| Publication | CMM status publication is recoverable and visible in readiness evidence. |
| Compatibility | Avro/AsyncAPI/Schema Registry compatibility blocks readiness when red/stale. |
| Message-pact | Producer/consumer fixtures cover success, duplicate, stale, invalid payload, and auth/context failures. |
| Deduplication | Booking deduplicates by event ID/status identity. |
| Staleness | Booking rejects or quarantines stale/out-of-order status events deterministically. |
| Lifecycle update | Booking updates lifecycle idempotently and records D&D trigger input evidence. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Kafka unavailable | Preserve publish evidence and expose blocker. |
| Schema incompatible | Block publish/readiness until contract fixed. |
| Duplicate event | Ignore/reuse prior result with duplicate evidence. |
| Stale event | Apply stale rule and surface exception where needed. |
| Booking update conflict | Preserve event evidence and open exception. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines status publish/consume, deduplication, staleness, lifecycle, and evidence workflow. |
| `business-rules.md` | Defines evidence and boundary rules. |
| `requirements.md` | Supplies FR-BKG-008/009, FR-CMM-007, NFR-REL-002, and NFR-COMP-001. |
| `technology-stack.md` | Supplies Kafka, Schema Registry, Avro, message fixtures, PostgreSQL, and Spring context. |
| `nfr-requirements-questions.md` | Q4 sets reliability controls. |

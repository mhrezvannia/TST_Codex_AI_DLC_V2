# Reliability Requirements - booking-confirmed-journey-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability means confirmation events are durable, compatible, deduplicated, and reconciled deterministically by CMM.

## Reliability Controls

| Control | Requirement |
|---|---|
| Outbox | Booking writes `booking.confirmed` through transactional outbox. |
| Compatibility | Avro/AsyncAPI/Schema Registry compatibility blocks readiness when red/stale. |
| Message-pact | Producer/consumer fixtures cover success, duplicate, stale revision, and invalid payloads. |
| Deduplication | CMM deduplicates by event ID and booking revision. |
| Reconciliation | CMM reconciles changed bookingRevision deterministically. |
| Retry visibility | Publish/consume failures are visible in logs, metrics, and readiness evidence. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Kafka unavailable | Preserve outbox and expose publish blocker. |
| Schema incompatible | Block publish/readiness until contract fixed. |
| Duplicate event | Ignore or return prior journey result with duplicate evidence. |
| Stale revision | Preserve evidence and apply stale-revision rule. |
| CMM processing failure | Keep event retryable and surface exception/readiness blocker. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines outbox, publish, consume, deduplicate, reconcile, and journey workflows. |
| `business-rules.md` | Defines evidence and boundary rules. |
| `requirements.md` | Supplies FR-BKG-006, FR-CMM-001, NFR-REL-002, and NFR-COMP-001. |
| `technology-stack.md` | Supplies Kafka, Schema Registry, Avro, message fixtures, PostgreSQL, and Spring context. |
| `nfr-requirements-questions.md` | Q4 sets reliability controls. |

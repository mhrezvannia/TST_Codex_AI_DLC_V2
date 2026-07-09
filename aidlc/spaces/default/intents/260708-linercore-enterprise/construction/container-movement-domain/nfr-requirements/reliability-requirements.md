# Reliability Requirements - container-movement-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

CMM reliability means movement facts are durable, duplicate and out-of-order events are handled deterministically, and status publication is recoverable.

## Reliability Controls

| Control | Requirement |
|---|---|
| Deduplication | Database-backed event identity and deduplication for consumed and captured movement events. |
| Ordering | Staleness and ordering checks for movement events and booking revision reconciliation. |
| Idempotency | Idempotent event handling for `booking.confirmed` and repeated movement submissions. |
| Publication | Transactional status publication or equivalent recoverable publish evidence. |
| Boundary checks | Reject requests that require Booking lifecycle mutation or D&D/pricing calculation. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Duplicate event | Return/reuse prior accepted result and mark duplicate evidence. |
| Late event | Preserve fact, apply deterministic status derivation or exception. |
| Out-of-order event | Apply ordering rules and emit exception where status cannot be safely updated. |
| Invalid DCSA fields | Reject with validation errors and audit evidence. |
| Kafka/Schema Registry unavailable | Preserve status/outbox evidence and expose publish blocker. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines movement capture, validation, status derivation, and publication workflows. |
| `business-rules.md` | Defines validation and boundary rules. |
| `requirements.md` | Supplies FR-CMM-005 through FR-CMM-007, NFR-REL, and NFR-OBS. |
| `technology-stack.md` | Supplies PostgreSQL, Kafka, Schema Registry, Avro, and Java/Spring context. |
| `nfr-requirements-questions.md` | Q4 sets CMM reliability posture. |

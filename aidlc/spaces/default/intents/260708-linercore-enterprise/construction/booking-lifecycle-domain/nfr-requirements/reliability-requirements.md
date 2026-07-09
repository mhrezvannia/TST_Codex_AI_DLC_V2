# Reliability Requirements - booking-lifecycle-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Booking reliability means lifecycle state is durable, idempotent, auditable, and recoverable across pricing, confirmation, amendment, movement-status, and D&D-trigger paths.

## Reliability Controls

| Control | Requirement |
|---|---|
| Idempotency | Database-backed idempotency for create/update/confirm/pricing/D&D request commands. |
| Outbox | Transactional outbox for booking confirmation and revision events. |
| Consumer deduplication | Deduplicate consumed movement status or related events. |
| Exception queues | Pricing, capacity, movement, D&D, and contract failures surface as explicit exceptions. |
| Boundary checks | Fail closed when a command asks Booking to calculate Charge/CMM-owned outcomes. |
| Audit | Lifecycle and override actions are durably audited. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Charge unavailable | Record pricing/D&D request state and open exception or retry per integration policy. |
| Capacity adapter unavailable | Open operational validation exception. |
| Duplicate command | Return prior accepted result where idempotency key matches. |
| Stale revision | Reject with stale-version error. |
| Movement status conflict | Preserve event evidence and open exception where lifecycle update cannot apply. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines pricing orchestration, confirmation, amendments, exceptions, and D&D trigger workflows. |
| `business-rules.md` | Defines validation, boundary, and evidence rules. |
| `requirements.md` | Supplies FR-BKG, NFR-REL-001, NFR-REL-002, and NFR-OBS-001. |
| `technology-stack.md` | Supplies PostgreSQL, Kafka, Schema Registry, Java/Spring, and contracts context. |
| `nfr-requirements-questions.md` | Q4 sets reliability posture. |

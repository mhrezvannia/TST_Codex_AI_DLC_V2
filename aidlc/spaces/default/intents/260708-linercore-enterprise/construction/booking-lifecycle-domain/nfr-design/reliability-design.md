# Reliability Design - booking-lifecycle-domain

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Booking reliability means lifecycle state is durable, idempotent, auditable, and recoverable across pricing, confirmation, amendment, movement-status, and D&D-trigger paths.

## Reliability Patterns

| Pattern | Design |
|---|---|
| Idempotency | Database-backed idempotency for create, update, confirm, pricing request, D&D request, and amendment commands. |
| Transactional outbox | Booking confirmation and revision events are written with lifecycle state in one transaction. |
| Consumer deduplication | Movement status and related events are deduplicated by event id, aggregate id, schema version, and producer. |
| Exception queues | Pricing, capacity, movement, D&D, and contract failures become explicit queue records. |
| Boundary checks | Commands requiring Charge/CMM-owned calculations fail closed or open integration exceptions. |
| Audit | Lifecycle, override, exception, and integration state changes are durably audited. |

## Failure Handling

| Failure | Behavior |
|---|---|
| Charge unavailable | Record pricing/D&D request state and open retryable exception per integration policy. |
| Capacity adapter unavailable | Open operational validation exception. |
| Duplicate command | Return prior accepted result when idempotency key and request hash match. |
| Stale revision | Reject with stale-version error. |
| Movement status conflict | Preserve event evidence and open exception where lifecycle update cannot apply. |
| Outbox publish failure | Preserve outbox row, retry, and expose lag/blocker health. |

## State Consistency

Booking lifecycle transitions use optimistic revision checks. Confirmation and reconfirmation require current revision, valid pricing state, no blocking exceptions, and valid authorization. Amendments create new revisions rather than mutating historical state.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements idempotency, transactional outbox, deduplication, exception queues, boundary checks, audit, and failure handling. |
| `performance-requirements.md` | Uses fast state recording and exception queues instead of indefinite synchronous waits. |
| `security-requirements.md` | Preserves authorization, service identity, audit, duplicate-command protection, and cross-domain boundaries. |
| `scalability-requirements.md` | Keeps idempotency, outbox, exception, revision, and audit stores queryable at baseline scale. |
| `tech-stack-decisions.md` | Uses PostgreSQL, Kafka, Avro/AsyncAPI, Schema Registry, OpenAPI, Pact/message-pact, Java/Spring, and Keycloak/JWT. |
| `business-logic-model.md` | Implements pricing orchestration, confirmation, amendments, exceptions, D&D triggers, and audit workflows. |

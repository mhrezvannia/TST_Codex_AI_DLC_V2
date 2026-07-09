# Reliability Design - container-movement-domain

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

CMM reliability means movement facts are durable, duplicate and out-of-order events are handled deterministically, and status publication is recoverable.

## Reliability Patterns

| Pattern | Design |
|---|---|
| Deduplication | Store stable event identity, source, schema version, received time, event time, and payload hash for consumed and captured events. |
| Ordering | Apply staleness and ordering checks using journey, booking revision, event time, and movement type precedence. |
| Idempotency | Repeated `booking.confirmed` events and movement submissions return/reuse prior accepted result where applicable. |
| Publication | Status snapshots publish through transactional outbox or equivalent recoverable publish evidence. |
| Boundary checks | Reject requests requiring Booking lifecycle mutation, D&D relevance decisions, or pricing calculation. |

## Failure Handling

| Failure | Behavior |
|---|---|
| Duplicate event | Return/reuse prior accepted result and mark duplicate evidence. |
| Late event | Preserve fact and apply deterministic status derivation or exception. |
| Out-of-order event | Apply ordering rules and emit exception where status cannot be safely updated. |
| Invalid DCSA fields | Reject with validation errors and audit evidence. |
| Kafka/Schema Registry unavailable | Preserve status/outbox evidence and expose publish blocker. |

## Status Consistency

The current status snapshot is derived from accepted movement facts and booking revision context. Movement facts are never discarded solely because they arrive late; they are either applied by ordering rules or preserved with an exception state.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements deduplication, ordering, idempotency, recoverable publication, boundary checks, and failure handling. |
| `performance-requirements.md` | Uses materialized snapshots and incremental derivation rather than replaying full history. |
| `security-requirements.md` | Preserves identity, capability, event security, audit, and database boundary behavior. |
| `scalability-requirements.md` | Supports movement volume, duplicate/out-of-order evidence, snapshots, and publication lag visibility. |
| `tech-stack-decisions.md` | Uses PostgreSQL, Kafka, Schema Registry, Avro/AsyncAPI, OpenAPI, message-pact, Java/Spring, and Keycloak/JWT. |
| `business-logic-model.md` | Implements movement capture, validation, status derivation, publication, history, and exception workflows. |

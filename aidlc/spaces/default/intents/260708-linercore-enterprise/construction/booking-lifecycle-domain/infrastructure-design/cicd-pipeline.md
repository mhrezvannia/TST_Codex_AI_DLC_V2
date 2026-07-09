# CI/CD Pipeline - booking-lifecycle-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Stages

| Stage | Gate |
|---|---|
| Build/unit tests | Booking state machine, commands, queries, idempotency, exceptions, and audit tests pass. |
| SAST/dependency/secret scan | Critical/high exploitable findings and secrets block merge. |
| OpenAPI contract tests | Booking command/query APIs are executable and provider-tested. |
| Pact tests | Booking consumer expectations for Charge pricing/D&D APIs pass. |
| Message contract tests | `booking.confirmed` producer and `containermovement.status` consumer schemas/fixtures pass. |
| Integration tests | Booking database, outbox, Charge seam, and CMM consumer behavior pass. |
| Denied-path tests | Protected booking actions enforce backend authorization and audit. |
| Readiness evidence | Outbox, idempotency, exception, audit, and seam evidence generated. |

## Blocking Rules

| Gate | Blocking rule |
|---|---|
| Ownership | Booking must not calculate prices, D&D rates/free time, or movement status. |
| No cross-service SQL | Booking may not query Charge or CMM databases. |
| Idempotency | Duplicate command handling must be deterministic. |
| Outbox | Lifecycle events must commit atomically with state changes. |
| Exceptions | Integration failures must surface as typed states, not hidden green completion. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests command/query, confirmation, exception, and integration budgets. |
| `security-design.md` | Enforces auth, service identity, audit, and boundary tests. |
| `scalability-design.md` | Validates booking/revision/event/exception/concurrent user scale. |
| `reliability-design.md` | Proves idempotency, outbox, dedupe, stale revision, exception, and audit behavior. |
| `logical-components.md` | Maps CI checks to Booking components. |
| `components.md` | Preserves Booking ownership boundaries. |
| `services.md` | Covers Booking, Charge, CMM, HTTP Pact, Kafka, Avro, and Schema Registry contracts. |
| `business-logic-model.md` | Covers booking lifecycle and exception workflows. |

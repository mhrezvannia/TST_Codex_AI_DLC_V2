# CI/CD Pipeline - container-movement-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Stages

| Stage | Gate |
|---|---|
| Build/unit tests | Journey, movement, DCSA validation, status derivation, dedupe, ordering, and audit tests pass. |
| SAST/dependency/secret scan | Critical/high exploitable findings and secrets block merge. |
| OpenAPI validation | Journey/movement/status APIs are executable. |
| Message contract tests | `booking.confirmed` consumer and `containermovement.status` producer schemas/fixtures pass. |
| Integration tests | PostgreSQL, Kafka, Schema Registry, outbox, consumer, and status projection pass. |
| Boundary tests | CMM does not mutate Booking, decide D&D relevance, calculate pricing, or query foreign databases. |

## Blocking Rules

| Gate | Blocking rule |
|---|---|
| Ownership | CMM owns movement status only; Booking/D&D/Pricing ownership must not leak in. |
| DCSA validation | Invalid movement facts cannot be accepted as green evidence. |
| Deduplication | Duplicate events/commands must produce deterministic evidence. |
| Ordering | Out-of-order facts must be applied deterministically or surfaced as exceptions. |
| Publication | Status events require recoverable outbox and schema compatibility evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests journey/status, movement capture, derivation, history, and throughput paths. |
| `security-design.md` | Enforces auth, event security, audit, boundaries, and DB isolation. |
| `scalability-design.md` | Validates journey, movement, snapshot, duplicate/out-of-order, and user scale. |
| `reliability-design.md` | Proves dedupe, ordering, idempotency, publication, and boundary behavior. |
| `logical-components.md` | Maps CI checks to CMM components. |
| `components.md` | Preserves CMM ownership. |
| `services.md` | Covers CMM, Booking events, OpenAPI, Kafka, Avro/AsyncAPI, Schema Registry, and message-pact. |
| `business-logic-model.md` | Covers journey, movement, DCSA validation, status derivation, and publication workflows. |

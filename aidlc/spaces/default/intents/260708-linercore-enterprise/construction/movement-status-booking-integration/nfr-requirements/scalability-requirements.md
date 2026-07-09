# Scalability Requirements - movement-status-booking-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The integration must handle first-release status-event volume, duplicate events, stale events, and lifecycle updates.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| Status events | At least 10,000 `containermovement.status` events. |
| Duplicate cases | At least 2,000 duplicate event cases. |
| Stale/out-of-order cases | At least 2,000 cases. |
| Booking lifecycle updates | At least 5,000 updates. |
| Message-pact fixtures | Happy path, duplicate, stale, invalid payload, and auth/context failure cases. |

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines status publish/consume and lifecycle update workflow. |
| `business-rules.md` | Defines evidence and integration rules. |
| `requirements.md` | Supplies movement status and Booking lifecycle update requirements. |
| `technology-stack.md` | Supplies Kafka, Avro, Schema Registry, and PostgreSQL context. |
| `nfr-requirements-questions.md` | Q3 sets status-event scale baseline. |

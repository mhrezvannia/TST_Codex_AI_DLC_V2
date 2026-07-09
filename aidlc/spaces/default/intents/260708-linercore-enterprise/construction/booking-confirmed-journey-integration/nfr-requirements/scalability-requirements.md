# Scalability Requirements - booking-confirmed-journey-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The integration must handle first-release confirmation and amendment volume plus replay/deduplication evidence.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| `booking.confirmed` events | At least 10,000 events in local/CI evidence. |
| Amendment/revision events | At least 2,000 events. |
| Duplicate/replay cases | At least 2,000 cases. |
| CMM journey records affected | At least 10,000 journey creations/reconciliations. |
| Message-pact fixtures | Happy path, duplicate, stale revision, schema incompatibility, and auth/context failure cases. |

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines event publish/consume and journey creation/reconciliation workflow. |
| `business-rules.md` | Defines evidence and integration rules. |
| `requirements.md` | Supplies Booking confirmation, CMM journey, and amendment requirements. |
| `technology-stack.md` | Supplies Kafka, Avro, Schema Registry, and PostgreSQL context. |
| `nfr-requirements-questions.md` | Q3 sets event scale baseline. |

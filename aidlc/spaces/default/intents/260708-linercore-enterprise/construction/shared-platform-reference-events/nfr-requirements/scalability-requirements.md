# Scalability Requirements - shared-platform-reference-events

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reference Data must support enterprise module validation for Charge, Booking, CMM, D&D, UI, and operations without collapsing ownership boundaries.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| Reference sets | At least 50 active sets. |
| Reference records | At least 10,000 active records. |
| History rows | At least 100,000 lifecycle/history rows. |
| Changed events | At least 10,000 reference-data changed events in local/CI evidence. |
| Consumer modules | Charge, Booking, CMM, Enterprise Web, and operations workflows. |

## Growth Requirements

- Reference sets are versioned and queryable without cross-service database joins.
- Validation APIs support module-specific usage checks.
- Outbox publisher scales independently from command/API handling.
- History queries remain paginated and filterable.

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines lifecycle, validation, event, outbox, and health workflows. |
| `business-rules.md` | Defines ownership and integration rules. |
| `requirements.md` | Supplies reference data, local runtime, event, and no-cross-SQL constraints. |
| `technology-stack.md` | Supplies PostgreSQL, Kafka, Schema Registry, and service stack context. |
| `nfr-requirements-questions.md` | Q4 sets scale baseline. |

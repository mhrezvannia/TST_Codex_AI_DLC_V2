# Scalability Requirements - booking-lifecycle-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Booking must support realistic first-release enterprise workflow volume while preserving revision history, exception queues, and audit.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| Bookings | At least 10,000 booking records in seeded local/CI validation. |
| Booking revisions | At least 25,000 revisions. |
| Exception records | At least 5,000 pricing/capacity/movement/D&D/contract exceptions. |
| Lifecycle events | At least 1,000 confirmation/revision event records. |
| Concurrent users | At least 50 local simulated users across booking workflows. |

## Growth Requirements

- Booking searches are paginated and filterable.
- Revision history remains queryable without loading complete audit histories by default.
- Exception queues support owner/status/reason filters.
- Outbox and idempotency tables remain separately queryable and cleanable by policy.

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines booking lifecycle, revisioning, exceptions, and audit workflows. |
| `business-rules.md` | Defines boundary and evidence rules. |
| `requirements.md` | Supplies booking, amendment, exception, and local runtime requirements. |
| `technology-stack.md` | Supplies PostgreSQL, Java/Spring, and runtime context. |
| `nfr-requirements-questions.md` | Q3 sets booking scale baseline. |

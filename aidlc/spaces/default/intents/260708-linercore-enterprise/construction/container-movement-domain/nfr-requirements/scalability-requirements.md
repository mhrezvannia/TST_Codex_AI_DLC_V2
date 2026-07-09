# Scalability Requirements - container-movement-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

CMM must support realistic first-release movement history and status derivation volume without redesign.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| Journeys | At least 10,000 journeys. |
| Movement events | At least 100,000 planned/estimated/actual movement records. |
| Status snapshots | At least 25,000 status snapshots. |
| Duplicate/out-of-order scenarios | At least 10,000 evidence cases. |
| Concurrent users | At least 50 local simulated users across movement workflows. |

## Growth Requirements

- Movement history queries are paginated and filterable by journey, equipment, event type, location, status, and time.
- Deduplication indexes are based on stable event identity and source metadata.
- Status snapshots are queryable without recalculating entire movement history by default.
- Event publication lag is visible and bounded by reliability rules.

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines journey, movement, status, and history workflows. |
| `business-rules.md` | Defines evidence and boundary rules. |
| `requirements.md` | Supplies CMM, event, and local runtime requirements. |
| `technology-stack.md` | Supplies PostgreSQL, Kafka, and Spring context. |
| `nfr-requirements-questions.md` | Q3 sets CMM scale baseline. |

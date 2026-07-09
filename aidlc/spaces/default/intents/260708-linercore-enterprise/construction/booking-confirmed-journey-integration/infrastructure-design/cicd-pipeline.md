# CI/CD Pipeline - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Pipeline Gates

| Gate | Blocking rule |
|---|---|
| AsyncAPI/Avro validation | `booking.confirmed` schema is executable and compatible. |
| Message-pact | Booking producer and CMM consumer fixtures pass. |
| Outbox integration | Confirmation cannot claim publish-ready state without outbox row. |
| Consumer dedupe | Duplicate/replayed events do not create duplicate journeys. |
| Revision reconciliation | Stale and revised booking events produce deterministic outcomes. |
| Boundary | Integration does not derive movement status or calculate pricing/D&D. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Tests publish and consume/reconcile budgets. |
| `security-design.md` | Enforces event identity and boundaries. |
| `scalability-design.md` | Validates event/revision/journey scale. |
| `reliability-design.md` | Proves outbox, compatibility, dedupe, reconciliation, and retry behavior. |
| `logical-components.md` | Maps CI checks to event seam components. |
| `components.md` | Preserves Booking/CMM ownership. |
| `services.md` | Covers Kafka/Avro/AsyncAPI/message-pact seam. |
| `business-logic-model.md` | Covers confirmation publish and journey reconciliation. |

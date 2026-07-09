# Shared Infrastructure - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

| Resource | Shared by | Boundary |
|---|---|---|
| `booking.confirmed` topic | Booking producer and CMM consumer. | Booking owns fact; CMM owns journey reconciliation. |
| Schema Registry subject | Producer, consumer, Contract Platform. | Compatibility gates readiness. |
| Message-pact fixtures | Booking, CMM, CI. | Contract evidence only. |
| Booking outbox | Booking. | No shared DB trigger. |
| CMM consumed-event table | CMM. | No Booking DB reads. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares Kafka infrastructure while preserving publish/consume budgets. |
| `security-design.md` | Enforces event identity and metadata. |
| `scalability-design.md` | Supports event/revision/replay/journey scale. |
| `reliability-design.md` | Preserves outbox, dedupe, and retry evidence. |
| `logical-components.md` | Maps shared resources to producer/consumer components. |
| `components.md` | Keeps Booking and CMM boundaries distinct. |
| `services.md` | Supports the approved event seam. |
| `business-logic-model.md` | Implements confirmation-to-journey integration. |

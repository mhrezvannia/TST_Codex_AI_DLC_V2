# Shared Infrastructure - movement-status-booking-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Shared Resources

| Resource | Shared by | Boundary |
|---|---|---|
| `containermovement.status` topic | CMM producer and Booking consumer. | CMM owns status; Booking owns lifecycle/D&D trigger interpretation. |
| Schema Registry subject | Producer, consumer, Contract Platform. | Compatibility gates readiness. |
| Message-pact fixtures | CMM, Booking, CI. | Contract evidence only. |
| CMM status outbox | CMM. | No shared DB trigger. |
| Booking consumed-status table | Booking. | No CMM DB reads. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares Kafka infrastructure while preserving publish/consume budgets. |
| `security-design.md` | Enforces event identity and metadata. |
| `scalability-design.md` | Supports status/duplicate/stale/update scale. |
| `reliability-design.md` | Preserves publication, dedupe, staleness, and retry evidence. |
| `logical-components.md` | Maps shared resources to status producer/consumer components. |
| `components.md` | Keeps CMM and Booking boundaries distinct. |
| `services.md` | Supports the approved event seam. |
| `business-logic-model.md` | Implements status-to-booking integration. |

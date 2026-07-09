# Monitoring Design - movement-status-booking-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And Alerts

| Signal | Alert condition |
|---|---|
| CMM status outbox lag | Status events pending too long. |
| Kafka publish failure | Publisher blocked/failed rows exceed threshold. |
| Booking consumer lag | Booking falls behind status events. |
| Duplicate events | Dedupe count spikes. |
| Stale/out-of-order events | Quarantine or stale count exceeds threshold. |
| Lifecycle update conflict | Booking cannot apply status evidence. |
| Schema/message-pact failure | Integration readiness blocked. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors derivation, publish, consume, lifecycle update, and end-to-end budgets. |
| `security-design.md` | Monitors event identity, metadata, boundaries, and audit. |
| `scalability-design.md` | Groups by status event, duplicate, stale, update, and pact dimensions. |
| `reliability-design.md` | Alerts on publication, compatibility, dedupe, staleness, lifecycle update, and failure states. |
| `logical-components.md` | Monitoring maps to status producer, consumer, dedupe, ordering, lifecycle update, evidence, and security components. |
| `components.md` | Feeds observability/readiness views. |
| `services.md` | Covers CMM, Booking, Kafka, Schema Registry. |
| `business-logic-model.md` | Observes status-to-booking workflow. |

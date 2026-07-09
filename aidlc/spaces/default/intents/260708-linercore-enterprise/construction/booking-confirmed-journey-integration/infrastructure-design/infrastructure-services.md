# Infrastructure Services - booking-confirmed-journey-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Service | Purpose |
|---|---|
| Booking Service | Confirmation transaction, outbox row, event publisher. |
| CMM Service | Consumer, deduplication, journey reconciliation. |
| PostgreSQL `booking` | Confirmation state and outbox. |
| PostgreSQL `container_movement` | Consumed event and journey state. |
| Kafka | `booking.confirmed` transport. |
| Schema Registry | Avro compatibility. |
| Contract Platform | AsyncAPI, Avro, and message-pact evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides publish and consume/reconcile infrastructure. |
| `security-design.md` | Applies event identity, metadata, audit, and boundary controls. |
| `scalability-design.md` | Supports event/revision/replay/journey scale. |
| `reliability-design.md` | Supports outbox, compatibility, dedupe, and retry evidence. |
| `logical-components.md` | Allocates producer, consumer, schema, pact, and evidence components. |
| `components.md` | Keeps Booking/CMM boundaries distinct. |
| `services.md` | Uses approved Kafka event seam. |
| `business-logic-model.md` | Supports event publish and journey reconciliation workflow. |

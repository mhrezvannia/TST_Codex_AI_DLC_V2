# Infrastructure Services - movement-status-booking-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Service Inventory

| Service | Purpose |
|---|---|
| CMM Service | Status derivation and status outbox publication. |
| Booking Service | Status consumer, dedupe, staleness, lifecycle update, D&D trigger input evidence. |
| PostgreSQL `container_movement` | Status evidence and outbox. |
| PostgreSQL `booking` | Consumed status, lifecycle update, quarantine, trigger evidence. |
| Kafka | `containermovement.status` transport. |
| Schema Registry | Avro compatibility. |
| Contract Platform | AsyncAPI, Avro, and message-pact evidence. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Provides publish and consume/lifecycle infrastructure. |
| `security-design.md` | Applies event identity, metadata, audit, and boundary controls. |
| `scalability-design.md` | Supports event/duplicate/stale/update scale. |
| `reliability-design.md` | Supports publication, compatibility, dedupe, staleness, and retry evidence. |
| `logical-components.md` | Allocates status producer/consumer responsibilities. |
| `components.md` | Keeps CMM/Booking boundaries distinct. |
| `services.md` | Uses approved Kafka event seam. |
| `business-logic-model.md` | Supports status publish and booking lifecycle update workflow. |

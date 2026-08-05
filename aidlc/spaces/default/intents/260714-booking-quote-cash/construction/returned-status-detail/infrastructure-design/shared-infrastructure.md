# Shared Infrastructure - U05 Returned Status Detail

## W0 and Cross-Service Reuse

U05 reuses `platform-messaging`, Kafka, Schema Registry, Compose network, PostgreSQL container, observability, generic image builders, and U04 schema/topic preflight. CMM and Booking keep separate databases, roles, Flyway histories, outboxes/receipts, and service adapters. Shared transport never owns projection ordering or business mapping.

`containermovement.status` is CMM-produced and Booking-consumed; its DLT/replay is Booking-owned. The canonical contract pack owns schema fields/fingerprint. The Booking app consumes only Booking HTTP through its BFF.

## Ownership Matrix

| Resource | Owner | U05 boundary |
|---|---|---|
| CMM status outbox/publisher mapping | CMM | durable source fact and key |
| shared relay/publisher/registrar | platform-messaging | generic transport lifecycle |
| status topic/schema | CMM + Booking contract owners | three partitions, canonical v1/BACKWARD |
| Booking listener/DLT/replay | Booking | validation, retry, recovery |
| Booking projection/detail | Booking | monotonic local read model |
| browser polling | Booking app | bounded observation only |

Producer owns one immediate idempotent transport retry; CMM outbox owns durable publish backoff; Booking listener handler owns consume retry. No other layer retries automatically.

## Source Coverage

Shared mapping applies `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U05 `business-logic-model.md`.

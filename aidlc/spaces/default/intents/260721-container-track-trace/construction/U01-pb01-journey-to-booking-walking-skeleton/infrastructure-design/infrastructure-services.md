# Infrastructure Services - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Service Ownership

This design implements U01 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

| Service | Infrastructure | Ownership |
|---|---|---|
| CMM | Spring service, CMM PostgreSQL, Flyway, outbox relay | Journey/ledger/audit/outbox |
| Booking | Existing service, Booking PostgreSQL, Kafka consumer | Receipt/latest projection/detail |
| Kafka/Schema Registry | Existing broker and BACKWARD Avro authority | At-least-once status path |
| Identity/Reference Data | Existing HTTP dependencies | Authorization and active-reference validation |
| CMM app/edge | Existing Next/React app and shared shell mount | CMM pages only |

Indexes cover stable booking/equipment lookup, request identity, outbox state,
and Booking receipt/sequence. No cache, CDN, search service, public API, EDI,
fleet/depot/M&R, or new broker is added.


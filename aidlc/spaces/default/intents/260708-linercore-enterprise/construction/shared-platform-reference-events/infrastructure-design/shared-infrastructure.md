# Shared Infrastructure - shared-platform-reference-events

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This file is produced because Reference Data is consumed by Charge, Booking, CMM, Enterprise Web, operations, contract checks, and event infrastructure.

## Shared Resource Inventory

| Shared resource | Shared by | Boundary |
|---|---|---|
| Reference Data API | Charge, Booking, CMM, Enterprise Web, operations. | Reference Data owns records and validation; consumers do not query DB directly. |
| PostgreSQL `reference_data` | Reference API, history, audit, outbox. | Reference Data owns schema and migrations. |
| Kafka topic(s) | Reference publisher and downstream consumers. | Reference Data produces; consumers own handling and dedupe. |
| Schema Registry subjects | Reference event producers and consumers. | Contract/schema compatibility gates publish readiness. |
| Outbox health | Reference Data, operations, CI readiness. | Read-only evidence; cannot manually mark green. |
| Reference caches | Consumers may cache with version/freshness keys. | Reference Data remains source of truth. |

## Access Boundaries

| Boundary | Rule |
|---|---|
| Consumer validation | API/service identity only; no database joins. |
| Event consumption | At-least-once semantics require consumer dedupe. |
| Schema evolution | Compatibility checks block breaking required schemas. |
| Audit | Mutation, denied access, and sensitive lifecycle changes are durable. |
| Cache usage | Versioned/freshness-aware and never a source of truth. |

## Shared Flow

```text
[Reference Mutation]
        |
        v
[Reference Tables + History + Outbox]
        |
        v
[Publisher] --> [Kafka + Schema Registry] --> [Consumers]
```

Text fallback: a reference mutation commits state, history, and outbox data. The publisher sends compatible events through Kafka and Schema Registry for consumers.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares fast validation and versioned caching without moving ownership to consumers. |
| `security-design.md` | Enforces API/service access, audit, event identity, data handling, and DB boundary rules. |
| `scalability-design.md` | Scales sets, records, history, events, and consumer modules. |
| `reliability-design.md` | Preserves atomic outbox, at-least-once publish, compatibility blocks, retry visibility, and no-lost-change behavior. |
| `logical-components.md` | Maps shared resources to reference APIs, repository, outbox, publisher, schema adapter, audit, and health components. |
| `components.md` | Keeps Reference Data Service ownership explicit. |
| `services.md` | Supports Reference Data, Charge, Booking, CMM, Enterprise Web, Kafka, and Schema Registry integration. |
| `business-logic-model.md` | Implements reference lifecycle, validation, event publication, outbox health, and exception handling. |

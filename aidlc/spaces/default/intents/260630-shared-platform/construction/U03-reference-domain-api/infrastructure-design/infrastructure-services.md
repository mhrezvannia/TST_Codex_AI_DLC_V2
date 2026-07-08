# Infrastructure Services - U03 Reference Domain API

## Database

PostgreSQL 15+ is the owned persistence service for reference data. It stores Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, TradeLane, relationship state, audit/change history, versions, and domain-fact/outbox handoff records.

Required index families cover active business-key uniqueness, reference set/status filters, relationship filters, sort fields, version checks, history by record/time, and publication handoff lookup where shared with U04.

## Authorization Dependency

`reference-data-service` calls `identity-service` for protected admin mutations and protected reads where required. U02 unavailability or uncertainty fails protected mutations before persistence and before domain-fact creation.

## Messaging Handoff

U03 creates domain change facts. U04 owns outbox durability details, Avro mapping, Kafka publication, retry, and status projection. Infrastructure must keep the handoff durable and observable without direct Kafka publication inside U03 domain logic.

## Service Discovery

Internal routing exposes `reference-data-service` to BFFs and approved service consumers. Nginx routes browser traffic to BFF apps, not directly to backend services.

## Caching and Search

No shared cache or external search service is required for MVP. Query performance relies on PostgreSQL indexes, bounded pagination, validated filters, and deterministic sort. Cache/read replicas can be added later if measurement requires them.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

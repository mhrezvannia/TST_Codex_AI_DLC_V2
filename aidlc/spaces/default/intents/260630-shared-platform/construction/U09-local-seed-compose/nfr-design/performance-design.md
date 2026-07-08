# Performance Design - U09 Local Seed Compose

## Performance Goals

U09 keeps local startup, seed loading, repeat runs, and smoke checks bounded and diagnosable. It optimizes for repeatable developer and CI feedback, not production migration throughput or final platform load validation.

## Startup Design

Compose profiles separate the required core stack from optional observability. The core profile starts PostgreSQL, Keycloak 24, Kafka, Confluent Schema Registry, `identity-service`, `reference-data-service`, `apps/auth`, `apps/reference-data`, and Nginx. Each required service exposes a health check consumed by the seed loader.

The seed loader waits with per-service timeouts and reports dependency timeout separately from validation or data conflicts.

## Seed Execution Design

Seed manifests are parsed and schema-validated before any write. Reference records load in dependency order: Party/Customer, Location/Country, Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, then TradeLane. Identity records load after Keycloak realm import and before role-permission assignments and test-user links.

Repeat runs compute stable fingerprints from immutable business key, mutable payload, and `seedVersion`. Current records are skipped, allowed mutable changes are updated through approved paths, and immutable conflicts fail the run.

## Smoke Design

Smoke checks use deterministic `smokeTags` to keep the exercised subset small. They read seeded records through provider/admin APIs and BFF/auth paths, verify selected authorization decisions, and exercise one event/status path when Kafka/SR is enabled.

## Measurement

Seed summaries record pack id, seed version, correlation id, total duration, service wait duration, per-pack timing, per-target-service timing, created/updated/skipped/failed counts, smoke duration, and failure category.

## Source Trace

This design implements constraints from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

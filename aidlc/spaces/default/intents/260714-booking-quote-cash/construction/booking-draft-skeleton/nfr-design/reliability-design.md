# Reliability Design - U01 Booking Draft Skeleton

## Atomicity and Startup

One proxied `@Transactional` application method writes Booking, command receipt, lifecycle/audit. Database unique constraints resolve races; rollback tests inject after each write. Repository codec reads V1/V2 and writes canonical V2 idempotently.

Flyway core/PostgreSQL 10.10.0 is the only schema writer; SQL init is disabled and `baseline-on-migrate=false`. A Booking-owned `FlywayMigrationStrategy` inspects the catalog before any baseline or migration action:

1. If `flyway_schema_history` exists, it runs Flyway validation and then migration.
2. If the schema is empty, it runs V1 and V2 normally.
3. If the schema is non-empty without Flyway history, it compares tables, columns, types, nullability, defaults, primary/foreign/unique keys, and indexes with a checked-in exact V1 catalog fingerprint. Only an exact match may call Flyway's explicit `baseline()` at version 1 and then migrate V2.
4. Any unknown or partial schema aborts application startup before `baseline()` or `migrate()`.

Readiness stays false until this strategy completes; liveness checks only the process, and readiness also checks the database and required configuration.

## Recovery

Compose volume preserves commits across service restart; detail retries without fallback. Pre-upgrade dump/hash supports restore with RPO at dump time; forward repair is additive. Two restarts must leave schema/checksums/counts unchanged and recover <=60 s after DB health.

## Source Coverage

Design implements `reliability-requirements.md` and integrates `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and U01 `business-logic-model.md`.

# Functional Design Questions - U09 Local Seed Compose

> Stage: Functional Design
> Unit: `U09-local-seed-compose`
> Source context: `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`.

## Q1. Seed value strategy

How should U09 handle exact seed values for regions, trade lanes, ports, and role mappings while upstream requirements still mark final values as open?

A. Use deterministic MVP defaults in versioned seed packs, but keep regions, trade lanes, and role-permission assignments configurable and replaceable without schema changes (recommended)
B. Hard-code the final business footprint now
C. Defer all seed data until final business decisions are available
X. Other (please specify)

[Answer]: A. Deterministic configurable defaults (Recommended)

## Q2. Seed loader entry point

How should local seed loading be invoked?

A. Provide one repeatable seed command/container that runs after service migrations and may be executed repeatedly without changing already-current data (recommended)
B. Require developers to run manual SQL files in a documented order
C. Seed only through UI workflows after local startup
X. Other (please specify)

[Answer]: A. Idempotent seed command/container (Recommended)

## Q3. Compose service coverage

Which local Compose services should this unit wire for Shared Platform development and smoke checks?

A. PostgreSQL, Keycloak, Kafka, Schema Registry, `reference-data-service`, `identity-service`, frontend apps, Nginx, and the seed loader, aligned to the approved on-prem profile (recommended)
B. PostgreSQL only, with all other dependencies mocked
C. Public-cloud managed dependencies for faster local setup
X. Other (please specify)

[Answer]: A. Full local/on-prem platform composition (Recommended)

## Q4. Seed publication behavior

Should seeded reference records emit the same audit/outbox/event behavior as administrator-created records?

A. Yes for smoke-test visibility, using deterministic seed actor/correlation metadata and idempotent event keys (recommended)
B. No, seed directly into tables and bypass audit/outbox
C. Publish Kafka events without persisting audit/outbox rows
X. Other (please specify)

[Answer]: A. Exercise audit/outbox/event path (Recommended)

## Q5. Frontend impact

What frontend ownership does U09 have?

A. No UI component ownership; provide environment variables, local URLs, seeded credentials, and smoke-test fixtures consumed by `apps/auth` and `apps/reference-data` (recommended)
B. Add local environment management screens to the frontend apps
C. Defer all frontend local-environment support to later units
X. Other (please specify)

[Answer]: A. Developer-facing local environment support only (Recommended)

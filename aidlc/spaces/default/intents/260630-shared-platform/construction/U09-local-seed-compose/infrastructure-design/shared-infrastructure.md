# Shared Infrastructure - U09 Local Seed Compose

## Shared Dependencies

U09 orchestrates shared local dependencies used by all units: PostgreSQL, Keycloak, Kafka, Schema Registry, Nginx, services, apps, seed loader, smoke runner, and optional observability.

## Access Boundaries

Seed writes use service/admin paths where available or controlled bootstrap adapters that preserve validation, audit, and outbox semantics. Smoke checks avoid direct database shortcuts.

## Cross-Unit Contracts

U02 consumes identity seeds. U03 consumes reference seeds. U04 provides event/status smoke. U05/U06 provide BFF/app smoke paths. U08 gates seed/smoke behavior. U10 consumes observability evidence.

## Ownership and Compliance

Seed data is fictional, local-only, versioned, and reviewable. Trade lanes, sites, and role-permission mappings remain configurable defaults rather than final business approvals.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

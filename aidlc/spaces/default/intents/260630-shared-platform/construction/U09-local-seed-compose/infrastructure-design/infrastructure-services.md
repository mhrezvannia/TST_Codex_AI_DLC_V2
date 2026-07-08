# Infrastructure Services - U09 Local Seed Compose

## Compose Core Services

Core Compose includes PostgreSQL, Keycloak 24, Kafka, Schema Registry, backend services, frontend apps, Nginx, seed loader, and smoke runner. Required services expose health checks consumed by the seed loader.

## Seed Loader

The loader validates manifests before writes, plans dependencies, applies seed packs by target service, computes fingerprints, skips current records, updates allowed mutable fields, and fails immutable conflicts.

## Seed Packs

Seed packs are committed, versioned, target-service-specific where useful, and local-only. They cover identity, Keycloak realm/client/users, and all nine reference sets with configurable defaults.

## Smoke Runner

Smoke uses deterministic `smokeTags` and exercises auth/session, authorization decisions, reference provider/admin APIs, and event/status visibility where enabled.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

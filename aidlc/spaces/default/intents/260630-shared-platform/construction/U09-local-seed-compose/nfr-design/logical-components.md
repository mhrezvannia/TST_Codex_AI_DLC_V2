# Logical Components - U09 Local Seed Compose

## Component Overview

U09 provides deterministic local environment support using Docker Compose, PostgreSQL, Keycloak 24, Kafka, Confluent Schema Registry, `identity-service`, `reference-data-service`, `apps/auth`, `apps/reference-data`, Nginx, versioned seed packs, a seed loader, smoke checks, and an optional observability profile.

## Components

### Compose Core Profile

Defines local/on-prem service containers and network wiring for PostgreSQL, Keycloak, Kafka, Schema Registry, backend services, frontend apps, and Nginx. It excludes public-cloud managed dependencies and Kubernetes.

### Compose Observability Profile

Adds optional local observability dependencies for U10-style evidence. It is not required for core seed and smoke success.

### Health Gate

Waits for required dependencies with bounded timeouts and service-specific diagnostics. It distinguishes dependency timeout from validation, data conflict, and smoke failures.

### Seed Pack Manifests

Committed versioned files that declare `seedPackId`, `seedVersion`, `targetService`, records, dependencies, and `smokeTags`. They contain fictional local-only users and deterministic reference data defaults.

### Seed Validator

Parses manifests, validates schemas, checks required fields, verifies dependency declarations, rejects real/prohibited data patterns where possible, and fails before writes on invalid packs.

### Dependency Planner

Orders reference and identity records so parents load before dependents. It handles Country before Port, Region before TradeLane, Keycloak realm before identity roles/users, and role catalog before assignments.

### Seed Loader

Applies records through approved service/admin paths where available. Controlled bootstrap adapters must enforce equivalent validation, audit, and outbox semantics. The loader computes fingerprints, skips current records, updates allowed mutable fields, and fails immutable conflicts.

### Keycloak Import Adapter

Imports the local realm, clients, and fictional test users for development and smoke. It does not introduce a custom authentication store.

### Smoke Runner

Runs deterministic API/BFF smoke checks using `smokeTags`: sign-in or approved local token path, authorization decision checks, reference provider/admin reads, one optional admin mutation path, and event/status visibility where enabled.

### Seed Summary Reporter

Reports pack id, seed version, created/updated/skipped/failed counts, per-target timing, smoke duration, failure category, and correlation id.

## Dependency Direction

Compose starts dependencies; the health gate controls seed execution; the validator and planner prepare seed operations; the loader calls service/admin paths; the smoke runner calls APIs/BFF/event status paths; summary reporting records deterministic evidence.

## Source Trace

This design implements constraints from `business-logic-model.md`, `tech-stack-decisions.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md`.

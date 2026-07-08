# NFR Design Questions - U09 Local Seed Compose

## Scope

This file records design questions resolved during NFR Design for `U09-local-seed-compose`.

## Resolved Questions

### Q1. How should local startup avoid hanging indefinitely?

Docker Compose services declare health checks, and the seed loader waits for required dependencies within configured timeouts. PostgreSQL migrations, Keycloak import, Kafka, Schema Registry, `identity-service`, `reference-data-service`, BFF apps, and Nginx report service-specific diagnostics on failure.

### Q2. How should seed packs remain repeatable?

Seed packs are versioned, committed, schema-validated before writes, and loaded in dependency order. Stable business keys, deterministic platform ids, and seed fingerprints make repeat runs skip/current unchanged records, update allowed mutable fields, and fail on immutable conflicts.

### Q3. How are local security boundaries preserved?

Seed users are fictional and marked local-only. Seed packs contain no real customer, employee, production, or credential data. Local dev secrets are allowed only for local descriptors; non-local descriptors must reference Vault or approved secret paths.

### Q4. How do smoke checks prove real integration without shortcuts?

Smoke checks use service APIs, BFF paths, authorization decisions, and event/status paths rather than direct database reads. They remain small through `smokeTags` so local and CI runs can execute quickly.

### Q5. How are open business decisions handled?

Trade lanes, sites, and final role-permission mappings remain configurable defaults. U09 proves the shape and loading behavior without hard-coding final commercial footprint decisions.

## Open Questions

No blocking questions remain for this stage. Final seed values, production recovery procedures, and observability profile depth are deferred to later implementation, operations, and monitoring work.

## Source Trace

This decision set traces to `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

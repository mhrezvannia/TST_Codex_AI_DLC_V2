# Business Rules - UOW-04 Reference Data Service Core

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Rules

1. Reference sets are limited to the nine MVP sets.
2. Active natural key must be unique per reference set.
3. Code is immutable after creation.
4. Update requires expected version to match current version.
5. Deactivate is a status change, not hard delete.
6. Every mutation writes history and correlation id.
7. Every successful mutation enqueues an outbox event when outbox is configured.
8. Domain-core remains framework/persistence/messaging free.

## Error Rules

- Unknown set or record maps to not found.
- Validation errors map to field/detail payloads.
- Stale version maps to conflict.
- Authorization denial maps to forbidden and no persistence occurs.


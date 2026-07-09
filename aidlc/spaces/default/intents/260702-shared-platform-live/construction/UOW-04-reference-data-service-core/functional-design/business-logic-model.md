# Business Logic Model - UOW-04 Reference Data Service Core

## Context

This Functional Design consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Create Workflow

1. Require mutation permission through `AuthorizationClientPort`.
2. Build `ReferenceRecord` with generated id, set, code, display name, status active, version 1, actor, reason, and attributes.
3. Validate record and reference dependencies.
4. Reject duplicate active natural key.
5. Save record.
6. Append `ReferenceChange`.
7. Enqueue outbox event.
8. Return saved record and correlation id.

## Update Workflow

1. Require mutation permission.
2. Load record by set/id.
3. Compare expected version.
4. Apply display/attribute update and increment version.
5. Validate, save, append history, enqueue outbox.

## Deactivate Workflow

1. Require mutation permission.
2. Require reason.
3. Load active record.
4. Set status inactive, append history, enqueue outbox.


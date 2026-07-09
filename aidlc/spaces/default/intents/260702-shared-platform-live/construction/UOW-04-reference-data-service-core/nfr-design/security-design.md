# Security Design - UOW-04 Reference Data Service Core

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Call `AuthorizationClientPort` before mutation.
- Reject unauthorized mutation before validation/save side effects.
- Persist actor, reason, operation, and correlation id in history.
- Keep Party/Customer reference data service-owned.

## Controls

- Tests for denied mutation producing no repository writes.
- Domain-core dependency purity test remains required.


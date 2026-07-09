# Reliability Design - UOW-04 Reference Data Service Core

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Mutation operation saves record, history, and outbox in one persistence boundary where possible.
- Version mismatch returns conflict before overwrite.
- Duplicate active natural key rejection is enforced by repository and ideally unique index.
- Health/readiness distinguishes PostgreSQL unavailable from validation failures.

## Recovery

- Reset/reseed path documented by runtime/readiness units.


# Functional Design Questions - UOW-04 Reference Data Service Core

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`.

## Questions and Answers

- Persistence: [Answer]: PostgreSQL-backed repositories for records, changes, and outbox behind existing ports.
- Mutation rules: [Answer]: create/update/deactivate require authorization, validation, audit reason where applicable, history, and outbox enqueue.
- Error mapping: [Answer]: validation 422, stale version 409, denied 403, missing record 404.


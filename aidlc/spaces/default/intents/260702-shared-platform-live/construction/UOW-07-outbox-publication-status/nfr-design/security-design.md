# Security Design - UOW-07 Outbox Publication Status

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Event mapper emits only approved contract fields.
- No auth tokens, secrets, or raw session data in events.
- Publish/claim endpoints are internal local/admin operations.
- Schema subject/version must match contract catalog.

## Controls

- Message fixture tests assert payload shape.
- Contract checks verify Avro compatibility.


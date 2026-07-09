# Security Design - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Design

- Server-side only service clients.
- Validate request bodies with Zod or equivalent.
- Map raw service errors to safe BFF errors.
- Propagate correlation id.
- Return 403 on denied mutation before service mutation call.

## Controls

- Route tests for denied mutation.
- Route tests for validation error and service unavailable mapping.


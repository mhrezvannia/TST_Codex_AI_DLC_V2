# NFR Design Questions - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Answers

- Design pattern: stateless BFF service clients with timeout/error mapping.
- Security design: no browser-to-service calls, no raw token/service errors.
- Reliability design: no fixture fallback for mutation success.


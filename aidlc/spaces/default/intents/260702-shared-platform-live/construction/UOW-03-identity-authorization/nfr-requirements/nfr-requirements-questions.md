# NFR Requirements Questions - UOW-03 Identity Authorization

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Answers

- Authorization latency target: p95 under 300 ms locally.
- Security target: deny unknown subjects, audit denials and role changes.
- Reliability target: durable role assignments/audit behind ports.


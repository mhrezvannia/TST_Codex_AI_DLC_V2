# NFR Design Questions - UOW-03 Identity Authorization

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Answers

- Design pattern: policy evaluator plus durable assignment/audit repositories.
- Security design: deny-by-default and audit denials/role changes.
- Reliability design: no allow-by-default on persistence failure.


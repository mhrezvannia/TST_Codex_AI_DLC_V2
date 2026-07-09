# NFR Design Questions - UOW-04 Reference Data Service Core

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Answers

- Design pattern: service-owned PostgreSQL repositories plus transactional mutation boundary.
- Security design: authorization before mutation and audited history.
- Reliability design: version checks, duplicate-key rejection, restart-safe state.


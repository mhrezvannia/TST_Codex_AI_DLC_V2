# Infrastructure Design Questions - UOW-03 Identity Authorization

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Answers

- Deployment: `identity-service` Java service in local Compose/dev profile.
- Storage: PostgreSQL-backed role assignment and audit repositories.
- Monitoring: authorization decisions, denials, persistence health.


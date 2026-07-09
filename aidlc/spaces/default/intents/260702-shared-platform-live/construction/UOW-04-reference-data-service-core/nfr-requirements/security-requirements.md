# Security Requirements - UOW-04 Reference Data Service Core

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Controls

- All mutations call `AuthorizationClientPort`.
- Unauthorized mutation persists nothing.
- Party/customer and confidential reference sets require role-aware access checks.
- Mutation history includes actor, reason, operation, and correlation id.
- Domain-core remains free of web/persistence/messaging frameworks.

## Threats

| Threat | Requirement |
| --- | --- |
| Unauthorized mutation | Server-side authorization before save. |
| Audit gap | History append is part of mutation success criteria. |
| PII leakage | Do not copy Party/Customer data into downstream module stores. |


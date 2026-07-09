# Logical Components - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, and `business-logic-model`.

## Components

| Component | Responsibility | Failure domain |
| --- | --- | --- |
| BffContextFactory | Session/correlation/service URL context. | Next.js route process. |
| IdentityBffClient | Permission/effective-permission calls. | identity-service/network. |
| ReferenceDataBffClient | Reference-data service calls. | reference-data-service/network. |
| BffErrorMapper | Safe error response mapping. | BFF logic. |

## Shared Resources

- Auth session cookie.
- Service base URLs.
- Correlation id header.


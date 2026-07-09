# Shared Infrastructure - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Shared Resources

- Nginx gateway.
- Auth session cookie.
- identity-service endpoint.
- reference-data-service endpoint.

## Boundaries

BFF clients are stateless and do not own persistence.


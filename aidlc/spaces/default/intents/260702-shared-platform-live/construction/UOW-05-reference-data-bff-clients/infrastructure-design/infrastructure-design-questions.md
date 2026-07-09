# Infrastructure Design Questions - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Answers

- Deployment: `apps-reference-data` Next.js app routes through Nginx/dev port.
- Services: identity-service and reference-data-service server-side clients.
- Monitoring: BFF route status/latency and dependency errors.


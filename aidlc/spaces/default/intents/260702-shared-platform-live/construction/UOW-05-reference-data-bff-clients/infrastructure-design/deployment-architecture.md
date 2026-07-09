# Deployment Architecture - UOW-05 Reference Data BFF Clients

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Architecture

- `apps-reference-data` runs as Next.js app container or dev process.
- BFF route handlers call Java services over Compose network/local env URLs.
- Nginx can route browser requests to app only.

## Config

Service base URLs are environment-driven and local-profile scoped.


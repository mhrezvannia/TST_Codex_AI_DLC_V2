# Deployment Architecture - UOW-04 Reference Data Service Core

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Architecture

- Java Spring Boot service with local profile.
- Depends on PostgreSQL and identity-service.
- Exposes `/reference-sets` APIs to BFF and internal publisher/status paths.

## Storage

Service-owned reference-data schema for records, changes, and outbox.


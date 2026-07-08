# Application Design Questions - Shared Platform MVP

> Stage: Application Design
> Intent record: `260630-shared-platform`
> Source context: `requirements.md`, `stories.md`, `team-practices.md`, Enterprise Technical Environment v1.1, Shared Platform-only scope.

## Q1. Component boundary model

How should component boundaries be represented in the design?

A. Keep the mandated deployable boundaries as `reference-data-service`, `identity-service`, Kafka/Schema Registry integration, `apps/reference-data`, `apps/auth`, and shared frontend packages only (recommended)
B. Split each reference aggregate into its own deployable service
C. Collapse Shared Platform backend into one deployable service
X. Other (please specify)

[Answer]: A. Mandated boundaries (Recommended)

## Q2. Reference-data internal component model

How should `reference-data-service` organize its internal domain components?

A. One service with bounded internal modules per aggregate group, sharing the mandated hexagonal skeleton and one owned PostgreSQL datastore (recommended)
B. One generic metadata-driven reference table/component for every set
C. One full internal module per reference set with separate schemas and APIs
X. Other (please specify)

[Answer]: A. Aggregate modules (Recommended)

## Q3. Identity service boundary

What should `identity-service` own in application design?

A. Authorization model, role/permission decisions, audit, and Keycloak integration adapters; Keycloak remains authentication provider (recommended)
B. Authentication and password storage as well as authorization
C. Only a thin Keycloak proxy with no platform authorization domain
X. Other (please specify)

[Answer]: A. Authz domain (Recommended)

## Q4. Communication contracts

What service communication pattern should the design use?

A. REST/OpenAPI for synchronous provider and authorization APIs, Kafka/Avro for reference-change events, outbox for event publication, no shared databases (recommended)
B. GraphQL gateway for frontend and downstream consumers
C. Direct database reads by trusted internal consumers
X. Other (please specify)

[Answer]: A. REST + Kafka (Recommended)

## Q5. Frontend/BFF structure

How should frontend application boundaries be designed?

A. Separate `apps/auth` and `apps/reference-data` Next.js App Router apps with BFF route handlers, shared `@erp/*` packages, and `proxy.ts` route protection (recommended)
B. Single combined frontend app for auth and reference data
C. Backend APIs called directly from browser clients
X. Other (please specify)

[Answer]: A. Separate apps (Recommended)

## Q6. Event publication and status design

How should event publication status be modeled?

A. Transactional outbox in `reference-data-service`, publication worker/adapter, status projection exposed to admin/operator UI, idempotent event envelope (recommended)
B. Publish directly to Kafka inside request transaction with no outbox/status model
C. Defer event publication status until downstream modules exist
X. Other (please specify)

[Answer]: A. Outbox + status (Recommended)

## Q7. Contract/dependency design for downstream modules

How should Charge, Booking, and Container Movement be represented in application design?

A. External future consumers only, via OpenAPI and Avro/message-pact contracts; no runtime components or stubs in this workflow (recommended)
B. Include downstream stub services now for contract tests
C. Include downstream UI screens for contract review
X. Other (please specify)

[Answer]: A. Contracts only (Recommended)

# Tech Stack Decisions - U03 Reference Domain API

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines `reference-data-service`, PostgreSQL repository ports, OpenAPI provider/admin APIs, and domain change facts. `business-rules.md` requires canonical ownership, one deployable bounded context, OpenAPI contracts, deterministic pagination/sorting, and no direct database coupling. `requirements.md` mandates Java 21, Spring Boot 3.3, PostgreSQL 15+, Kafka/SR/Avro for later U04 events, OpenAPI, Pact/message-pact, Keycloak, and on-prem Docker Compose.

## Decision Summary

U03 uses the mandated backend stack and service-owned PostgreSQL model. It exposes provider/admin REST APIs and domain change facts but does not publish Kafka events directly.

## Backend Decisions

| Concern | Selection | Rationale |
|---|---|---|
| Runtime | Java 21, Spring Boot 3.3 | Mandated by `requirements.md`. |
| Architecture | Hexagonal service modules | Keeps domain validation independent from HTTP, persistence, Kafka, and identity adapters. |
| Persistence | PostgreSQL 15+ owned by `reference-data-service` | Canonical reference state and change history require transactional storage. |
| API | REST/OpenAPI with media-type versioning and camelCase JSON | Required for provider/admin APIs and contract review. |
| Authorization integration | U02 `identity-service` API | Centralized authorization without embedding role logic. |
| Event handoff | Domain change fact for U04 transactional outbox | Keeps U03 synchronous ownership separate from Kafka publication. |
| Observability | JSON logs, correlation ids, OpenTelemetry metrics/traces | Required for audit, performance, and U10 diagnostics. |

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Generic key/value reference table for all sets | Would hide aggregate invariants and weaken validation. |
| One deployable service per reference set | Too much operational complexity for MVP; violates selected U03 boundary. |
| Direct database reads by consumers | Violates C-008 and canonical ownership. |
| Kafka publication inside U03 domain logic | U04 owns durable outbox and publisher behavior. |
| Hard-coded final trade lanes/geography | Exact footprint remains open; model must be configurable. |

## Implementation Guidance for Later Units

- U04 must consume U03 domain change facts and own outbox/Kafka publication.
- U06 must call U03 through BFF/provider/admin APIs and treat available actions as hints, not security controls.
- U07 must publish U03 OpenAPI contracts and examples.
- U08 must gate U03 compile, tests, OpenAPI contract checks, and 85 percent coverage.
- U09 must seed through approved service/adapter paths without bypassing validation.


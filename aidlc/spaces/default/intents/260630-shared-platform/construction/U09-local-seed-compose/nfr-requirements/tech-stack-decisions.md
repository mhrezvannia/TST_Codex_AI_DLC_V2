# Tech Stack Decisions - U09 Local Seed Compose

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines Docker Compose startup, PostgreSQL, Keycloak, Kafka, Schema Registry, services, frontend apps, Nginx, seed loader, and optional observability. `business-rules.md` fixes on-prem-only runtime services, health checks, local secrets, BFF/Nginx routing, and idempotent seed summaries. `requirements.md` mandates C-002 through C-006 and FR-050.

## Decision Summary

U09 uses the mandated local/on-prem stack: Docker Compose, PostgreSQL, Keycloak 24, Kafka, Confluent Schema Registry, `identity-service`, `reference-data-service`, `apps/auth`, `apps/reference-data`, Nginx, local seed loader, and optional observability profile.

## Stack Decisions

| Concern | Selection | Rationale |
|---|---|---|
| Runtime orchestration | Docker Compose | Required local/on-prem target. |
| Databases | PostgreSQL service containers | Match backend service datastore target. |
| Identity | Keycloak 24 local realm/import | Matches authentication constraint. |
| Events | Kafka and Confluent Schema Registry | Required for reference-change event smoke. |
| Routing | Nginx | Matches platform integration and BFF route model. |
| Secrets | Local dev values only; Vault references for non-local descriptors | Prevents production secret leakage. |
| Seed format | Versioned committed seed packs | Deterministic and reviewable. |
| Smoke | API/BFF/service calls | Preserves consumer integration boundaries. |

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Public-cloud managed dependencies | Violates C-002. |
| Direct database seed smoke validation only | Violates API/event integration guardrails. |
| Hard-coded final trade footprint | Exact values remain open and must be configurable. |
| Real user/customer seed data | Violates local-only safety and classification controls. |
| Custom authentication store | Violates Keycloak constraint. |

## Implementation Guidance for Later Units

- U03/U04 must provide service paths used by seed loader where available.
- U08 should run idempotency and smoke checks in CI where configured.
- U10 should add observability profile and correlation evidence without blocking core local smoke.


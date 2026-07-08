# Tech Stack Decisions - U02 Identity Authorization Service

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines `identity-service`, Keycloak adapter, owned PostgreSQL storage, OpenAPI APIs, and audit behavior. `business-rules.md` fixes Keycloak 24, service-owned authorization decisions, PostgreSQL ownership, OpenAPI contract publication, and BFF-safe summaries. `requirements.md` mandates Java 21, Spring Boot 3.3, PostgreSQL 15+, OpenAPI, Pact/message-pact, Keycloak 24, Docker Compose, Nginx, Vault, ELK, Prometheus/Grafana, Jaeger, and no public cloud.

## Decision Summary

U02 uses the same mandated Shared Platform stack as U01, with identity-specific adapters and security controls. No alternate IAM, database-sharing, or public-cloud managed identity technology is approved.

## Backend Stack Decisions

| Concern | Selection | Rationale |
|---|---|---|
| Service runtime | Java 21 and Spring Boot 3.3 | Mandated by `requirements.md` C-003. |
| Architecture | Hexagonal Maven modules | Keeps domain authorization logic independent from Keycloak, Spring Security, JPA, REST, and adapters. |
| Datastore | PostgreSQL 15+ owned by `identity-service` | Required for role catalog, assignments, policy version, and audit records. |
| Authentication provider | Keycloak 24 | Binding provider; custom password/auth stores prohibited. |
| API contracts | OpenAPI | Required for authorization decisions, effective permissions, role catalog, assignment, and audit APIs. |
| Contract testing | Pact/message-pact where applicable | Supports U08 gate behavior for consumers. |
| Observability | JSON logs, OpenTelemetry, Prometheus/Grafana, Jaeger, ELK | Required for access logging, decision tracing, and operations evidence. |

## Security and Integration Decisions

- Use an adapter boundary for Keycloak/OIDC/JWKS metadata and token validation.
- Keep raw token material outside domain core and out of API responses.
- Expose only session-safe role/permission summaries to BFFs.
- Use standard platform error envelope for REST failures.
- Use correlation id for logs, audit, and traces.
- Use Vault references for non-local secrets in deployment descriptors.

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Custom authentication database | Violates Keycloak 24 constraint and increases credential risk. |
| Caller-embedded role logic | Breaks central authorization and creates inconsistent policy enforcement. |
| Shared identity database reads by BFFs/services | Violates service ownership and auditability. |
| Public-cloud managed IAM/observability | Outside MVP on-prem constraints. |
| Browser access to raw tokens/claims | Violates safe-summary and data minimization rules. |

## Implementation Guidance for Later Units

- U05 and U06 must call U02 through BFF/server-side paths and must not duplicate policy logic.
- U03 must enforce U02 decisions before protected reference mutations.
- U07 must publish the U02 OpenAPI contract and examples.
- U08 must gate U02 compile, unit, adapter integration, OpenAPI contract, and coverage checks.
- U10 must consume U02 logs, metrics, traces, and audit signals for operational visibility.


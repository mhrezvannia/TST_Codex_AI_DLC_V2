# Performance Requirements - U02 Identity Authorization Service

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines authorization decision, effective permission, role assignment, Keycloak adapter, audit, and service-integration workflows. `business-rules.md` defines fail-closed decisions, deterministic evaluation, OpenAPI APIs, correlation propagation, and BFF-safe summaries. `requirements.md` fixes NFR-001, NFR-003, NFR-004, NFR-009, NFR-012, NFR-014, and constraints C-003 through C-006.

## Scope

U02 performance covers `identity-service` authorization and role/permission APIs. It must not optimize by leaking role logic into BFFs, frontend apps, `reference-data-service`, or downstream modules.

## Target Requirements

| Requirement | U02 obligation |
|---|---|
| Authorization decision latency | Decision calls must be lightweight enough to fit inside protected reference read/write paths targeting p95 <= 300 ms. |
| Effective permissions latency | Session summary calls must be suitable for BFF/session display without exposing token material. |
| Role assignment write latency | Writes may be slower than reads but must use transactional audit and optimistic versioning. |
| Audit query latency | Authorized audit queries must support filters and pagination to avoid unbounded scans. |
| Coverage | `identity-service` targets at least 85 percent line coverage. |

## Latency and Throughput Budgets

- Authorization decision APIs should avoid remote fan-out beyond Keycloak metadata/token validation and owned PostgreSQL policy/assignment reads.
- Repeated decisions for the same active assignment and policy version must be deterministic and cacheable where safe.
- Caches must be bounded and must not preserve privileges beyond assignment/policy validity.
- Audit queries must require filters or pagination and must not degrade decision-path performance.
- Final concurrency and throughput targets remain part of later test planning because the MVP load profile is still open.

## Measurement Requirements

- Emit timing metrics for authorization decision, effective permissions, role assignment, audit query, Keycloak adapter, and database access operations.
- Include decision result and safe reason dimensions without using subject ids or correlation ids as high-cardinality metric labels.
- Trace BFF/service calls into `identity-service` through OpenTelemetry.
- Preserve correlation id for log/trace lookup on slow or failed decisions.

## Performance Risks

| Risk | Mitigation |
|---|---|
| Keycloak metadata/token validation latency | Cache provider metadata safely and distinguish invalid token from dependency unavailable. |
| Role expansion grows with assignment count | Keep role/permission catalog versioned and evaluate through indexed assignment/policy lookups. |
| Audit query competes with decision traffic | Isolate query patterns with pagination/filtering and database indexes. |
| Callers overuse decision API | Provide effective permission/session summary API for appropriate BFF use without embedding policy logic. |

## Non-Goals

- No enterprise-wide IAM throughput target.
- No UI rendering performance; U05 and U06 own frontend NFRs.
- No downstream module authorization policy implementation.


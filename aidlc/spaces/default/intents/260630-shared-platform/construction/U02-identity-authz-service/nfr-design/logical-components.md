# Logical Components - U02 Identity Authorization Service

## Source Trace

This component view derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

It identifies U02 logical components, failure domains, blast radius, shared resources, and isolation boundaries for later infrastructure design.

## Component Inventory

| Component | Type | Primary NFR role |
|---|---|---|
| Authorization API controller | Inbound adapter | Receives decision, effective-permission, role, assignment, and audit requests. |
| Correlation/error envelope filter | Cross-cutting adapter | Validates/generates correlation id and standardizes safe errors. |
| Keycloak adapter | Outbound identity adapter | Validates tokens/claims and resolves `AuthenticatedSubject`. |
| Authorization application service | Application core | Coordinates subject resolution, assignment loading, policy evaluation, and response. |
| Policy evaluator | Domain service | Evaluates subject/resource/action/scope against versioned catalog. |
| Role catalog repository | Persistence port/adapter | Provides versioned roles and permissions. |
| Assignment repository | Persistence port/adapter | Stores active/revoked/expired assignments with optimistic versions. |
| Audit writer | Persistence/application component | Appends role-change and sensitive/denied decision evidence. |
| Audit query projection | Read-side component | Serves authorized filtered/paginated audit queries. |
| PostgreSQL schema | Data store | Owns authorization catalog, assignments, and audit records. |
| Observability emitter | Cross-cutting component | Emits JSON logs, OpenTelemetry metrics/traces, and decision/audit signals. |

## Failure Domains

| Failure domain | Blast radius |
|---|---|
| Keycloak adapter unavailable | Protected decisions fail closed; session/permission summaries may be unavailable. |
| PostgreSQL unavailable | Assignment/policy-backed decisions fail closed; audit queries unavailable. |
| Audit writer failure during assignment | Assignment transaction rolls back where storage allows. |
| Audit query overload | Audit reads degrade but hot authorization decision path remains isolated. |
| Policy catalog inconsistency | Decisions fail or return dependency/configuration error rather than granting unknown privileges. |

## Isolation Strategy

- Domain core is isolated from Keycloak, Spring Security, JPA, REST, Kafka, frontend packages, and adapter modules.
- BFFs and backend services integrate only through OpenAPI APIs.
- PostgreSQL is service-owned; no shared database reads.
- Audit reads are separate from decision-path repositories and require filters.
- Future module permissions remain catalog placeholders, not runtime policies.

## Shared Resources

Shared resources are controlled: Keycloak metadata/JWKS, Vault secret references, OpenAPI contracts, platform correlation id convention, and observability pipelines. None may become a bypass around U02 authorization ownership.


# Scalability Design - U02 Identity Authorization Service

## Source Trace

This design derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

`scalability-requirements.md` requires centralized service ownership, OpenAPI integration, policy versioning, indexed read paths, optimistic writes, filtered audit queries, and capacity hooks. `business-logic-model.md` centralizes decision, effective permission, role assignment, Keycloak adapter, and audit workflows in `identity-service`.

## Scaling Architecture

U02 scales as a centralized internal authorization service. More callers can be added only through API contracts; no caller may embed role logic or read the identity database directly.

## Read Scaling Design

| Read path | Scaling pattern |
|---|---|
| Authorization decision | Indexed subject/assignment/policy lookup with bounded policy projection. |
| Effective permissions | Session-safe projection keyed by subject and policyVersion where cache-safe. |
| Role catalog | Versioned catalog reads with explicit authorization. |
| Audit query | Filtered and paginated read model, separate from hot decision path. |

## Write Scaling Design

Role assignment and revocation use optimistic versioning. Writes reject stale versions rather than applying last-write-wins. Assignment changes and audit records share transactional persistence where storage allows.

## Capacity Signals

U02 emits decision counts by outcome/resource/action/safe caller, latency histograms for API families, Keycloak adapter latency/failure metrics, database connection utilization, and cache hit/miss/eviction metrics.

## Growth Boundaries

Future module role names may appear in catalogs, but future module runtime policies remain placeholders until approved. The scaling design keeps policy ownership centralized and prevents fragmented authorization engines in callers.


# Scalability Requirements - U02 Identity Authorization Service

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` centralizes authorization decisions, effective permissions, role assignment, Keycloak adapter behavior, and audit queries in `identity-service`. `business-rules.md` requires owned PostgreSQL storage, OpenAPI APIs, deterministic decisions, and no embedded platform role logic in callers. `requirements.md` fixes maintainability, local reproducibility, CI gates, and on-prem platform constraints.

## Scaling Model

U02 scales as a centralized internal authorization service. Scaling must preserve one source of truth for roles, permissions, assignments, policy version, and audit.

## Structural Scalability Requirements

| Area | Requirement |
|---|---|
| Service boundary | `identity-service` remains independently deployable and owns authorization data. |
| API boundary | Callers integrate through OpenAPI-defined APIs, not shared database access. |
| Policy versioning | Decisions include permission/policy version so callers and operators can reason about changes. |
| Read paths | Authorization decisions and effective-permission queries must use indexed assignment/policy lookups. |
| Write paths | Role assignment changes must use optimistic versioning to reject stale writes. |
| Audit paths | Audit queries must support filters and pagination to avoid unbounded operational scans. |

## Capacity Planning Hooks

- Emit decision counts by outcome, resource, action, and safe caller class.
- Emit latency histograms for decision, effective permissions, role assignment, and audit query APIs.
- Track Keycloak adapter dependency latency and failures separately from policy evaluation.
- Track database connection utilization and query latency for decision and audit workloads.
- Keep cache size, TTL, and invalidation behavior configurable.

## Growth Assumptions

- The MVP role catalog includes carrier roles plus `reference-admin`, `platform-operator`, and `security-admin`.
- Future module role names may be anticipated but future module runtime policy behavior remains contract placeholder only.
- More BFFs/services may call U02 later; they must not receive direct database access.
- Exact final load profile remains open and must be validated in later performance planning.

## Scaling Risks

| Risk | Mitigation |
|---|---|
| Central service becomes bottleneck | Keep decision path simple, measured, cacheable where safe, and independently deployable. |
| Audit data grows quickly | Require pagination/filtering and plan retention/archival outside U02 functional logic. |
| Policy catalog grows | Use versioned policy catalogs and indexed lookup rather than caller-side policy duplication. |
| Keycloak dependency spikes | Cache metadata safely and distinguish dependency unavailable from authorization denial. |

## Non-Goals

- No distributed policy engines embedded in callers.
- No shared identity database.
- No production autoscaling technology beyond on-prem deployment readiness hooks.


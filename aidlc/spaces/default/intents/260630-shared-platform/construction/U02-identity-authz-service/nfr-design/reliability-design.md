# Reliability Design - U02 Identity Authorization Service

## Source Trace

This design derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

`reliability-requirements.md` requires distinguishable token/dependency failures, deterministic policy evaluation, stale write rejection, transactional audit persistence, standard error envelopes, and health/readiness reflecting database and Keycloak adapter state. `business-logic-model.md` defines explicit decision outcomes and walking-skeleton allow/deny support.

## Reliability Architecture

| Component | Reliability design |
|---|---|
| Keycloak adapter | Validates issuer/audience/expiry/signature; caches metadata; reports dependency unavailable distinctly. |
| Authorization decision service | Deterministic evaluation for same active assignment and policyVersion. |
| Assignment command handler | Uses optimistic versioning and transactional audit append. |
| Audit writer | Persists role/permission and sensitive decision evidence append-only from application perspective. |
| Audit query API | Isolated filtered/paginated read path that does not block decision evaluation. |
| Health/readiness | Reports PostgreSQL and Keycloak metadata/adapter dependency state. |

## Resilience Patterns

- Protected decisions fail closed on required dependency uncertainty.
- Stale assignment writes are rejected and do not alter prior state.
- Assignment changes roll back when required audit persistence fails in the same transaction.
- Invalid token, unknown subject, missing permission, stale assignment, conflict, and dependency unavailable remain separate outcomes.
- Standard error envelopes and structured logs carry correlation id for support and operations.

## Recovery Design

After dependency recovery, audit records remain append-only and decisions resume with current active assignment and policyVersion data. Operators can distinguish authorization denial from dependency outage through logs, metrics, traces, and readiness state.

## Walking Skeleton Reliability

Bolt 1 proves one allow and one deny decision, with a traceable correlation id across BFF/service call, decision response, structured log, and audit/log evidence.


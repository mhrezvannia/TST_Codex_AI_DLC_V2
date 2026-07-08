# Performance Design - U02 Identity Authorization Service

## Source Trace

This design derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

`performance-requirements.md` requires low-latency authorization decisions, safe effective-permission summaries, transactional role assignment writes, paginated audit queries, and timing metrics. `business-logic-model.md` defines authorization decision, effective permission, role assignment, Keycloak adapter, audit, and service-integration workflows.

## Decision Path Design

The hot path for U02 is the authorization decision API:

```text
request envelope
  -> correlation validation
  -> Keycloak adapter subject resolution
  -> indexed role assignment lookup
  -> versioned role/permission catalog lookup
  -> policy tuple evaluation
  -> decision response + optional audit/log signal
```

Design constraints:

| Concern | Design |
|---|---|
| Keycloak metadata | Cache OIDC/JWKS metadata with bounded TTL and issuer/audience validation. |
| Assignment lookup | Index by subject id, status, role id, and version where applicable. |
| Policy lookup | Keep role-permission catalog versioned and loadable as bounded projection. |
| Decision cache | Cache only deterministic permission projections by subject/policyVersion where expiry and revocation semantics are safe. |
| Audit query | Keep filtered/paginated audit reads off the hot decision path. |

## Latency Budget Design

U02 must leave room inside protected reference read/write paths targeting p95 <= 300 ms:

- Token/subject resolution is measured separately from policy evaluation.
- Database query timing is emitted for assignment, policy, assignment write, and audit query paths.
- Effective-permission summary supports BFF/session screens without exposing token internals.
- Role assignment writes optimize correctness over latency because they require version checks and audit persistence.

## Resource and Pooling Design

- Use service-owned PostgreSQL connection pooling configured by environment.
- Avoid remote fan-out beyond Keycloak metadata/token validation and owned PostgreSQL reads.
- Use bounded caches with observable hit/miss/eviction metrics.
- Validate audit query filters before execution to prevent unbounded scans.

## Measurement Design

Metrics and traces include decision latency, effective-permission latency, role assignment latency, audit query latency, Keycloak adapter latency, database query latency, decision outcome, and safe reason class. Correlation id is kept in logs/traces rather than high-cardinality metric labels.


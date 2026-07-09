# Performance Design - shared-platform-identity-security

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Identity performance must speed up authentication context and authorization decisions without weakening fail-closed security or durable audit.

## Request Path Budgets

| Operation | Target | Design control |
|---|---|---|
| Effective permission lookup | p95 <= 100 ms for cached/read-optimized checks. | Precompute effective permissions by subject and capability version; invalidate on role/capability changes. |
| Authorization policy evaluation | p95 <= 250 ms for uncached module/action/resource checks. | Resolve role/capability grants from indexed identity tables and avoid cross-domain database reads. |
| Token validation | p95 <= 100 ms excluding Keycloak network/startup delay. | Cache JWKS/issuer metadata with TTL and validate JWT/RS256 locally. |
| Authorization audit write | p95 <= 250 ms. | Write compact audit records through an indexed append path. |
| Shell context load | p95 <= 500 ms. | Return safe subject summary and permission digest in one Identity Service call. |

## Caching Strategy

Authorization caching is versioned, bounded, and revocation-aware:

- Effective-permission cache keys include subject id, tenant or realm where applicable, capability catalog version, role assignment version, and auth mode.
- Token validation uses cached JWKS metadata only within documented TTL and issuer constraints.
- Cache hits never bypass denied-path audit policy for sensitive actions.
- Role or capability changes increment a version that invalidates affected effective-permission responses.

## Throughput Design

| Scenario | Target | Design |
|---|---|---|
| Local UI permission checks | 50 concurrent permission lookups. | Read-optimized effective permission endpoint and frontend auth package reuse. |
| Service authorization checks | 100 requests/minute per protected service seam. | Lightweight policy evaluation and service subject validation. |
| Audit writes | 1,000 records/minute in local test profile. | Indexed audit table and compact record shape without full tokens/secrets. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements latency targets, throughput targets, and cache constraints. |
| `security-requirements.md` | Preserves backend enforcement, denied-path tests, service JWT validation, audit, and no full-token storage. |
| `scalability-requirements.md` | Supports capability, role/service identity, audit, and concurrent lookup baselines. |
| `reliability-requirements.md` | Keeps invalidation, audit write failures, and fail-closed token/capability handling explicit. |
| `tech-stack-decisions.md` | Reuses Keycloak, existing Identity Service, Java/Spring, PostgreSQL, JWT/RS256, and shared frontend auth packages. |
| `business-logic-model.md` | Implements authenticate subject, authorize action, manage capability catalog, and validate service-to-service request workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design translates every latency and throughput target into an implementation constraint without allowing cache shortcuts around security.
- Capability and role changes have explicit invalidation hooks, addressing the main performance/security tradeoff.
- Audit write performance is treated as part of the protected request path, not deferred as best-effort logging.
- Residual implementation risk is in exact TTL, index, and claim mapping choices, which Build and Test must verify.

# Performance Requirements - shared-platform-identity-security

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Identity performance targets cover authentication callback handling, authorization decisions, effective-permission lookup, and audit write behavior without weakening fail-closed security.

## Latency Targets

| Operation | Target |
|---|---|
| Effective permission lookup | p95 <= 100 ms for cached/read-optimized checks under seeded local load. |
| Authorization policy evaluation | p95 <= 250 ms for uncached module/action/resource checks. |
| Token validation | p95 <= 100 ms excluding Keycloak network or startup delays. |
| Authorization audit write | p95 <= 250 ms for required audit records. |
| Shell context load | p95 <= 500 ms for user identity plus effective permission summary. |

## Throughput Targets

| Scenario | Target |
|---|---|
| Local UI permission checks | Support 50 concurrent permission lookups in seeded local validation. |
| Service authorization checks | Support 100 requests/minute per protected service seam in local validation. |
| Audit writes | Sustain 1,000 audit records/minute in local test profile without data loss. |

## Resource Constraints

- Authorization caching must not bypass revocation or stale capability handling beyond an explicitly documented TTL.
- Performance tuning cannot replace denied-path checks.
- Identity service remains separately deployable and must not require cross-domain database reads.

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines authentication, authorization, capability, service-token, and audit workflows. |
| `business-rules.md` | Defines auth, authorization, service security, audit, and boundary rules. |
| `requirements.md` | Supplies FR-SP-002, FR-SP-003, NFR-SEC-001 through NFR-SEC-004. |
| `technology-stack.md` | Supplies Java/Spring, PostgreSQL, Keycloak, and frontend auth package context. |
| `nfr-requirements-questions.md` | Q1 sets authorization latency targets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFR targets are measurable and tied to authentication, authorization, effective permissions, service identity, and authorization audit workflows.
- Security requirements preserve backend enforcement and fail-closed behavior rather than relying on route hiding or local trust.
- Scalability requirements cover first-release enterprise modules, capabilities, service identities, and audit volume.
- Reliability requirements protect denied-path, token-validation, service-JWT, local-bypass, and audit durability behavior.
- Technology decisions correctly harden existing `identity-service` and Keycloak instead of replacing the identity foundation.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact cache invalidation, audit persistence failure policy, Keycloak realm import mechanics, and JWT validation libraries/configuration.
- Build and Test must prove denied-path tests and audit records across UI, service, and service-to-service paths.

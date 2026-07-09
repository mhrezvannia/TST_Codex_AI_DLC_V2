# NFR Requirements Questions - shared-platform-identity-security

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Authorization Latency

What latency should identity authorization checks target?

A. p95 <= 100 ms for cached/effective-permission checks and p95 <= 250 ms for uncached policy evaluation under seeded local load. Recommended.
B. p95 <= 500 ms for all checks.
C. No latency target.
D. Defer to performance validation.
E. UI-only checks are sufficient.
X. Other (please specify)

[Answer]: A

## Q2 - Security Strictness

What security controls are mandatory?

A. Keycloak auth, issuer/audience/signature/expiry validation, roles plus capabilities, denied-path tests, authorization audit, service JWT/RS256, and explicit local-only bypass. Recommended.
B. User auth only.
C. Route hiding only.
D. Network trust is sufficient.
E. Defer to Operation.
X. Other (please specify)

[Answer]: A

## Q3 - Capability Catalog Scale

What first-release capability scale should be supported?

A. At least 10 modules, 100 capability identifiers, 25 roles/service identities, and 10,000 authorization audit records in seeded local validation. Recommended.
B. Shared Platform capabilities only.
C. Unlimited scale with no target.
D. No scale target.
E. Defer scale to production.
X. Other (please specify)

[Answer]: A

## Q4 - Audit Reliability

What audit posture should authorization decisions have?

A. Denied decisions and sensitive allowed decisions are durable, correlated, queryable, and never contain secrets or full tokens. Recommended.
B. Denied decisions only in logs.
C. Audits are optional in local mode.
D. Audit can be deferred until Operation.
E. UI screenshots prove authorization.
X. Other (please specify)

[Answer]: A

## Q5 - Technology Posture

What stack should identity/security use?

A. Reuse existing `identity-service`, Keycloak 24, Java 21/Spring Boot 3.3.7/Maven, PostgreSQL logical database, and shared frontend auth packages; harden rather than rewrite. Recommended.
B. Replace identity with a new provider.
C. Use in-memory identity only.
D. Move all auth to frontend.
E. Defer stack decisions.
X. Other (please specify)

[Answer]: A

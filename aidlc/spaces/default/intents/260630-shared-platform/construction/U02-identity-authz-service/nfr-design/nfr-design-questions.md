# NFR Design Questions - U02 Identity Authorization Service

## Source Trace

This question record derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Q1. Decision path performance

Which optimization pattern should U02 use?

A. Keep authorization decision path simple and indexed; cache Keycloak metadata and bounded policy/permission projections only where policyVersion validity is preserved (recommended)
B. Cache allow decisions indefinitely
C. Embed permission logic in callers
X. Other (please specify)

[Answer]: A. Bounded version-aware decision optimization (Recommended)

## Q2. Failure behavior

What resilience pattern applies when dependencies are unavailable?

A. Fail closed for protected decisions, distinguish dependency unavailable from denial, and expose correlation-linked diagnostics (recommended)
B. Allow and audit later
C. Fall back to frontend role checks
X. Other (please specify)

[Answer]: A. Fail closed with diagnostics (Recommended)

## Q3. Audit path isolation

How should audit queries relate to decision traffic?

A. Keep write audit transactional with role changes, but isolate filtered/paginated audit queries from hot authorization decision paths (recommended)
B. Use one unbounded audit endpoint for all callers
C. Skip audit query design
X. Other (please specify)

[Answer]: A. Transactional audit writes, isolated audit reads (Recommended)

## Q4. Logical boundary

What boundary should Keycloak have?

A. Adapter boundary only; domain core receives AuthenticatedSubject and never parses JWTs or imports Keycloak/Spring Security internals (recommended)
B. Domain core parses Keycloak tokens directly
C. Frontend BFFs own platform permission evaluation
X. Other (please specify)

[Answer]: A. Adapter boundary (Recommended)

## Ambiguity Analysis

- `performance-requirements.md` allows cacheability only where assignment/policy version validity is preserved.
- `security-requirements.md` and `reliability-requirements.md` require fail-closed protected decisions, so no permissive fallback is available.
- `tech-stack-decisions.md` fixes Java/Spring/PostgreSQL/Keycloak/OpenAPI and on-prem observability; no alternate IAM stack is permitted.
- No follow-up questions are needed for U02 NFR design.


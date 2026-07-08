# NFR Requirements Questions - U02 Identity Authorization Service

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Authorization latency

Which performance target should U02 use for authorization decisions?

A. Keep authorization decision calls lightweight enough to fit inside the NFR-001 p95 <= 300 ms reference read/mutation budget, with exact service-level load targets validated later (recommended)
B. Define final enterprise-wide auth throughput now
C. Defer authorization latency entirely
X. Other (please specify)

[Answer]: A. Fit inside platform request budget (Recommended)

## Q2. Failure posture

How should protected authorization calls behave when identity dependencies are unavailable?

A. Fail closed for protected actions and return safe reason/correlation details (recommended)
B. Allow cached permissions indefinitely
C. Fall back to UI-only controls
X. Other (please specify)

[Answer]: A. Fail closed (Recommended)

## Q3. Audit integrity

What audit requirement applies to role/permission changes?

A. Append-only or tamper-evident audit records with actor, target, before/after, reason, timestamp, and correlation id (recommended)
B. Best-effort log lines only
C. Defer audit until operations phase
X. Other (please specify)

[Answer]: A. Immutable audit evidence (Recommended)

## Q4. Sensitive data handling

What may U02 return to BFFs and frontend apps?

A. Session-safe role/permission summaries and safe decision reasons only; no raw tokens, secret claims, or unauthorized role details (recommended)
B. Full Keycloak token payload for convenience
C. Database role rows directly
X. Other (please specify)

[Answer]: A. Safe summaries only (Recommended)

## Q5. Scalability posture

How should U02 support growth?

A. Keep `identity-service` a separately deployable service with owned PostgreSQL storage, deterministic policy/version evaluation, bounded caches, and OpenAPI contracts (recommended)
B. Embed role logic in every caller for speed
C. Share the identity database with BFFs
X. Other (please specify)

[Answer]: A. Centralized service with bounded integration (Recommended)

## Ambiguity Analysis

- `requirements.md` fixes security classification, access logging, immutable audit, observability, and Keycloak constraints.
- Final throughput and retention windows are not fixed, so U02 must expose measurable behavior and configurable retention without hard-coding final operational values.
- No follow-up question is needed for U02 because fail-closed authorization, Keycloak 24, immutable audit, and safe response boundaries are already explicit in `business-rules.md` and `requirements.md`.


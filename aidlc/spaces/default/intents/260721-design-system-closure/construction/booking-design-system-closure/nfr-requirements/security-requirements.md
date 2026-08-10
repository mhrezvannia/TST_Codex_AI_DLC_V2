# Security Requirements — booking-design-system-closure

## Basis and Trust Boundaries

Security requirements preserve the flows in `business-logic-model.md`, rules in `business-rules.md`, NFR-005 and related gates in `requirements.md`, and observed stack in `technology-stack.md`. W2-02 does not add an identity provider, auth mechanism, public API, cloud environment, formal regulatory scope, or scanner claim.

Trust boundaries remain: browser → nginx/shared shell session → shell same-origin adapter → Booking BFF → Booking/supporting services. The UI may render safe results; it never supplies authoritative subject, role, lifecycle status, correlation identity, or permission claims.

## Control Requirements

| ID | Control | Measurable gate |
|---|---|---|
| SEC-001 | All canonical Booking pages require the existing authenticated shell session. | Unauthenticated browser is redirected by existing session behavior; no Booking data renders. |
| SEC-002 | Existing action/object authorization remains enforced at BFF/service boundaries; denied behavior is non-color-only and exposes no forbidden action. | 403 regression tests and live denied-state proof. |
| SEC-003 | Actor subject comes from the existing session/server seam, never a form/query/local fallback. | Request/network test verifies propagated authenticated subject and rejects absent actor. |
| SEC-004 | Cookies/session and correlation traverse shell adapter/BFF as currently implemented; correlation remains visible only in safe support/audit context. | Focused adapter/BFF tests plus live network/evidence correlation. |
| SEC-005 | POST commands retain same-origin validation, JSON content type, and an explicit idempotency key of 1–128 visible characters. | Negative tests for origin/content-type/idempotency rejection. |
| SEC-006 | Command bodies retain the 32,768-byte maximum and the 2,500 ms abort deadline. | Boundary and timeout regression tests. |
| SEC-007 | Redirects accept only presentation routes, use a trusted canonical shell origin and status 308, drop unsafe/unknown query data, and never intercept `/api/**`. | Redirect allow-list/security tests. |
| SEC-008 | User-facing failures expose only safe code/message/field details and correlation-safe reference; no stack, token, cookie, credential, internal URL, raw payload, or database detail. | Error-mapping tests and artifact scan. |
| SEC-009 | Production code contains no auth bypass, test-state query flag, debug state picker, detached acceptance host, or cross-app implementation import. | Source/import/route scans and live route inspection. |
| SEC-010 | Evidence excludes secrets and session material; screenshots/traces/results use isolated synthetic/local data and redact any sensitive token/header. | Evidence-manifest review and retained artifact scan. |
| SEC-011 | Hardcoded application colors and local style systems fail the anti-drift gate through non-writing negative probes. | Direct non-zero exit and unchanged worktree. |

## Threat Mapping

| STRIDE threat | Relevant seam | Required mitigation/evidence |
|---|---|---|
| Spoofing | Browser/session/actor | Existing Keycloak/shell session; server-derived actor; unauthenticated and absent-actor tests |
| Tampering | Command body/query/redirect | Same-origin JSON checks, size/input validation, query allow-list, service validation |
| Repudiation | Lifecycle commands | Correlation and existing idempotency propagated; command result retained |
| Information disclosure | Errors, audit disclosure, evidence traces | Safe error mapping, collapsed audit context, header/secret redaction |
| Denial of service | Oversized/slow/duplicate commands | 32,768-byte limit, 2,500 ms deadline, one command in flight |
| Elevation of privilege | Object/action routes | Existing authorization and denied tests; UI never creates permissions |

## Data and Compliance Boundary

Booking identifiers, customer identifiers, routing, equipment, and pricing are internal business data and are handled only through existing authenticated/service-owned paths. Credentials, session tokens, and secrets are restricted and must never enter screenshots, logs, manifests, or test fixtures.

No source establishes PCI-DSS, HIPAA, GDPR, SOC 2, ISO certification, retention schedule, residency mandate, or formal privacy assessment for this closure. Therefore W2-02 claims no certification or framework PASS. If such scope is later supplied, it requires a separately approved control/evidence plan.

## Security Test Gate

Required focused tests cover unauthenticated, actor-missing, unauthorized, invalid origin, wrong content type, missing/invalid idempotency, oversized body, timeout/safe-error, redirect injection/unknown query, and secret-free evidence. Existing lint/typecheck/tests/build remain necessary.

The repository did not establish SAST, dependency vulnerability, secret-scanning, DAST, SBOM, or container-scanning completion. Those results cannot be invented or silently promoted to hard W2-02 PASS criteria. A discovered exploitable defect in changed code is in-scope to fix; a missing organization-wide scanner remains an explicit program gap.


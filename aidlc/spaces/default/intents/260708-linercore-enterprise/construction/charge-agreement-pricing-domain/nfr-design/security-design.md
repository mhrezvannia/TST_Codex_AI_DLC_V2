# Security Design - charge-agreement-pricing-domain

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Charge owns commercial agreement, tariff, pricing, and D&D behavior and must protect sensitive commercial changes and price outcomes.

## Security Controls

| Surface | Control |
|---|---|
| Agreement/tariff administration | Keycloak/JWT user validation, capability check, version check, and audit. |
| Pricing and D&D APIs | Authenticated Booking service identity, idempotency key, correlation ID, and contract validation. |
| Manual fallback | Required approver, reason, decision, linked exception, and audit. |
| Commercial data | Pricing terms, agreements, charge lines, D&D rules, and results are confidential. |
| Boundary enforcement | Reject requests that mutate Booking lifecycle, derive CMM status, or require Booking/CMM database reads. |

## Tamper Resistance

Pricing results include pricing basis, pricingRef, agreement/rule versions, request hash, charge lines, manual-required reason where applicable, and audit correlation. This allows recalculation review without trusting mutable UI state.

## Threat Controls

| Threat | Design response |
|---|---|
| Unauthorized tariff change | Capability check, stale-version guard, and audit. |
| Forged pricing request | Service JWT validation, contract-backed seam, idempotency key, and request hash. |
| Price tampering | Deterministic calculation and persisted audit basis. |
| Boundary violation | Architecture tests and no cross-service SQL checks. |
| Manual fallback abuse | Approver, reason, exception state, and audit are mandatory. |

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements authentication, authorization, service access, audit, boundary rules, and commercial data protection. |
| `performance-requirements.md` | Keeps security checks in bounded pricing/admin/manual paths. |
| `scalability-requirements.md` | Scales protection across agreements, terms, D&D rules, requests, and manual exceptions. |
| `reliability-requirements.md` | Preserves deterministic results, idempotency, timeout-safe states, and boundary failures. |
| `tech-stack-decisions.md` | Uses Keycloak/JWT, Java/Spring, PostgreSQL, OpenAPI/Pact, and Charge Service evolution. |
| `business-logic-model.md` | Implements agreement, pricing, D&D, manual fallback, and audit workflows. |

# Reliability Requirements - charge-agreement-pricing-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Charge reliability means deterministic pricing/D&D results, idempotent request handling, auditable fallback, and fail-closed ownership boundaries.

## Reliability Controls

| Control | Requirement |
|---|---|
| Idempotency | Database-backed idempotency for pricing and D&D requests. |
| Determinism | Same eligible request and reference data version produce same calculation result. |
| Audit | Pricing basis, pricingRef, charge lines, D&D rule basis, manual fallback, and approver/reason are auditable. |
| Timeout safety | APIs return typed timeout/manual-required states; callers own orchestration. |
| Boundary checks | Reject requests that require Booking lifecycle mutation or CMM status derivation. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| No active agreement/tariff | Return no-price/manual-required result with audit. |
| D&D rule conflict | Return typed conflict/manual-required result. |
| Duplicate request | Return prior result for matching idempotency key and request hash. |
| Stale agreement version | Reject update/approval with stale-version error. |
| Reference data unavailable | Fail closed or mark manual-required according to business rule. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines pricing, D&D, manual fallback, and audit workflows. |
| `business-rules.md` | Defines validation and boundary rules. |
| `requirements.md` | Supplies FR-CHG, NFR-REL-001, and NFR-OBS-001. |
| `technology-stack.md` | Supplies PostgreSQL, Java/Spring, OpenAPI, and Pact context. |
| `nfr-requirements-questions.md` | Q4 sets reliability posture. |

# Reliability Design - charge-agreement-pricing-domain

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Charge reliability means deterministic pricing and D&D results, idempotent request handling, auditable fallback, and fail-closed ownership boundaries.

## Reliability Patterns

| Pattern | Design |
|---|---|
| Idempotency | Pricing and D&D requests persist idempotency key, caller, request hash, result reference, and status. |
| Determinism | Same eligible request and reference/agreement/rule versions produce the same result. |
| Audit basis | Persist pricingRef, pricing basis, charge lines, rule basis, manual fallback, approver, reason, and correlation ID. |
| Timeout safety | APIs return typed success, no-price, conflict, timeout, or manual-required states; caller owns orchestration. |
| Boundary checks | Reject requests that require Booking lifecycle mutation or CMM status derivation. |

## Failure Handling

| Failure | Behavior |
|---|---|
| No active agreement/tariff | Return no-price or manual-required result with audit. |
| D&D rule conflict | Return typed conflict or manual-required result. |
| Duplicate request | Return prior result for matching idempotency key and request hash. |
| Stale agreement version | Reject update/approval with stale-version error. |
| Reference data unavailable | Fail closed or return manual-required according to business rule. |
| Audit persistence failure | Fail readiness for protected pricing/admin paths. |

## Recalculation And Evidence

Historic pricing audit is queryable without recalculating historic results. Recalculation for review uses the persisted request hash, agreement/rule versions, reference data version, and algorithm version, and it is labeled as review evidence rather than replacing the original result.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements idempotency, determinism, audit, timeout safety, boundary checks, and failure behavior. |
| `performance-requirements.md` | Uses bounded calculation paths and typed manual-required states. |
| `security-requirements.md` | Preserves service identity, commercial audit, manual fallback controls, and no cross-service SQL. |
| `scalability-requirements.md` | Supports request and audit growth without recalculating historic results. |
| `tech-stack-decisions.md` | Uses Charge Service, Java/Spring, PostgreSQL, OpenAPI/Pact, Keycloak/JWT, and Docker Compose runtime. |
| `business-logic-model.md` | Implements pricing, D&D, manual fallback, agreement lifecycle, and audit workflows. |

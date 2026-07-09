# Reliability Requirements - booking-charge-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability means the synchronous pricing seam degrades visibly and safely when Charge is slow, unavailable, or returns manual-required outcomes.

## Reliability Controls

| Control | Requirement |
|---|---|
| Timeout | Booking uses explicit HTTP timeout for Charge pricing calls. |
| Retry | Retries are bounded and safe only for idempotent requests. |
| Circuit breaker | Repeated failures open circuit and surface pricing exception/manual workflow. |
| Idempotency | Booking and Charge use database-backed idempotency for pricing requests. |
| Snapshot | Booking stores auditable pricing result snapshot on success. |
| Contracts | OpenAPI and Pact verification block integration readiness when red/stale. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Charge timeout | Open pricing exception/manual-required state with correlation evidence. |
| Charge 4xx validation | Surface validation failure without retry loop. |
| Charge 5xx/unavailable | Apply bounded retry/circuit breaker and open exception. |
| Duplicate request | Return prior result where idempotency matches. |
| Pact failure | Block readiness for pricing seam. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines pricing success/failure/manual fallback workflow. |
| `business-rules.md` | Defines evidence and boundary rules. |
| `requirements.md` | Supplies FR-CHG-005, US-CHG-004, NFR-REL-001, and NFR-COMP-001. |
| `technology-stack.md` | Supplies OpenAPI/Pact, Spring, PostgreSQL, and local runtime context. |
| `nfr-requirements-questions.md` | Q4 sets reliability controls. |

# Reliability Requirements - dnd-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reliability means D&D triggers, requests, calculations, snapshots, and manual fallbacks are idempotent and auditable.

## Reliability Controls

| Control | Requirement |
|---|---|
| Timeout | Booking uses explicit HTTP timeout for Charge D&D calls. |
| Retry | Retries are bounded and safe only for idempotent requests. |
| Circuit breaker | Repeated failures open circuit and surface D&D exception/manual workflow. |
| Idempotency | Booking and Charge use database-backed idempotency for D&D requests. |
| Snapshot | Booking stores auditable D&D result snapshot on success. |
| Contracts | OpenAPI and Pact verification block integration readiness when red/stale. |

## Failure Handling

| Failure | Required behavior |
|---|---|
| Charge timeout | Open D&D exception/manual-required state with correlation evidence. |
| No D&D rule | Return typed no-rule/manual-required result. |
| D&D rule conflict | Return typed conflict/manual-required result. |
| Duplicate request | Return prior result where idempotency matches. |
| Pact failure | Block readiness for D&D seam. |

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines D&D trigger, request/result, snapshot, and fallback workflow. |
| `business-rules.md` | Defines evidence and boundary rules. |
| `requirements.md` | Supplies FR-CHG-008, FR-BKG-009, NFR-REL-001, and NFR-COMP-001. |
| `technology-stack.md` | Supplies OpenAPI/Pact, Spring, PostgreSQL, and local runtime context. |
| `nfr-requirements-questions.md` | Q4 sets reliability controls. |

# Reliability Design - dnd-pricing-integration

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability means D&D triggers, requests, calculations, snapshots, and manual fallbacks are idempotent and auditable.

## Reliability Patterns

| Control | Design |
|---|---|
| Timeout | Booking uses explicit HTTP timeout for Charge D&D calls. |
| Retry | Retries are bounded and safe only for idempotent requests. |
| Circuit breaker | Repeated failures open circuit and surface D&D exception/manual workflow. |
| Idempotency | Booking and Charge use database-backed idempotency for D&D requests. |
| Snapshot | Booking stores auditable D&D result snapshot on success. |
| Contracts | OpenAPI and Pact verification block integration readiness when red or stale. |

## Failure Handling

| Failure | Behavior |
|---|---|
| Charge timeout | Open D&D exception/manual-required state with correlation evidence. |
| No D&D rule | Return typed no-rule/manual-required result. |
| D&D rule conflict | Return typed conflict/manual-required result. |
| Duplicate request | Return prior result where idempotency key and request hash match. |
| Pact failure | Block readiness for D&D seam. |

## Trigger Idempotency

Booking uses a trigger key derived from booking id, revision, movement status identity, D&D boundary type, and request hash. Repeated movement-status evidence for the same trigger reuses the existing request/result state.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements timeout, retry, circuit breaker, idempotency, snapshot, contracts, and failure behavior. |
| `performance-requirements.md` | Keeps trigger, request, call, snapshot, and end-to-end budgets measurable. |
| `security-requirements.md` | Preserves service auth, context, correlation, audit, and ownership boundaries. |
| `scalability-requirements.md` | Supports request/result, fallback, Pact, and snapshot evidence volumes. |
| `tech-stack-decisions.md` | Uses OpenAPI/Pact, Spring services, PostgreSQL, Docker Compose, Keycloak/JWT, and CMM status evidence. |
| `business-logic-model.md` | Implements D&D trigger, request/result, snapshot, fallback, and audit workflow. |

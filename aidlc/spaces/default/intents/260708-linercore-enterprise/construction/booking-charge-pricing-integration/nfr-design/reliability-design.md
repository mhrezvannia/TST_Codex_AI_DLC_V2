# Reliability Design - booking-charge-pricing-integration

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reliability means the synchronous pricing seam degrades visibly and safely when Charge is slow, unavailable, or returns manual-required outcomes.

## Resilience Controls

| Control | Design |
|---|---|
| Timeout | Booking uses explicit HTTP timeout within the 1-second Charge call budget. |
| Retry | Retries are bounded and only used for idempotent requests with matching request hash. |
| Circuit breaker | Repeated 5xx/unavailable/timeouts open circuit and surface pricing exception/manual workflow. |
| Idempotency | Booking and Charge persist idempotency keys, request hashes, and accepted results. |
| Snapshot | Booking stores auditable pricing result snapshot on success. |
| Contracts | OpenAPI and Pact verification block readiness when red or stale. |

## Failure Handling

| Failure | Behavior |
|---|---|
| Charge timeout | Open pricing exception/manual-required state with correlation evidence. |
| Charge 4xx validation | Surface validation failure without retry loop. |
| Charge 5xx/unavailable | Apply bounded retry/circuit breaker and open exception. |
| Duplicate request | Return prior result where idempotency key and request hash match. |
| Pact failure | Block readiness for pricing seam. |

## Circuit State Model

The circuit has closed, open, and half-open states. Open state routes new attempts to visible pricing exception/manual workflow until probe rules allow half-open recovery. All state changes are logged with correlation and service seam identifiers.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements timeout, retry, circuit breaker, idempotency, snapshot persistence, contracts, and failure behavior. |
| `performance-requirements.md` | Keeps failure classification bounded after timeout/error. |
| `security-requirements.md` | Preserves service auth, user context, correlation, denied paths, and ownership boundaries during failure handling. |
| `scalability-requirements.md` | Supports request, fallback, Pact, and snapshot evidence volumes. |
| `tech-stack-decisions.md` | Uses OpenAPI/Pact, Spring services, PostgreSQL, Docker Compose, and Keycloak/JWT. |
| `business-logic-model.md` | Implements pricing success, failure, manual fallback, snapshot, and evidence workflows. |

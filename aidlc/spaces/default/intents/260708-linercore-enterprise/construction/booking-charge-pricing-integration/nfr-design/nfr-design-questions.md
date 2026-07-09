# NFR Design Questions - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define seam latency, service authentication, idempotency, correlation, scale baseline, timeout/retry/circuit-breaker behavior, Pact verification, and the selected OpenAPI/Pact integration stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Explicit timeout, bounded retry, circuit breaker, idempotency, snapshot persistence, Pact readiness blocks, and visible manual fallback. |
| Scalability | First release supports 10,000 pricing requests, 2,000 failure/manual-fallback cases, 20 Pact interactions, and 10,000 Booking pricing snapshots. |
| Performance | End-to-end pricing orchestration p95 <= 1.5 seconds, Booking preparation p95 <= 200 ms, Charge call p95 <= 1 second, snapshot persistence p95 <= 200 ms. |
| Security | Booking-to-Charge service JWT/RS256, user/capability context, idempotency key, request hash, correlation ID, denied-path evidence, and no shared database. |
| Logical boundaries | Booking orchestrates and stores snapshots; Charge calculates and returns pricing outcomes. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact numerical retry count, circuit-breaker window, and HTTP client implementation are Code Generation choices constrained by these budgets.

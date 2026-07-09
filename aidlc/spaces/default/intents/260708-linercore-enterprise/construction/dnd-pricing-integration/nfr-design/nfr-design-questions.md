# NFR Design Questions - dnd-pricing-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define D&D trigger latency, service auth, idempotency, correlation, audit, scale baseline, timeout/retry/circuit behavior, snapshots, Pact readiness, and the selected OpenAPI/Pact integration stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Explicit timeout, bounded retry, circuit breaker, idempotency, D&D snapshot, Pact readiness block, and manual fallback. |
| Scalability | First release supports 5,000 D&D requests/results, 2,000 manual fallback cases, 20 Pact interactions, and 5,000 Booking D&D snapshots. |
| Performance | Boundary trigger p95 <= 300 ms, request preparation p95 <= 200 ms, Charge D&D call p95 <= 1.5 seconds, snapshot p95 <= 200 ms, end-to-end p95 <= 2 seconds. |
| Security | Service JWT/RS256, user/action context, idempotency, correlation, audit, and Booking/Charge/CMM ownership boundaries. |
| Logical boundaries | Booking triggers and stores results; Charge calculates D&D; CMM supplies movement facts/status only. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact D&D trigger key, HTTP client settings, and circuit thresholds are implementation details constrained by this design.

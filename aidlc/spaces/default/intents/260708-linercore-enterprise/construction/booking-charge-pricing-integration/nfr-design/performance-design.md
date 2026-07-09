# Performance Design - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Performance covers the synchronous Booking to Charge pricing seam and Booking's persistence of returned pricing snapshots.

## Seam Budgets

| Operation | Target | Design control |
|---|---|---|
| Successful pricing orchestration | p95 <= 1.5 seconds end-to-end. | Bound Booking preparation, Charge call, and snapshot persistence separately. |
| Booking request preparation | p95 <= 200 ms. | Build request from Booking-owned state and cached/reference-validated identifiers only. |
| Charge HTTP call budget | p95 <= 1 second. | Explicit HTTP timeout; Charge owns calculation internals. |
| Booking snapshot persistence | p95 <= 200 ms. | Persist compact pricing snapshot, pricingRef, request hash, and audit correlation. |
| Failure/manual fallback classification | p95 <= 300 ms after timeout/error. | Map timeout/4xx/5xx/manual-required to typed Booking exception state. |

## Execution Flow

Booking prepares a pricing request, validates idempotency/correlation, calls Charge through the OpenAPI/Pact-backed seam, classifies the outcome, stores the pricing snapshot or exception state, and surfaces pricing evidence to UI/workflow readers.

## Performance Isolation

Booking does not compute Charge pricing to meet latency targets. Charge does not mutate Booking lifecycle. The seam budget measures orchestration behavior, while Charge's calculation performance remains owned by the Charge domain.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements end-to-end, request preparation, Charge call, snapshot, and fallback classification budgets. |
| `security-requirements.md` | Keeps service auth, user context, idempotency, correlation, denied-path evidence, and boundary controls in the seam. |
| `scalability-requirements.md` | Supports pricing requests, failure/manual cases, Pact interactions, and snapshot volume. |
| `reliability-requirements.md` | Uses timeout, retry, circuit breaker, idempotency, snapshot persistence, and Pact readiness blocks. |
| `tech-stack-decisions.md` | Uses Booking Service, Charge Service, OpenAPI, HTTP Pact, PostgreSQL, Docker Compose, and Keycloak/JWT. |
| `business-logic-model.md` | Implements pricing request/response, success/failure/manual fallback, snapshot, and evidence workflow. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The seam budget is decomposed into Booking preparation, Charge call, persistence, and fallback classification.
- Degraded outcomes are visible Booking state, not hidden orchestration failures.
- The design preserves provider/consumer ownership and contract-backed readiness.
- Residual implementation risk is in concrete HTTP client timeout/retry/circuit-breaker settings.

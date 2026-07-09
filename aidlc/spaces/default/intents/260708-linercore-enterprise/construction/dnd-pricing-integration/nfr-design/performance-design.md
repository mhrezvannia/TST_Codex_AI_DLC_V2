# Performance Design - dnd-pricing-integration

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Performance covers Booking D&D boundary recognition, D&D request to Charge, Charge calculation handoff, Booking result snapshot, and manual fallback classification.

## Seam Budgets

| Operation | Target | Design control |
|---|---|---|
| Boundary trigger evaluation | p95 <= 300 ms after relevant movement status. | Evaluate Booking-owned lifecycle and movement-status evidence with indexed trigger state. |
| D&D request preparation | p95 <= 200 ms. | Build request from Booking snapshot, movement status input, and idempotency/correlation metadata. |
| Charge D&D call budget | p95 <= 1.5 seconds. | Explicit HTTP timeout with Charge owning calculation internals. |
| Booking D&D result snapshot | p95 <= 200 ms. | Persist compact D&D result/manual state with pricingRef and audit correlation. |
| End-to-end trigger to stored result | p95 <= 2 seconds. | Bound trigger, call, classification, and snapshot steps. |

## Execution Flow

Booking detects a D&D-relevant boundary from lifecycle and movement-status evidence, prepares a D&D request, calls Charge through the OpenAPI/Pact-backed seam, stores the result snapshot or manual-required exception, and publishes evidence for UI/workflow review.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements boundary trigger, request preparation, Charge call, snapshot, and end-to-end budgets. |
| `security-requirements.md` | Keeps service auth, user/action context, idempotency, correlation, audit, and boundaries in the seam. |
| `scalability-requirements.md` | Supports request/result, fallback, Pact, and snapshot scale. |
| `reliability-requirements.md` | Uses timeout, retry, circuit breaker, idempotency, snapshot, contracts, and failure handling. |
| `tech-stack-decisions.md` | Uses Booking trigger owner, Charge calculation owner, CMM facts/status, OpenAPI, Pact, PostgreSQL, and Keycloak/JWT. |
| `business-logic-model.md` | Implements D&D trigger, request/result, snapshot, fallback, and audit workflow. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The D&D seam has separate budgets for trigger evaluation, request preparation, Charge call, and snapshot persistence.
- The design preserves the ownership split between Booking, Charge, and CMM.
- Manual-required states are explicit, preventing hidden pricing failures.
- Residual implementation risk is in trigger idempotency and circuit-breaker tuning.

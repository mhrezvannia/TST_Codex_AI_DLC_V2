# Performance Requirements - booking-charge-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Performance covers the synchronous Booking -> Charge pricing seam and Booking's persistence of returned pricing snapshots.

## Latency Targets

| Operation | Target |
|---|---|
| Successful pricing orchestration | p95 <= 1.5 seconds end-to-end under seeded local load. |
| Booking request preparation | p95 <= 200 ms. |
| Charge HTTP call budget | p95 <= 1 second, calculation owned by Charge. |
| Booking pricing snapshot persistence | p95 <= 200 ms. |
| Failure/manual fallback classification | p95 <= 300 ms after timeout/error response. |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines Booking request, Charge call, success/failure/manual fallback, snapshot, and evidence workflow. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies FR-CHG-005, FR-BKG-002, FR-E2E-001, and NFR-REL-001. |
| `technology-stack.md` | Supplies Spring services, OpenAPI, Pact, PostgreSQL, and local runtime context. |
| `nfr-requirements-questions.md` | Q1 sets pricing seam performance target. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable across end-to-end pricing orchestration, request preparation, Charge call budget, snapshot persistence, and fallback classification.
- Reliability requirements include timeout, bounded retry, circuit breaker, database-backed idempotency, Pact verification, and visible manual fallback.
- Security requirements preserve service-to-service auth, user/capability context, idempotency, correlation, and no direct database access.
- Technology decisions keep Booking orchestration and Charge calculation separate through OpenAPI/Pact-backed HTTP.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact timeout/retry/circuit-breaker thresholds and idempotency hashing.
- Build and Test must prove Pact provider/consumer verification and failure/manual fallback scenarios.

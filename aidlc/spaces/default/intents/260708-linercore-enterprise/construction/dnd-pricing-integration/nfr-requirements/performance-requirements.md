# Performance Requirements - dnd-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Performance covers Booking D&D boundary recognition, D&D request to Charge, Charge calculation handoff, Booking result snapshot, and manual fallback classification.

## Latency Targets

| Operation | Target |
|---|---|
| Boundary trigger evaluation | p95 <= 300 ms after relevant movement status. |
| D&D request preparation | p95 <= 200 ms. |
| Charge D&D call budget | p95 <= 1.5 seconds for standard cases. |
| Booking D&D result snapshot | p95 <= 200 ms. |
| End-to-end trigger to stored result | p95 <= 2 seconds under seeded local load. |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines Booking boundary trigger, D&D request, Charge calculation handoff, snapshot, fallback, and audit workflow. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies FR-CHG-006/008, FR-BKG-009, FR-E2E-004, NFR-REL, and NFR-OBS. |
| `technology-stack.md` | Supplies Spring services, OpenAPI, Pact, PostgreSQL, and local runtime context. |
| `nfr-requirements-questions.md` | Q1 sets D&D seam performance target. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable from Booking D&D trigger through Charge call, Charge calculation budget, Booking snapshot, and manual fallback classification.
- Security requirements preserve Booking trigger ownership, Charge calculation ownership, CMM fact/status-only role, service auth, correlation, idempotency, and audit.
- Reliability requirements include timeout, bounded retry, circuit breaker, database-backed idempotency, Pact verification, and manual fallback paths.
- Technology decisions avoid shared database integration and preserve Booking/Charge/CMM boundaries.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact D&D trigger idempotency, timeout/circuit thresholds, result snapshot structure, and manual fallback state transitions.
- Build and Test must prove no-rule, conflict, timeout, duplicate, and Pact failure scenarios.

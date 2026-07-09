# Performance Requirements - booking-lifecycle-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Booking performance targets cover draft lifecycle, validation, pricing orchestration state, confirmation, amendments, reconfirmation, exception queues, and audit.

## Latency Targets

| Operation | Target |
|---|---|
| Create/update booking draft | p95 <= 300 ms excluding external adapters. |
| Booking query by ID | p95 <= 200 ms under seeded local load. |
| Booking search/list | p95 <= 500 ms for paginated results. |
| Confirm/reconfirm booking | p95 <= 1 second excluding external pricing/validation calls. |
| Exception queue operation | p95 <= 300 ms. |
| Audit write | p95 <= 250 ms for lifecycle actions. |

## Orchestration Budgets

- Pricing and operational validation calls use timeout, retry, and circuit-breaker budgets defined in integration units.
- Long-running orchestration records state and surfaces exception queues instead of blocking user requests indefinitely.
- UI-facing operations return current booking/pricing/exception state rather than hiding pending work.

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines booking draft, validation, pricing state, confirmation, amendment, exception, and audit workflows. |
| `business-rules.md` | Defines validation, evidence, ownership, and boundary rules. |
| `requirements.md` | Supplies FR-BKG-001 through FR-BKG-010, NFR-REL-001, and NFR-OBS-001. |
| `technology-stack.md` | Supplies Java/Spring, PostgreSQL, Kafka, OpenAPI, Pact, and Schema Registry context. |
| `nfr-requirements-questions.md` | Q1 sets booking command/query performance targets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable across draft/query, confirm/reconfirm, exception, audit, idempotency, and outbox paths.
- Security and reliability requirements preserve Booking ownership while blocking price, D&D, movement-status, and cross-service database leakage.
- Scalability baseline covers bookings, revisions, exceptions, lifecycle events, and concurrent users.
- Technology decisions align with a new Spring/PostgreSQL/Kafka/OpenAPI/Pact-backed `booking-service`.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact state-machine, idempotency, outbox, retry, exception, and stale-revision patterns.
- Integration units must provide concrete timeout/retry/circuit-breaker budgets for Booking-to-Charge and Booking-to-CMM seams.

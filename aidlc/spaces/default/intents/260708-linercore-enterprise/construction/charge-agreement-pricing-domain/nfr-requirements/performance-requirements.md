# Performance Requirements - charge-agreement-pricing-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Charge performance targets cover agreement/tariff lookup, itemised pricing, D&D rule evaluation, manual fallback state, and commercial audit.

## Latency Targets

| Operation | Target |
|---|---|
| Agreement/tariff lookup | p95 <= 300 ms under seeded local load. |
| Standard pricing calculation | p95 <= 500 ms excluding upstream caller timeout. |
| D&D calculation | p95 <= 1 second for first-release import/export scenarios. |
| Agreement create/update/approve | p95 <= 500 ms excluding human workflow time. |
| Manual pricing/D&D resolution | p95 <= 500 ms excluding user decision time. |

## Throughput Targets

| Scenario | Target |
|---|---|
| Pricing API | 1,000 pricing requests/hour in local seeded validation. |
| D&D API | 500 D&D requests/hour in local seeded validation. |
| Agreement/tariff admin | 500 lifecycle commands/hour in local seeded validation. |

## Traceability

| Source | Performance coverage |
|---|---|
| `business-logic-model.md` | Defines agreement, pricing, D&D, manual fallback, and audit workflows. |
| `business-rules.md` | Defines ownership, validation, evidence, and boundary rules. |
| `requirements.md` | Supplies FR-CHG, FR-E2E-001, FR-E2E-004, NFR-REL, and NFR-OBS requirements. |
| `technology-stack.md` | Supplies Java/Spring, PostgreSQL, OpenAPI, Pact, and runtime context. |
| `nfr-requirements-questions.md` | Q1 sets pricing/D&D performance targets. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- NFRs are measurable for agreement lookup, pricing, D&D calculation, manual fallback, and commercial audit.
- Security requirements protect commercial data and preserve Charge ownership boundaries.
- Reliability requirements require deterministic calculation, database-backed idempotency, timeout-safe APIs, and auditable manual fallback.
- Scalability baseline covers agreements, tariff terms, D&D rules, pricing requests, and manual exceptions.
- Technology decisions correctly evolve the existing `charge-agreement-service` instead of moving pricing into Booking.
- Required-section and upstream-coverage sensors passed; linter and type-check are not applicable to markdown-only outputs.

Residual risks to carry forward:

- NFR Design must define exact pricing/D&D calculation determinism, idempotency key hashing, timeout behavior, and manual fallback state model.
- Integration units must prove Pact-backed Booking -> Charge pricing and D&D seams.

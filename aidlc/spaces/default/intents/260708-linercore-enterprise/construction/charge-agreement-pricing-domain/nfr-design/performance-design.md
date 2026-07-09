# Performance Design - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Charge performance covers agreement/tariff lookup, itemised pricing, D&D rule evaluation, manual fallback state, and commercial audit.

## Calculation And Admin Budgets

| Operation | Target | Design control |
|---|---|---|
| Agreement/tariff lookup | p95 <= 300 ms. | Indexed lookup by customer, lane, commodity, equipment, date, status, and agreement version. |
| Standard pricing calculation | p95 <= 500 ms. | Pre-resolve applicable agreement/terms and produce itemised charge lines in one bounded calculation pass. |
| D&D calculation | p95 <= 1 second. | Index D&D rules by boundary, location/lane, equipment, commodity, and effective date. |
| Agreement create/update/approve | p95 <= 500 ms excluding human time. | Optimistic version checks and compact audit write in the transaction. |
| Manual pricing/D&D resolution | p95 <= 500 ms excluding user decision time. | Queue-backed manual-required state with indexed lookup and audit. |

## Throughput Design

| Scenario | Target | Design |
|---|---|---|
| Pricing API | 1,000 requests/hour. | Stateless Spring endpoint with PostgreSQL-backed idempotency and indexed terms. |
| D&D API | 500 requests/hour. | Separate D&D calculation path sharing agreement/reference lookup utilities. |
| Agreement/tariff admin | 500 lifecycle commands/hour. | Versioned agreement commands with audit and stale-version rejection. |

## Calculation Path

The calculation path resolves request identity, validates idempotency, loads eligible agreement/tariff/rule data, computes charge lines, persists pricing basis and audit evidence, and returns a typed result. It does not call Booking or CMM databases and does not mutate Booking lifecycle.

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Implements lookup, pricing, D&D, lifecycle, manual fallback, and throughput targets. |
| `security-requirements.md` | Keeps capability checks, service auth, confidential data handling, and audit in the calculation path. |
| `scalability-requirements.md` | Supports agreement, tariff, D&D rule, request, and manual exception scale. |
| `reliability-requirements.md` | Uses deterministic calculation, idempotency, manual-required states, and stale-version checks. |
| `tech-stack-decisions.md` | Evolves `charge-agreement-service` with Java/Spring, PostgreSQL, OpenAPI/Pact, Keycloak/JWT, and Docker Compose runtime. |
| `business-logic-model.md` | Implements agreement, pricing, D&D, manual fallback, and audit workflows. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` is not available under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design maps all pricing, D&D, admin, and manual fallback budgets to concrete query/calculation controls.
- Calculation performance does not rely on Booking or CMM database shortcuts.
- Deterministic output and audit basis are kept in the pricing path, which is critical for commercial review.
- Residual implementation risk is in index selection, algorithm complexity, and Pact-backed timeout behavior.

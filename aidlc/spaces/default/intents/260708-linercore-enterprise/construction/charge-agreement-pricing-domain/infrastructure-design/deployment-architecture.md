# Deployment Architecture - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

`charge-agreement-pricing-domain` deploys the Charge Service that owns agreements, tariffs, charge terms, active lookup, itemised pricing, manual pricing, D&D rules, free time, rates, chargeable days, commercial audit, and pricing/D&D idempotency.

## Deployment Model

| Environment | Deployment shape |
|---|---|
| Local `core` | PostgreSQL, Keycloak/JWT support, shared network, contract-test dependencies. |
| Local `app` | Charge Service container, nginx route, agreement/pricing/D&D APIs. |
| Local host IDE | Charge Service can run on host while `core` remains in Docker. |
| CI | Agreement lifecycle, pricing, D&D, idempotency, manual fallback, audit, OpenAPI, and Pact tests. |
| Operation path | Later stages add production scaling, backup, DR, incident response, and performance validation. |

## Runtime Topology

```text
[Admin / Booking / Enterprise Web]
        |
        v
[Charge Service]
        |
        +--> [pricing PostgreSQL]
               +--> agreements, tariffs, charge terms
               +--> D&D rules, free time, rates
               +--> pricing results, idempotency
               +--> manual fallback, commercial audit
```

Text fallback: Charge Service receives agreement administration, pricing, and D&D requests. It persists Charge-owned commercial data and audit in the pricing database and returns typed results to callers.

## Runtime Controls

| Concern | Design |
|---|---|
| Active lookup | Indexed agreement/tariff eligibility queries with version and effective-date constraints. |
| Pricing calculation | Deterministic itemised result with pricing basis and commercial audit. |
| D&D calculation | Deterministic free-time/rate/chargeable-day calculation with typed conflict/manual-required states. |
| Idempotency | Request key/hash stores accepted result references and rejects mismatched duplicates. |
| Boundary guard | Rejects Booking lifecycle mutation, CMM status derivation, and cross-service SQL behavior. |

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Supports lookup, pricing, D&D, agreement lifecycle, manual fallback, and throughput targets. |
| `security-design.md` | Enforces auth, capabilities, service access, commercial audit, data protection, and boundaries. |
| `scalability-design.md` | Supports agreement, tariff, D&D rule, request, and manual exception scale. |
| `reliability-design.md` | Implements idempotency, determinism, audit basis, timeout-safe states, stale-version checks, and failure handling. |
| `logical-components.md` | Maps deployment to AgreementAdminApi, AgreementLookupService, PricingCalculationEngine, DndCalculationEngine, ManualFallbackManager, PricingIdempotencyGuard, CommercialAuditWriter, ChargeAuthorizationGuard, BoundaryViolationGuard, and PricingQueryApi. |
| `components.md` | Preserves Charge ownership for agreements, tariffs, pricing, D&D rules/calculation, and commercial audit. |
| `services.md` | Uses Charge Service, PostgreSQL `pricing`, OpenAPI/Pact contracts, Keycloak/JWT, and Booking caller seams. |
| `business-logic-model.md` | Implements create/approve agreements, resolve pricing, calculate itemised pricing, handle manual fallback, and prepare D&D rules. |

## Review

Verdict: READY

Reviewer route: inline architecture review, because the configured `aidlc-architecture-reviewer-agent` cannot start under the current Codex account/model configuration (`openai.gpt-5.4` unsupported for this account).

Findings:

- The design keeps Charge responsible for pricing and D&D calculation while excluding Booking lifecycle and CMM status ownership.
- Database-backed idempotency, stale-version checks, typed manual-required states, and commercial audit support implementation and testability.
- Residual implementation risk is exact rule schema, lookup indexes, manual queue states, idempotency TTL, and Pact coverage.

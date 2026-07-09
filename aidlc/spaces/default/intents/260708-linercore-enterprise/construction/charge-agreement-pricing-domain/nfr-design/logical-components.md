# Logical Components - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The logical components define where Charge agreement, pricing, D&D, security, scale, and reliability NFR patterns apply.

## Component Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| AgreementAdminApi | Creates, updates, approves, and versions agreements and tariffs. | Commercial lifecycle commands. |
| AgreementLookupService | Resolves active agreements and tariff terms by eligibility criteria. | Pricing lookup. |
| PricingCalculationEngine | Produces deterministic itemised pricing results. | Standard pricing. |
| DndCalculationEngine | Computes D&D free time, rates, chargeable days, and result lines. | D&D calculation. |
| ManualFallbackManager | Opens and resolves manual pricing/D&D states with approver and reason. | Exception/manual workflow. |
| PricingIdempotencyGuard | Stores request keys, hashes, statuses, and result references. | Duplicate request control. |
| CommercialAuditWriter | Persists pricing basis, charge lines, rule basis, manual fallback, approver, and reason. | Audit evidence. |
| ChargeAuthorizationGuard | Enforces user/service JWT and capability checks. | Security boundary. |
| BoundaryViolationGuard | Rejects Booking lifecycle mutation, CMM status derivation, and cross-service SQL behaviors. | Ownership boundary. |
| PricingQueryApi | Serves pricing audit, manual queue, agreement, and tariff query views. | Read scale. |

## Boundary Model

Charge owns agreements, tariffs, charge terms, active lookup, tariff fallback, itemised pricing, manual pricing, D&D rules, free time, rates, chargeable days, commercial audit, idempotency, and manual exception state.

Charge does not mutate Booking lifecycle, derive CMM status, or query Booking/CMM databases.

## Failure Domains And Blast Radius

| Failure domain | Isolated effect | Blast-radius control |
|---|---|---|
| Agreement stale version | Admin command rejected. | Optimistic version check and audit. |
| Pricing no-match | Typed no-price/manual-required result. | Caller orchestration remains outside Charge. |
| D&D rule conflict | Typed conflict/manual-required result. | No hidden calculation guess. |
| Duplicate request | Prior result returned. | Idempotency key and request hash. |
| Manual fallback misuse | Resolution rejected. | Required approver, reason, and audit. |
| Boundary violation | Request rejected. | No Booking/CMM mutation or SQL access. |

## NFR Pattern Placement

| NFR pattern | Component placement |
|---|---|
| Fast lookup | AgreementLookupService and PricingQueryApi. |
| Deterministic calculation | PricingCalculationEngine and DndCalculationEngine. |
| Idempotency | PricingIdempotencyGuard. |
| Commercial audit | CommercialAuditWriter. |
| Manual-required states | ManualFallbackManager. |
| Security | ChargeAuthorizationGuard. |
| Boundary safety | BoundaryViolationGuard. |

## Traceability

| Source | Design response |
|---|---|
| `performance-requirements.md` | Components support lookup, pricing, D&D, agreement lifecycle, manual fallback, and throughput targets. |
| `security-requirements.md` | Components enforce auth, capabilities, service access, commercial audit, data protection, and boundaries. |
| `scalability-requirements.md` | Components support agreement, tariff, D&D rule, request, and manual exception scale. |
| `reliability-requirements.md` | Components implement idempotency, determinism, audit basis, timeout-safe states, stale-version checks, and failure handling. |
| `tech-stack-decisions.md` | Components map to evolved Charge Service, Java/Spring, PostgreSQL, OpenAPI/Pact, Keycloak/JWT, and Docker Compose. |
| `business-logic-model.md` | Components implement create/approve agreements, resolve pricing, calculate itemised pricing, handle manual fallback, and prepare D&D rules. |

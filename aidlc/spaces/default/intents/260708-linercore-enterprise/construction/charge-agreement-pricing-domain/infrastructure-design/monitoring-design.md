# Monitoring Design - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Metrics And KPIs

| Metric | Signal |
|---|---|
| Active agreement lookup latency | Pricing readiness and index health. |
| Pricing calculation latency | Standard pricing path health. |
| D&D calculation latency | D&D path health. |
| No-price/manual-required rate | Commercial exception pressure. |
| Stale agreement version rejections | Admin concurrency and UI behavior. |
| Idempotency replay/mismatch count | Caller retry quality and duplicate control. |
| Commercial audit write health | Required evidence availability. |
| Boundary violation attempts | Ownership/security regression signal. |

## Alert Definitions

| Alert | Severity | Trigger |
|---|---|---|
| Pricing path degraded | P1/P2 | Pricing latency or error rate breaches threshold. |
| D&D path degraded | P1/P2 | D&D calculation failures or manual-required spikes. |
| Active lookup misses spike | P2 | No-price results exceed expected baseline. |
| Audit write failure | P1 | Required commercial audit cannot be persisted. |
| Boundary violation | P1 | Booking/CMM mutation or cross-service SQL attempt detected. |
| Pact/provider verification failure | P1 readiness blocker | Booking or Enterprise Web expectations fail. |

## Dashboard Specification

Dashboards show agreement lifecycle status, active lookup health, pricing/D&D result states, manual fallback queue, idempotency outcomes, commercial audit health, API latency, and contract test status. Views are read-only evidence.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Monitors lookup, pricing, D&D, lifecycle, manual fallback, and throughput targets. |
| `security-design.md` | Monitors auth, capability, service access, audit, data protection, and boundary controls. |
| `scalability-design.md` | Groups metrics by agreement, tariff, charge code, rule, request, and manual exception dimensions. |
| `reliability-design.md` | Alerts on idempotency, determinism, audit, stale versions, and typed failure states. |
| `logical-components.md` | Monitoring maps to lookup, calculation, manual fallback, idempotency, audit, authorization, and boundary components. |
| `components.md` | Feeds Observability Platform and Enterprise Web operations views. |
| `services.md` | Covers Charge Service, PostgreSQL, OpenAPI/Pact, and Keycloak/JWT. |
| `business-logic-model.md` | Observes agreement, pricing, D&D, manual fallback, and audit workflows. |

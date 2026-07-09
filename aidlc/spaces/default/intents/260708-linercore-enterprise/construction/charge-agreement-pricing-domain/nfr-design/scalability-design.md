# Scalability Design - charge-agreement-pricing-domain

## Source Context

This artifact consumes `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Charge must support first-release enterprise commercial data and request volume without redesigning the domain model.

## Scale Baseline

| Dimension | Design capacity |
|---|---|
| Agreements | At least 5,000. |
| Tariff/charge terms | At least 25,000 active or historical terms. |
| D&D rules | At least 500 rules. |
| Pricing/D&D requests | At least 10,000 in local/CI evidence. |
| Manual exceptions | At least 1,000. |

## Query And Partition Strategy

| Data area | Index/filter strategy |
|---|---|
| Agreement lookup | Customer, lane, commodity, equipment, effective date, status, agreement version. |
| Tariff terms | Agreement id, charge type, equipment, commodity, route/lane, date, status. |
| D&D rules | Boundary, location/lane, equipment, commodity, date, rule version. |
| Pricing audit | PricingRef, booking reference, request hash, result status, timestamp. |
| Manual queues | Owner, reason, status, severity, customer, age, and approver. |

## Growth Controls

| Trigger | Design response |
|---|---|
| Lookup p95 exceeds 300 ms | Add targeted indexes or read projection for active terms. |
| D&D p95 exceeds 1 second | Pre-index rule eligibility and split import/export rule evaluation. |
| Manual queue grows | Paginate by owner/status/reason and expose aging metrics. |
| Pricing audit grows | Query persisted audit basis instead of recalculating historic results. |
| Request volume exceeds baseline | Validate idempotency index selectivity and stateless service scaling. |

## Traceability

| Source | Design response |
|---|---|
| `scalability-requirements.md` | Implements agreement, tariff, D&D rule, request, and manual exception scale. |
| `performance-requirements.md` | Uses indexable lookup and persisted audit basis to preserve latency targets. |
| `security-requirements.md` | Scales confidential data protection, authorization, audit, and boundary enforcement. |
| `reliability-requirements.md` | Keeps idempotency, deterministic calculation, manual-required states, and stale-version checks queryable. |
| `tech-stack-decisions.md` | Uses Charge Service evolution, Java/Spring, PostgreSQL, OpenAPI/Pact, Keycloak/JWT, and Docker Compose. |
| `business-logic-model.md` | Implements agreement, tariff, pricing, D&D, manual fallback, and commercial audit workflows. |

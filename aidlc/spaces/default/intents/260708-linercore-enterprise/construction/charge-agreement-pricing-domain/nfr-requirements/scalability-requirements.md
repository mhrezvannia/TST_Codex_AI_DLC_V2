# Scalability Requirements - charge-agreement-pricing-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Charge must support first-release enterprise commercial data and request volume without redesigning the domain model.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| Agreements | At least 5,000 agreements. |
| Tariff/charge terms | At least 25,000 active or historical terms. |
| D&D rules | At least 500 rules across import demurrage, import detention, and export detention. |
| Pricing/D&D requests | At least 10,000 requests in local/CI evidence. |
| Manual exceptions | At least 1,000 manual pricing/D&D exception records. |

## Growth Requirements

- Agreement and tariff lookup must be indexable by customer, lane, commodity, equipment, date, and status.
- D&D rule lookup must be indexable by boundary, location/lane, equipment, commodity where relevant, and date.
- Pricing audit records must be queryable without recalculating historic results.
- Manual fallback queues must be paginated and filterable.

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines agreement, tariff, pricing, D&D, and manual fallback workflows. |
| `business-rules.md` | Defines ownership and evidence rules. |
| `requirements.md` | Supplies agreement, pricing, D&D, and local runtime requirements. |
| `technology-stack.md` | Supplies PostgreSQL and Java/Spring context. |
| `nfr-requirements-questions.md` | Q3 sets commercial scale baseline. |

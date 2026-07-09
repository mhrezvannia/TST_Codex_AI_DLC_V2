# Infrastructure Design Questions - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required for this Construction unit. Prior stages already resolve the Charge Service, pricing database, agreement/tariff storage, D&D rules, idempotency, commercial audit, manual fallback, and Booking/CMM boundary posture.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Evolve `charge-agreement-service` into Charge Service in local `app`/`full` profiles. |
| Compute | Stateless API/calculation service with database-backed agreements, pricing rules, D&D rules, idempotency, manual queue, and audit. |
| Storage | `pricing` logical database/user for agreements, tariffs, charge terms, D&D rules, pricing results, manual fallback, idempotency, and commercial audit. |
| Networking | OpenAPI/Pact endpoints for agreement, pricing, and D&D APIs; no Booking/CMM database access. |
| Monitoring | Pricing latency, D&D latency, active lookup, no-price/manual-required states, audit, stale versions, and boundary violations. |
| Security | Capability enforcement, service identity, commercial audit, redacted logs, and ownership guards. |
| Scaling | Indexed agreement/tariff/rule lookup, deterministic calculations, idempotency, and paginated manual/audit queues. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact table/index names, API route names, rule evaluation order, idempotency TTL, and manual workflow states are implementation details constrained by this design.

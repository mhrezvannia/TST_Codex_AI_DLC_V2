# NFR Design Questions - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define pricing/D&D latency, commercial security controls, scale baseline, idempotency, deterministic calculation, manual fallback, and the brownfield Charge Service evolution path.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Database-backed idempotency, deterministic calculation, typed manual-required states, stale-version rejection, and boundary checks. |
| Scalability | First release supports 5,000 agreements, 25,000 tariff/charge terms, 500 D&D rules, 10,000 pricing/D&D requests, and 1,000 manual exceptions. |
| Performance | Lookup p95 <= 300 ms, pricing p95 <= 500 ms, D&D p95 <= 1 second, lifecycle commands p95 <= 500 ms. |
| Security | Keycloak/JWT, capability checks, service auth for Booking, commercial audit, confidential pricing data, and no Booking/CMM SQL access. |
| Logical boundaries | Charge owns agreements, tariffs, pricing, D&D rules, manual fallback, and commercial audit; Booking/CMM own their lifecycle/status states. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact pricing algorithm internals, index shapes, and Pact fixture details are implementation choices constrained by deterministic outcome and audit requirements.

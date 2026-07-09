# NFR Requirements Questions - charge-agreement-pricing-domain

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Pricing Performance

What pricing/D&D calculation targets should Charge meet?

A. p95 <= 500 ms for standard pricing, p95 <= 1 second for D&D calculation, and p95 <= 300 ms for agreement/tariff lookup under seeded local load. Recommended.
B. p95 <= 2 seconds for all calculations.
C. No target until performance validation.
D. Manual pricing can replace automated targets.
E. Defer performance.
X. Other (please specify)

[Answer]: A

## Q2 - Security

What security controls are mandatory?

A. Keycloak/JWT service/user auth, capability checks for agreement/tariff/D&D/manual pricing actions, commercial audit, and no Booking/CMM database access. Recommended.
B. Service network trust only.
C. UI checks only.
D. No auth for pricing APIs.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q3 - Scale

What first-release commercial scale should be supported?

A. At least 5,000 agreements, 25,000 tariff/charge terms, 500 D&D rules, and 10,000 pricing/D&D requests in local/CI evidence. Recommended.
B. Demo data only.
C. Unlimited with no target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q4 - Reliability

What reliability posture should pricing and D&D use?

A. Database-backed idempotency, deterministic calculation, auditable manual fallback, timeout-safe APIs, and fail-closed boundary checks. Recommended.
B. Best-effort pricing.
C. In-memory idempotency.
D. Manual pricing only.
E. Defer reliability.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. Evolve existing `charge-agreement-service` into Charge Service on Java/Spring Boot/PostgreSQL with OpenAPI/Pact-backed pricing and D&D APIs. Recommended.
B. Replace service from scratch immediately.
C. Store pricing in Booking.
D. Use spreadsheet calculations.
E. Defer stack.
X. Other (please specify)

[Answer]: A

# Tech Stack Decisions - booking-charge-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The integration uses service APIs and executable contracts, not shared databases or frontend-owned pricing calls.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Provider/consumer services | Booking Service and Charge Service | Preserves approved ownership. |
| HTTP contract | OpenAPI | Defines pricing request/result API. |
| Contract verification | HTTP Pact | Required for Booking consumer and Charge provider evidence. |
| Persistence | PostgreSQL | Booking snapshots/idempotency and Charge idempotency/audit. |
| Runtime | Docker Compose local app/full profiles | Required for local E2E evidence. |
| Security | Keycloak/JWT service auth | Required for protected service seam. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Shared database integration | Violates service ownership. |
| Enterprise Web direct Charge call for booking pricing | Violates Booking orchestration ownership. |
| Mock pricing as readiness | Violates no-fake-completion rules. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines pricing seam and snapshot evidence. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies Booking/Charge pricing integration requirements. |
| `technology-stack.md` | Supplies OpenAPI, Pact, Spring, PostgreSQL, Docker Compose, and Keycloak context. |
| `nfr-requirements-questions.md` | Q5 selects the integration stack posture. |

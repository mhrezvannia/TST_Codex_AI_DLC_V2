# Tech Stack Decisions - dnd-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

D&D integration uses service APIs and executable contracts, preserving Booking, Charge, and CMM boundaries.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Trigger owner | Booking Service | Booking decides D&D relevance from lifecycle and movement status facts. |
| Calculation owner | Charge Service | Charge owns D&D rules, free time, rates, and calculation. |
| Movement facts | Container Movement Service via prior status event | CMM supplies facts/status only. |
| HTTP contract | OpenAPI | Defines D&D request/result API. |
| Contract verification | HTTP Pact | Required for Booking consumer and Charge provider evidence. |
| Persistence | PostgreSQL | Booking snapshots/idempotency and Charge D&D idempotency/audit. |
| Security | Keycloak/JWT service auth | Required for protected service seam. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Shared database integration | Violates service ownership. |
| CMM deciding D&D relevance | Violates Booking ownership. |
| Booking calculating D&D | Violates Charge ownership. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines D&D trigger, request/result, snapshot, and fallback workflow. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies D&D integration requirements. |
| `technology-stack.md` | Supplies OpenAPI, Pact, Spring, PostgreSQL, Docker Compose, and Keycloak context. |
| `nfr-requirements-questions.md` | Q5 selects D&D integration stack posture. |

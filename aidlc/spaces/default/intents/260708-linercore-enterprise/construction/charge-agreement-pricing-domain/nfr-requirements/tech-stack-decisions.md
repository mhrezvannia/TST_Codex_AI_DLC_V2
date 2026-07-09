# Tech Stack Decisions - charge-agreement-pricing-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The approved posture is to evolve the existing `charge-agreement-service` into the broader Charge Service through an approved migration.

## Selected Stack

| Area | Decision | Rationale |
|---|---|---|
| Service | Evolve `charge-agreement-service` into Charge Service | Reuses brownfield work while adding pricing and D&D capability. |
| Backend runtime | Java 21, Spring Boot 3.3.7, Maven | Matches backend stack. |
| Persistence | PostgreSQL logical `pricing` database/user | Supports agreements, tariffs, pricing audit, D&D rules, idempotency, and exceptions. |
| HTTP contracts | OpenAPI and Pact | Required for Booking -> Charge pricing and D&D APIs. |
| Security | Keycloak/JWT capability checks | Aligns with Shared Platform identity. |
| Runtime | Docker Compose service integrated into app/full profiles | Aligns with local-first runtime. |

## Deferred Choices

| Deferred item | Reason |
|---|---|
| Replacing Charge from scratch | Higher risk than brownfield evolution. |
| Booking-owned pricing | Violates ownership. |
| CMM-owned D&D relevance/rates | Violates ownership split. |

## Traceability

| Source | Tech-stack coverage |
|---|---|
| `business-logic-model.md` | Defines agreement, pricing, D&D, manual fallback, and audit workflows. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies FR-CHG and integration requirements. |
| `technology-stack.md` | Supplies Java/Spring, Maven, PostgreSQL, OpenAPI, and Pact context. |
| `nfr-requirements-questions.md` | Q5 selects brownfield Charge service evolution. |

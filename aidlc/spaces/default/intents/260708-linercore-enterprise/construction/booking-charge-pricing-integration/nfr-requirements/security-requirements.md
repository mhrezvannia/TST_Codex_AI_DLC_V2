# Security Requirements - booking-charge-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The pricing seam crosses Booking and Charge service boundaries and must authenticate service identity, preserve user/action context, and prevent database or business-rule ownership leakage.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Service auth | Booking -> Charge calls validate service-to-service JWT/RS256. |
| User context | Pricing request carries auditable user/capability context where required. |
| Idempotency | Request includes idempotency key and request hash. |
| Correlation | Request/response/log/trace include correlation ID. |
| Denied path | Unauthorized/forbidden pricing calls have contract and test evidence. |
| Boundary | Booking cannot calculate Charge pricing; Charge cannot mutate Booking lifecycle. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines pricing request/response and evidence workflow. |
| `business-rules.md` | Defines security context, idempotency, and boundary validation. |
| `requirements.md` | Supplies FR-CHG-005, FR-BKG-002, NFR-SEC, and no-cross-database constraints. |
| `technology-stack.md` | Supplies JWT/Keycloak, OpenAPI/Pact, and service stack context. |
| `nfr-requirements-questions.md` | Q2 sets security controls. |

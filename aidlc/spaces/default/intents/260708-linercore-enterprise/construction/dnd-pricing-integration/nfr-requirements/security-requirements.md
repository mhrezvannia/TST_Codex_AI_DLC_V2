# Security Requirements - dnd-pricing-integration

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The D&D seam crosses Booking and Charge boundaries and handles commercial charge outcomes, so it requires authenticated service calls and auditable fallback.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Service auth | Booking -> Charge D&D calls validate service-to-service JWT/RS256. |
| User/action context | D&D trigger carries auditable Booking user/action context where available. |
| Idempotency | D&D request includes idempotency key and request hash. |
| Correlation | Request/result/log/trace include correlation ID. |
| Audit | Trigger, request, result, manual fallback, and exception decisions are audited. |
| Boundary | Booking triggers and stores result; Charge calculates; CMM only supplies movement facts/status. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines D&D trigger, request/result, snapshot, and fallback workflow. |
| `business-rules.md` | Defines security context and boundary validation. |
| `requirements.md` | Supplies FR-CHG-008, FR-BKG-009, NFR-SEC, and ownership constraints. |
| `technology-stack.md` | Supplies JWT/Keycloak, OpenAPI/Pact, and service stack context. |
| `nfr-requirements-questions.md` | Q2 sets security controls. |

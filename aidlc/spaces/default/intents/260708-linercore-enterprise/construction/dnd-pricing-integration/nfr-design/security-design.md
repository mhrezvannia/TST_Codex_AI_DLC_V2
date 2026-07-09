# Security Design - dnd-pricing-integration

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The D&D seam crosses Booking and Charge boundaries and handles commercial charge outcomes, so it requires authenticated service calls and auditable fallback.

## Seam Security

| Control | Design |
|---|---|
| Service auth | Booking-to-Charge D&D calls validate service-to-service JWT/RS256. |
| User/action context | D&D trigger carries auditable Booking user/action context where available. |
| Idempotency | D&D request includes idempotency key and request hash. |
| Correlation | Request, result, log, trace, snapshot, and exception records include correlation ID. |
| Audit | Trigger, request, result, manual fallback, and exception decisions are audited. |
| Boundary | Booking triggers and stores result; Charge calculates; CMM only supplies movement facts/status. |

## Boundary Enforcement

Booking does not calculate D&D. Charge does not mutate Booking lifecycle. CMM does not decide D&D relevance. The seam uses service APIs and executable contracts, not shared database state.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements service auth, user/action context, idempotency, correlation, audit, and boundaries. |
| `performance-requirements.md` | Keeps security metadata in the trigger/request/snapshot path without exceeding budgets. |
| `scalability-requirements.md` | Scales secure evidence across D&D requests, manual fallback cases, Pact interactions, and snapshots. |
| `reliability-requirements.md` | Ensures timeout, no-rule, conflict, duplicate, and Pact-failure outcomes remain auditable. |
| `tech-stack-decisions.md` | Uses Keycloak/JWT, OpenAPI/Pact, Booking/Charge/CMM service boundaries, and PostgreSQL. |
| `business-logic-model.md` | Implements D&D trigger, request/result, snapshot, fallback, and audit workflow. |

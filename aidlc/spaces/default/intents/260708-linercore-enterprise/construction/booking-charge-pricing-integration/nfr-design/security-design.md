# Security Design - booking-charge-pricing-integration

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The pricing seam crosses Booking and Charge service boundaries and must authenticate service identity, preserve user/action context, and prevent ownership leakage.

## Seam Security

| Control | Design |
|---|---|
| Service auth | Booking-to-Charge calls include service JWT/RS256 subject validated by Charge. |
| User context | Pricing requests carry auditable user/capability context where required. |
| Idempotency | Request includes idempotency key and request hash accepted by both sides. |
| Correlation | Request, response, log, trace, snapshot, and exception records carry correlation ID. |
| Denied path | Unauthorized and forbidden pricing calls have OpenAPI/Pact and test evidence. |
| Boundary | Booking cannot calculate pricing; Charge cannot mutate Booking lifecycle; no shared database. |

## Evidence And Audit

Booking records pricing snapshot or pricing exception with service subject, user/action context, request hash, Charge result status, pricingRef where present, correlation ID, and timestamp. Charge records pricing basis and calculation audit.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements service auth, user context, idempotency, correlation, denied paths, and boundary controls. |
| `performance-requirements.md` | Keeps security metadata in the request preparation and snapshot path without exceeding seam budgets. |
| `scalability-requirements.md` | Scales secure evidence across request, failure/manual, Pact, and snapshot volumes. |
| `reliability-requirements.md` | Ensures security failures do not retry as transient pricing failures and Pact failures block readiness. |
| `tech-stack-decisions.md` | Uses Keycloak/JWT, OpenAPI/Pact, Booking/Charge services, PostgreSQL, and Docker Compose runtime. |
| `business-logic-model.md` | Implements pricing request/response, evidence, snapshot, and fallback workflows. |

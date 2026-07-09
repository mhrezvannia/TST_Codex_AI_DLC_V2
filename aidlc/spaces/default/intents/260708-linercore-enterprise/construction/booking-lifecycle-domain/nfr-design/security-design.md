# Security Design - booking-lifecycle-domain

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Booking owns sensitive operational and commercial workflow state and must enforce authorization at API, orchestration, event, and exception boundaries.

## Authorization Surfaces

| Surface | Control |
|---|---|
| Booking create/update | Keycloak/JWT subject validation and booking write capability. |
| Confirm/reconfirm | Specific confirmation capability, stale revision check, and audit. |
| Amend/override | Amendment or override capability plus required reason and approver subject. |
| Exception queue | Queue view/assign/resolve capabilities by owner and reason. |
| Pricing/D&D seams | Service-to-service auth, correlation, idempotency, and contract-backed identity validation. |
| CMM event consumption | Producer identity, schema/version validation, deduplication, and correlation. |

## Boundary Enforcement

Booking cannot calculate prices, D&D rates/free time, or movement status. Attempts to issue commands that require Charge or CMM-owned calculations fail closed or open explicit integration exceptions. Booking never queries Charge or CMM databases.

## Audit Design

Lifecycle, pricing request, manual override, exception, amendment, reconfirmation, and D&D trigger actions produce audit records with subject, service identity where applicable, booking id, revision, action, decision, reason, correlation ID, and timestamp.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements authentication, authorization, service seams, audit, domain boundaries, and database isolation controls. |
| `performance-requirements.md` | Keeps capability and audit checks inside bounded command/query paths. |
| `scalability-requirements.md` | Scales audit and exception security across bookings, revisions, exceptions, events, and users. |
| `reliability-requirements.md` | Fails closed for duplicate commands, stale revisions, ownership violations, and forged integration results. |
| `tech-stack-decisions.md` | Uses Keycloak/JWT, Spring service security, PostgreSQL, Kafka, contract tooling, and service identity validation. |
| `business-logic-model.md` | Implements authorized commands, pricing orchestration, confirmation, amendments, exception workflows, and audit. |

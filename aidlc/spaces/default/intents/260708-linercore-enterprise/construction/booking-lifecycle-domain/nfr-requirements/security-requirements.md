# Security Requirements - booking-lifecycle-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Booking owns sensitive operational and commercial workflow state and must enforce authorization at API, orchestration, event, and exception boundaries.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Authentication | Keycloak/JWT user and service subject validation. |
| Authorization | Capability checks for booking create/update/confirm/amend/override/exception actions. |
| Service seams | Service-to-service auth for Charge pricing/D&D and CMM event integrations. |
| Audit | Lifecycle, pricing request, manual override, exception, amendment, and D&D trigger actions are auditable. |
| Boundary | Booking cannot calculate prices, D&D rates/free time, or movement status. |
| Database isolation | Booking cannot query Charge or CMM databases. |

## Threat Requirements

| Threat | Control |
|---|---|
| Unauthorized booking confirmation | Capability check and denied-path audit. |
| Forged pricing result | Contract-backed service identity and correlation/idempotency validation. |
| Duplicate command | Database-backed idempotency. |
| Cross-domain leakage | Service API/event contracts only, no cross-service SQL. |
| Hidden manual override | Required audit reason and approver subject. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines authorized commands, pricing orchestration, confirmation, amendments, and exception workflows. |
| `business-rules.md` | Defines ownership, validation, and boundary rules. |
| `requirements.md` | Supplies FR-BKG, NFR-SEC, and no-cross-service database constraints. |
| `technology-stack.md` | Supplies Keycloak/JWT, Java/Spring, PostgreSQL, Kafka, and contract tooling context. |
| `nfr-requirements-questions.md` | Q2 sets booking security controls. |

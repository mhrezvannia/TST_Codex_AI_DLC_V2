# Security Requirements - container-movement-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

CMM protects operational movement facts, journey status, and event publication while keeping Booking and Charge ownership boundaries intact.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Authentication | Keycloak/JWT user and service subject validation. |
| Authorization | Capability checks for journey query, movement capture, status, and history actions. |
| Event security | Service identity for `booking.confirmed` consumption and `containermovement.status` publication. |
| Audit | Movement capture, validation failure, status derivation, and manual correction actions are auditable. |
| Boundary | CMM does not decide D&D relevance, mutate Booking lifecycle, or calculate pricing/D&D. |
| Database isolation | CMM cannot query Booking or Charge databases. |

## Threat Requirements

| Threat | Control |
|---|---|
| Forged movement event | Authenticated subject/service identity and validation. |
| Duplicate event abuse | Deduplication keys and idempotent handling. |
| Out-of-order status corruption | Ordering/staleness checks. |
| Boundary leakage | Architecture tests and no cross-service SQL checks. |
| Unauthorized status view | Capability checks and audit. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines authorized movement capture, validation, status, and publication workflows. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies FR-CMM, NFR-SEC, and no-cross-service database constraints. |
| `technology-stack.md` | Supplies Keycloak/JWT, Java/Spring, PostgreSQL, Kafka, and contracts context. |
| `nfr-requirements-questions.md` | Q2 sets CMM security controls. |

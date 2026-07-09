# Security Requirements - charge-agreement-pricing-domain

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Charge owns commercial agreement, tariff, pricing, and D&D calculation behavior and must protect sensitive commercial changes and price outcomes.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Authentication | Keycloak/JWT user and service subject validation. |
| Authorization | Capability checks for agreement, tariff, pricing, D&D, and manual fallback actions. |
| Service access | Booking calls pricing/D&D APIs through authenticated service seam. |
| Audit | Agreement approval, tariff change, pricing result, manual pricing, and D&D resolution are auditable. |
| Boundary | Charge cannot mutate Booking lifecycle, derive CMM status, or query Booking/CMM databases. |
| Data protection | Pricing and agreement terms are confidential commercial data. |

## Threat Requirements

| Threat | Control |
|---|---|
| Unauthorized tariff change | Capability check and audit. |
| Forged pricing request | Service JWT validation and idempotency key. |
| Price tampering | Deterministic calculation, persisted audit basis, and contract-backed result. |
| Boundary violation | Architecture tests and no cross-service SQL checks. |
| Manual fallback abuse | Approver, reason, audit, and exception state required. |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines agreement, pricing, D&D, manual fallback, and audit workflows. |
| `business-rules.md` | Defines ownership and boundary rules. |
| `requirements.md` | Supplies FR-CHG, NFR-SEC, and no-cross-database constraints. |
| `technology-stack.md` | Supplies Keycloak/JWT, Java/Spring, PostgreSQL, and contract tooling context. |
| `nfr-requirements-questions.md` | Q2 sets Charge security controls. |

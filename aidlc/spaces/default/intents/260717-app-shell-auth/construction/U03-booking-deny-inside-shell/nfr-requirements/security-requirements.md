# Security Requirements - U03 Booking Deny

## Source Context

These security requirements consume U03 `business-logic-model.md`, U03 `business-rules.md`, `requirements.md`, and `technology-stack.md`. U03 proves fail-closed authorization for an authenticated user without Booking access.

## Authorization Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-01 | `local.reference.admin` remains authenticated and without Booking permissions. | Seed/catalog review. |
| SEC-02 | booking-service calls identity-service to authorize the requested Booking action for the real subject. | Integration test/log evidence. |
| SEC-03 | Deny prevents Booking data disclosure and mutation. | Live deny proof and tests. |
| SEC-04 | Missing actor, unknown subject, timeout, or identity error fail closed and never retry as `local-user`. | Negative tests. |
| SEC-05 | Deny evidence records subject, action/resource, decision reason/reference, and correlation id. | Evidence package. |

## Threat Controls

| Threat | Control |
| --- | --- |
| Unauthorized data disclosure | Deny maps to 403/access denied, not empty success or partial data. |
| Privilege drift | U02 seed changes must not grant Booking permissions to `local.reference.admin`. |
| Repudiation | Decision/correlation evidence is captured. |
| Elevation through shell nav | Shell nav does not become authority; backend identity authorization decides. |

## Compliance

Denied evidence is audit data and should include only QA-safe subject/decision/correlation fields. Raw tokens and secrets remain prohibited.

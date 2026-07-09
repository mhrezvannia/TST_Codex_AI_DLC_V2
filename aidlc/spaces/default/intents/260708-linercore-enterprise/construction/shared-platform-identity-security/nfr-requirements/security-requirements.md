# Security Requirements - shared-platform-identity-security

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

This unit is the primary security enforcement foundation for authenticated user access, role/capability authorization, authorization audit, service-to-service JWT/RS256 validation, and Kafka ACL design hooks.

## Mandatory Controls

| Control | Requirement |
|---|---|
| User authentication | Enterprise users authenticate through Keycloak-backed flows. |
| Token validation | Validate issuer, audience, signature, expiry, and required claims. |
| Authorization model | Enforce roles plus capability identifiers for protected modules/actions. |
| Denied paths | Denied access paths are tested and audited. |
| Authorization audit | Denied decisions and sensitive allowed decisions are durable and correlated. |
| Service identity | Protected service-to-service calls validate JWT/RS256 service subjects. |
| Kafka identities | Protected event producer/consumer identities have ACL design hooks. |
| Local bypass | Bypass is explicit, local-only, visible, and rejected outside local mode. |

## Threat Requirements

| Threat | Control |
|---|---|
| Token spoofing | RS256 signature, issuer, audience, expiry, and claim validation. |
| Route hiding treated as auth | Backend enforcement remains mandatory for protected actions. |
| Over-broad roles | Capability-level checks and least-privilege role mapping. |
| Missing audit | Denied and sensitive allow decisions write audit records. |
| Service impersonation | Distinct service subjects and JWT validation. |
| Secret leakage | Audit records exclude full tokens and secrets. |

## Compliance And Privacy

- Identity records, roles, capabilities, and audit records are confidential internal data.
- Audit records must support release and incident review without storing full tokens or secrets.
- Local fixtures use deterministic synthetic users and service identities.
- No payment card, PHI, or production personal data is introduced by this unit.

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines user auth, action authorization, capability catalog, and service-to-service validation. |
| `business-rules.md` | Defines authentication, authorization, service security, audit, and boundary rules. |
| `requirements.md` | Supplies NFR-SEC-001 through NFR-SEC-004 and FR-SP-002/003. |
| `technology-stack.md` | Supplies Keycloak, Java/Spring, PostgreSQL, and frontend auth package context. |
| `nfr-requirements-questions.md` | Q2 defines mandatory security strictness. |

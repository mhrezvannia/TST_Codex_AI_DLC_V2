# Security Design - shared-platform-identity-security

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

This unit is the primary security enforcement foundation for authenticated users, service identities, role/capability authorization, and authorization audit.

## Authentication And Token Validation

| Control | Design |
|---|---|
| User authentication | Enterprise users authenticate through Keycloak-backed flows. |
| Token validation | Identity and protected services validate issuer, audience, RS256 signature, expiry, and required claims. |
| Subject mapping | Token claims map to an `AuthenticatedSubject`; ambiguous mappings deny access. |
| Local bypass | Bypass requires explicit local mode, is visible in readiness output, and is rejected outside local mode. |
| Service identity | Service-to-service calls validate JWT/RS256 service subjects and required capabilities. |

## Authorization Model

Authorization evaluates `subject + module + action + resource context + correlationId`.

| Layer | Responsibility |
|---|---|
| Capability catalog | Stable module-scoped capability identifiers for protected actions. |
| Role mapping | Least-privilege role-to-capability grants. |
| Policy evaluator | Returns allow, deny, or indeterminate with reason code. |
| Backend enforcement | Protected backend actions enforce authorization even if UI route guards are present. |
| UI guard support | Enterprise Web receives safe effective-permission summaries for route/action hints only. |

Route hiding is not authorization. Denied-path tests must prove backend enforcement for protected actions.

## Audit Design

Authorization audit records include subject, module, action, resource context, decision, reason, correlation ID, service identity where applicable, and timestamp. They never store full tokens, secrets, or production personal data.

Denied decisions and sensitive allowed decisions are durable and queryable. Audit query paths filter by subject, action, resource, decision, reason, and correlation ID.

## Threat Controls

| Threat | Design response |
|---|---|
| Token spoofing | RS256 signature, issuer, audience, expiry, and required-claim validation. |
| Frontend-only authorization | Backend service enforcement remains mandatory. |
| Over-broad roles | Capability-level checks and least-privilege role mapping. |
| Missing audit | Denied and sensitive allowed decisions write audit records. |
| Service impersonation | Distinct service subjects and JWT validation. |
| Secret leakage | Audit and logs exclude full tokens and secrets. |
| Kafka identity gap | Kafka ACL design hooks preserve producer/consumer identity requirements. |

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements Keycloak auth, token validation, capability checks, denied paths, durable audit, service identity, Kafka identity hooks, and local bypass constraints. |
| `performance-requirements.md` | Keeps security decisions efficient through read-optimized permission lookup and local JWT validation. |
| `scalability-requirements.md` | Supports module-scoped capabilities, roles/service identities, audit filters, and Enterprise Web permission summaries. |
| `reliability-requirements.md` | Fails closed for invalid tokens, expired tokens, missing capabilities, ambiguous subjects, service JWT failures, and unsafe bypass. |
| `tech-stack-decisions.md` | Reuses Keycloak, `identity-service`, Java/Spring, PostgreSQL, JWT/RS256, frontend auth packages, and Kafka ACL hooks. |
| `business-logic-model.md` | Implements authentication, authorization, capability catalog, audit, and service-to-service validation workflows. |

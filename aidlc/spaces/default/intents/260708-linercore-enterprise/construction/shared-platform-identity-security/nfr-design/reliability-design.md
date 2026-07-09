# Reliability Design - shared-platform-identity-security

## Source Context

This artifact consumes `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Identity reliability means protected actions fail closed, audit evidence is durable, and local authentication/security behavior is deterministic.

## Fail-Closed Decision Matrix

| Failure | Behavior |
|---|---|
| Invalid token | Reject as unauthenticated and do not attempt domain action. |
| Expired token | Return re-authentication state. |
| Missing capability | Deny with reason code and audit. |
| Ambiguous subject | Deny with reason code and audit. |
| Invalid service JWT | Reject service call and log or audit according to configured sensitivity. |
| Local bypass outside local mode | Fail configuration validation and block startup/readiness. |
| Capability catalog mismatch | Fail tests and block integration readiness. |

## Audit Reliability

Audit writes for denied decisions and sensitive allowed decisions are durable. Records include subject, action, resource context, decision, reason, correlation ID, timestamp, and service identity where applicable.

If audit persistence fails for a sensitive action, the service either blocks the action or marks readiness failed according to action criticality. It never silently proceeds with missing required audit evidence.

## Recovery And Health

| Recovery concern | Design |
|---|---|
| Keycloak bootstrap failure | Visible in local runtime health with import logs and realm/client context. |
| JWT/JWKS validation failure | Fails protected calls and reports issuer/audience/config mismatch without exposing tokens. |
| Cache invalidation failure | Fails tests before integration readiness and exposes capability catalog version mismatch. |
| Audit persistence failure | Produces explicit service health/evidence failure. |
| Denied-path regression | Build and Test blocks readiness through protected action tests. |

## Deterministic Local Security

Local fixtures use deterministic synthetic users, roles, capabilities, service identities, and audit records. This makes denied-path, allowed-path, and service-to-service tests reproducible across Windows local runtime and CI.

## Traceability

| Source | Design response |
|---|---|
| `reliability-requirements.md` | Implements fail-closed token, capability, subject, service JWT, local bypass, audit, and recovery requirements. |
| `performance-requirements.md` | Keeps audit and authorization reliability in the request path while respecting latency budgets. |
| `security-requirements.md` | Ensures backend enforcement, denied-path audit, service identity, and no token/secret leakage. |
| `scalability-requirements.md` | Makes capability catalog, audit queries, and permission lookup reliability testable at first-release scale. |
| `tech-stack-decisions.md` | Uses Keycloak, Identity Service, Java/Spring, PostgreSQL, JWT/RS256, frontend auth packages, and Kafka ACL hooks. |
| `business-logic-model.md` | Implements authenticate subject, authorize action, manage capability catalog, and validate service-to-service request workflows. |

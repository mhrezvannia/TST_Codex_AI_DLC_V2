# Reliability Requirements - shared-platform-identity-security

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Identity reliability means protected actions fail closed, audit evidence is durable, and local authentication/security behavior is deterministic.

## Fail-Closed Requirements

| Failure | Required behavior |
|---|---|
| Invalid token | Reject as unauthenticated; do not attempt domain action. |
| Expired token | Return re-authentication state. |
| Missing capability | Deny with reason code and audit. |
| Ambiguous subject | Deny with reason code and audit. |
| Service JWT invalid | Reject service call and log/audit where configured. |
| Local bypass outside local mode | Fail configuration validation and block startup/readiness. |

## Audit Reliability

- Denied decisions are durable and queryable.
- Sensitive allowed decisions are durable and queryable.
- Audit records include subject, action, resource context, decision, reason, correlation ID, and timestamp.
- Audit records never include full tokens or secrets.
- Audit writes failing for sensitive actions must block or mark readiness failed according to action criticality.

## Recovery Requirements

- Keycloak bootstrap failures are visible in local runtime health.
- Capability catalog mismatches fail tests before integration readiness.
- Authorization cache invalidation behavior is documented and testable.
- Audit persistence failures produce explicit service health/evidence failures.

## Traceability

| Source | Reliability coverage |
|---|---|
| `business-logic-model.md` | Defines error handling for invalid tokens, denied access, local bypass, and service validation. |
| `business-rules.md` | Defines authentication, authorization, service security, and audit rules. |
| `requirements.md` | Supplies NFR-SEC and denied-path test requirements. |
| `technology-stack.md` | Supplies Keycloak, Java/Spring, and PostgreSQL context. |
| `nfr-requirements-questions.md` | Q4 defines audit reliability posture. |

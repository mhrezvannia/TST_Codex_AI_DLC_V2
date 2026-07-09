# Scalability Requirements - shared-platform-identity-security

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The identity/security foundation must cover all first-release enterprise modules, users, service identities, capabilities, and audit evidence without redesign.

## First-Release Scale Baseline

| Dimension | Target |
|---|---|
| Modules | At least 10 protected modules or route groups. |
| Capabilities | At least 100 capability identifiers. |
| Roles/service identities | At least 25 combined user roles and service identities. |
| Audit records | At least 10,000 authorization audit records in seeded local validation. |
| Effective-permission lookups | At least 50 concurrent local UI/session lookups. |

## Growth Requirements

- Capability identifiers must be stable and module-scoped.
- Effective-permission responses must support Enterprise Web route/action guards without exposing backend-only secrets.
- Role/capability changes must be testable and auditable.
- Audit query paths must filter by subject, action, resource, decision, reason, and correlation ID.

## Traceability

| Source | Scalability coverage |
|---|---|
| `business-logic-model.md` | Defines subject, capability, authorization, audit, and service identity workflows. |
| `business-rules.md` | Defines role/capability and audit rules. |
| `requirements.md` | Supplies enterprise module security and audit requirements. |
| `technology-stack.md` | Supplies identity service, Keycloak, and PostgreSQL context. |
| `nfr-requirements-questions.md` | Q3 sets the capability catalog scale baseline. |

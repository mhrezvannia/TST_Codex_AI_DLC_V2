# Security Requirements - shared-platform-reference-events

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

Reference Data is shared platform infrastructure and must protect reference lifecycle operations, validation APIs, event publication, and history/audit access.

## Mandatory Controls

| Control | Requirement |
|---|---|
| Authentication | Keycloak/JWT subject validation for protected APIs. |
| Authorization | Role/capability checks for reference administration, validation, history, and event operations. |
| Service access | Service callers use approved service identity or capability for validation APIs. |
| Audit | Mutations, denied access, and sensitive lifecycle changes are auditable. |
| Database boundary | Consumers use APIs/events, not direct database joins. |
| Event security | Reference events include producer identity, correlation ID, schema version, and deduplication fields. |

## Compliance And Data Handling

- Reference records are internal operational data unless a specific set is classified more strictly.
- History and audit records must not expose secrets.
- Deterministic seed reference data must avoid production personal data.
- Reference event examples must pass secret scanning and schema validation.

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Defines authorized commands, reference validation, event publication, and exception handling. |
| `business-rules.md` | Defines identity/security, audit, and boundary validation rules. |
| `requirements.md` | Supplies FR-SP-004, FR-SP-005, NFR-SEC, and no-cross-service SQL constraints. |
| `technology-stack.md` | Supplies Keycloak, Java/Spring, PostgreSQL, Kafka, Schema Registry context. |
| `nfr-requirements-questions.md` | Q3 sets reference security controls. |

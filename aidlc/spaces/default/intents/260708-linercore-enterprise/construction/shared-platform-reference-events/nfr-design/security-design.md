# Security Design - shared-platform-reference-events

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

Reference Data is shared platform infrastructure. It protects lifecycle operations, validation APIs, event publication, history, audit, and service boundaries.

## Access Controls

| Surface | Control |
|---|---|
| Reference administration | Keycloak/JWT authentication and role/capability authorization. |
| Validation APIs | Approved service identity or capability for consumer modules. |
| History queries | Capability-gated access with audit for sensitive lifecycle review. |
| Event publication | Producer identity, correlation ID, schema version, deduplication key, and Schema Registry compatibility. |
| Database access | Consumers use APIs/events only; no direct database joins. |

## Data Handling

Reference records are internal operational data unless a specific set is classified more strictly. History and audit records must not expose secrets. Deterministic seed reference data must avoid production personal data. Reference event examples pass secret scanning and schema validation before readiness.

## Audit And Event Security

Mutations, denied access, and sensitive lifecycle changes emit audit records with subject or service identity, action, reference set, record key, decision, reason, correlation ID, and timestamp. Events include producer identity, correlation ID, schema version, and deduplication fields.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements authentication, authorization, service access, audit, database boundary, event security, and data handling controls. |
| `performance-requirements.md` | Keeps security checks inside bounded validation and mutation paths. |
| `scalability-requirements.md` | Scales controls across reference sets, records, history rows, events, and consumer modules. |
| `reliability-requirements.md` | Ensures forbidden mutations do not mutate state and Schema Registry/Kafka failures preserve outbox evidence. |
| `tech-stack-decisions.md` | Reuses Keycloak/JWT, Reference Data Service, PostgreSQL, Kafka, Schema Registry, Avro, and OpenAPI. |
| `business-logic-model.md` | Implements authorized commands, validation APIs, event publication, outbox health, and boundary enforcement. |

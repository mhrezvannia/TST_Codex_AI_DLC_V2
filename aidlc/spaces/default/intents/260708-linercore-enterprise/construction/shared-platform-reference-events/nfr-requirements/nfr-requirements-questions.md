# NFR Requirements Questions - shared-platform-reference-events

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - API And Validation Performance

What performance target should reference read and validation APIs meet?

A. p95 <= 150 ms for seeded reference lookups/validation and p95 <= 300 ms for create/update lifecycle commands under local seeded load. Recommended.
B. p95 <= 1 second for all operations.
C. No target until performance validation.
D. UI latency only matters.
E. Defer to Operation.
X. Other (please specify)

[Answer]: A

## Q2 - Event Publication Reliability

How reliable must reference-data changed publication be?

A. Transactional outbox with at-least-once publish, deduplication keys, retryable failures, and no lost committed reference changes. Recommended.
B. Best-effort publish.
C. Direct publish without outbox.
D. Manual event replay only.
E. Defer reliability to later.
X. Other (please specify)

[Answer]: A

## Q3 - Security

What security controls are required?

A. Keycloak/JWT subject validation, role/capability authorization, service authorization for validation APIs, audit on mutations/denials, and no cross-service database access. Recommended.
B. Public read access to all reference data.
C. Auth only for UI.
D. Network trust only.
E. Defer security.
X. Other (please specify)

[Answer]: A

## Q4 - Scale

What first-release scale should be supported?

A. At least 50 reference sets, 10,000 reference records, 100,000 history rows, and 10,000 changed events in local/CI evidence. Recommended.
B. Only current MVP sets.
C. Unlimited without target.
D. No scale target.
E. Defer scale.
X. Other (please specify)

[Answer]: A

## Q5 - Stack

What technology posture should be used?

A. Harden existing `reference-data-service` on Java/Spring Boot/PostgreSQL with Kafka, Avro, Schema Registry, transactional outbox, and existing OpenAPI contracts. Recommended.
B. Replace the service.
C. Keep in-memory adapters.
D. Move reference data to frontend config.
E. Defer stack.
X. Other (please specify)

[Answer]: A

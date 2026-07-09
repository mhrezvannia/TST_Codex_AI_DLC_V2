# Functional Design Questions - contract-platform-catalog

## Source Context

These questions consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

Graphify was queried through `python -m graphify` for contract-platform-catalog context because the `graphify.exe` shim returned access denied in this shell. The graph result confirmed relevant nodes for OpenAPI/AsyncAPI, Avro schemas, Pact/message-pact fixtures, Schema Registry, `US-SP-006 - Validate executable contracts`, and prior contract DX artifacts.

## Q1 - Catalog Source Of Truth

Where should executable contract source files live?

A. Under a dedicated `contracts/` tree with subfolders for `openapi/`, `asyncapi/`, `avro/`, `pact/`, `message-pact/`, fixtures, and generated reports. Recommended because existing enterprise design treats contracts as a cross-cutting platform asset used by services, CI, and local runtime.
B. Inside each service repository folder only, with no shared catalog.
C. Generated only from implementation code after services exist.
D. Stored only as markdown in `docs/enterprise-contracts/`.
E. Managed by a separate external contract registry before local implementation.
X. Other (please specify)

[Answer]: A

## Q2 - Compatibility Gate Policy

Which policy should block integration readiness claims?

A. OpenAPI lint/schema validation, AsyncAPI validation, Avro backward compatibility, Schema Registry compatibility, HTTP Pact verification, message-pact verification, and correlation/idempotency/auth field checks must all pass for touched seams. Recommended and required by `requirements.md` and `team-practices.md`.
B. Only OpenAPI validation is required initially.
C. Only provider-side tests are required; consumers can catch issues later.
D. Compatibility checks run in CI only, not locally.
E. Contract checks are advisory and cannot block readiness.
X. Other (please specify)

[Answer]: A

## Q3 - Fixture And Example Ownership

Who owns canonical examples and fixtures for contract tests?

A. The contract platform owns canonical schema examples, message fixtures, Pact fixtures, and negative examples, while provider/consumer services own service-specific test execution. Recommended because it keeps examples consistent without replacing implementation tests.
B. Each service owns all examples independently.
C. QA owns fixtures only after code generation.
D. Fixtures are generated from production data.
E. Fixtures are optional until Operation.
X. Other (please specify)

[Answer]: A

## Q4 - Error And Exception Contracting

How should contract assets represent errors and exceptional flows?

A. Every API/event seam must include standard error envelopes, validation failures, timeout/retry/idempotency behavior, denied-path examples, stale/duplicate event examples, and exception queue links where applicable. Recommended for Booking-Charge, Booking-CMM, CMM-Booking, reference-data events, and D&D seams.
B. Only happy-path contracts are needed for the first release.
C. Error contracts are left to implementation code comments.
D. Error contracts are documented in runbooks only.
E. Only UI error screens need to be designed.
X. Other (please specify)

[Answer]: A

## Q5 - Contract Platform UI Surface

Does this unit include frontend components?

A. Yes, a lightweight contract health/catalog view in Enterprise Web or an operations route that shows contract status, compatibility reports, schema versions, and failing seams. Recommended as read-only evidence; it must not become a business workflow owner.
B. No frontend component; CLI/CI reports only.
C. Full contract editor UI is required in the first release.
D. External registry UI only.
E. Defer all visibility to Operation dashboards.
X. Other (please specify)

[Answer]: A

## Q6 - Versioning And Publication Model

How should versions be managed?

A. Contract assets use semantic contract versions, compatibility metadata, generated clients/schemas where useful, and published local artifacts consumed by services and CI. Recommended because local runtime and CI must prove executable contracts before integration readiness.
B. Versioning follows service release tags only.
C. Contracts are unversioned until production.
D. Only Avro gets versions; HTTP APIs do not.
E. Versioning is manual spreadsheet tracking.
X. Other (please specify)

[Answer]: A

## Recommended Answer Set

Recommended answers for confirmation: Q1 A, Q2 A, Q3 A, Q4 A, Q5 A, Q6 A.

Rationale: this preserves the approved cross-cutting contract-platform boundary, keeps markdown from being mistaken for readiness, supports local Windows execution and CI, and gives Operation/Enterprise Web enough read-only evidence without moving business ownership into the catalog.

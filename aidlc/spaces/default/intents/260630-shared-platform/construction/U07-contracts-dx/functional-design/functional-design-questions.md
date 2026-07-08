# Functional Design Questions - U07 Published Contracts and Developer Experience

> Stage: Functional Design
> Unit: `U07-contracts-dx`
> Source context: `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`.

## Q1. Contract catalog scope

Which contract surfaces should U07 publish?

A. OpenAPI for `reference-data-service` and `identity-service`, Avro schemas for nine reference-change events, examples, compatibility status, and message-pact/provider fixtures (recommended)
B. OpenAPI only
C. Event schemas only
X. Other (please specify)

[Answer]: A. Full Shared Platform contract catalog (Recommended)

## Q2. Downstream consumer representation

How should Charge, Booking, and Container Movement be represented?

A. Future external consumers only, through contracts, examples, and review notes; no runtime stubs, services, or screens in this workflow (recommended)
B. Add stub downstream services for contract tests
C. Build downstream review UI screens now
X. Other (please specify)

[Answer]: A. Contract-only consumers (Recommended)

## Q3. Compatibility status

How should compatibility status be modeled?

A. Store and expose OpenAPI diff, message-pact/provider, and Avro compatibility outcomes with version, status, finding summary, and evidence links (recommended)
B. Use manual review notes only
C. Defer compatibility status to CI stage
X. Other (please specify)

[Answer]: A. Versioned compatibility status (Recommended)

## Q4. Contract examples

What examples should be included?

A. Request/response examples for provider/admin/authorization APIs and event payload examples with common envelope, correlation id, entity id, operation, and schema version (recommended)
B. Only placeholder examples
C. No examples until downstream teams request them
X. Other (please specify)

[Answer]: A. API and event examples (Recommended)

## Q5. Frontend contract views

How should `apps/reference-data` consume U07 outputs?

A. Read-only contract/developer views for OpenAPI, authorization API, Avro events, examples, and compatibility status, with no downstream runtime screens (recommended)
B. Editable contract management UI
C. No frontend views
X. Other (please specify)

[Answer]: A. Read-only contract views (Recommended)

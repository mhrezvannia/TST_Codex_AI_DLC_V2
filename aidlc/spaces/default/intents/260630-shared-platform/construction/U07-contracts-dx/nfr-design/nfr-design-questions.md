# NFR Design Questions - U07 Contracts DX

## Scope

This file records design questions resolved during NFR Design for `U07-contracts-dx`.

## Resolved Questions

### Q1. What counts as a publishable contract artifact?

Each artifact needs owner, version, lifecycle status, source service, compatibility status, and artifact path. Missing metadata rejects publication until the contract can be reviewed and traced.

### Q2. How are synchronous and event contracts governed?

`reference-data-service` and `identity-service` APIs are published as OpenAPI. Reference-change events are published as nine typed Avro 1.11 event families with a common envelope and Confluent Schema Registry compatibility status.

### Q3. What happens when compatibility cannot be evaluated?

Unknown compatibility status prevents freeze. It is not manually treated as compatible. Incompatible changes record finding summary, affected consumers, and versioning impact.

### Q4. How are examples and fixtures used without creating downstream runtime scope?

Examples validate against OpenAPI or Avro schemas. Provider and message fixtures bind to operations or events and express expectations, but they do not create Charge, Booking, Container Movement, UI screens, or deployed downstream stubs.

### Q5. How are contract views exposed safely?

`apps/reference-data` may display read-only catalog views for authorized internal users. Views show metadata, status, examples, findings, and text labels; they cannot edit production contract source or expose secrets, tokens, stack traces, unsafe PII, or database contracts.

## Open Questions

No blocking questions remain for this stage. Final U08 gate wiring and operational surfacing of compatibility status are deferred to their owning units.

## Source Trace

This decision set traces to `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

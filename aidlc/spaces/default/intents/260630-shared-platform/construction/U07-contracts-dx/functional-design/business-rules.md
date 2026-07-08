# Business Rules - U07 Published Contracts and Developer Experience

## Source Trace

These U07 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Contract Scope Rules

BR-U07-001: U07 must publish OpenAPI contract artifacts for `reference-data-service` and `identity-service`.

BR-U07-002: U07 must publish Avro schema artifacts for all nine `referencedata.<entity>.changed` event contracts.

BR-U07-003: U07 must include request/response examples for synchronous APIs and payload examples for event contracts.

BR-U07-004: U07 must include message-pact/provider fixtures for relevant API and event contracts where implementation or provider expectations exist.

BR-U07-005: Contract artifacts must include owner, version, lifecycle status, source service, and compatibility status metadata.

BR-U07-006: Contracts must use stable platform-owned identifiers and must not expose service database tables as integration contracts.

## Compatibility Rules

BR-U07-007: OpenAPI contract changes must be compared against the previous accepted version before being marked ready.

BR-U07-008: Avro schemas must pass Schema Registry compatibility checks before being marked compatible.

BR-U07-009: Message-pact/provider fixtures must be validated against their associated OpenAPI operation or Avro schema.

BR-U07-010: Compatibility status must be one of pending, compatible, incompatible, failed, or unknown.

BR-U07-011: Unknown compatibility status is not acceptable for contract freeze.

BR-U07-012: Incompatible changes must record finding summary, affected consumers, and versioning impact.

## Event Contract Rules

BR-U07-013: Every reference-change event contract must include common envelope fields: event id, event type, schema version, source, occurred-at, correlation id, entity id, operation, and producer metadata.

BR-U07-014: Event id must be suitable for consumer deduplication.

BR-U07-015: Event type must follow `referencedata.<entity>.changed`.

BR-U07-016: Entity payload schemas must be explicit enough that consumers do not infer business meaning from generic blobs.

BR-U07-017: Event examples must include at least create/update or status-change examples where supported by the reference set.

## API Contract Rules

BR-U07-018: `reference-data-service` provider APIs must cover list/detail reads for all nine reference sets.

BR-U07-019: `reference-data-service` admin APIs must cover create, update, deactivate, reactivate, search/filter, and status/history where exposed.

BR-U07-020: `identity-service` contracts must cover authorization decisions and effective permission/session support needed by Shared Platform apps and services.

BR-U07-021: OpenAPI operations must use standard error envelopes and correlation id propagation.

BR-U07-022: Contract examples must validate against the published schemas.

## Downstream Boundary Rules

BR-U07-023: Charge, Booking, and Container Movement may appear only as future external consumers, reviewers, or example personas.

BR-U07-024: U07 must not create downstream runtime services, UI screens, or implementation stubs.

BR-U07-025: Contract-only future consumer fixtures must not require a running downstream module.

BR-U07-026: Downstream review findings must be recorded as contract findings, not as new runtime scope.

## Frontend View Rules

BR-U07-027: `apps/reference-data` may expose read-only contract views for OpenAPI, authorization API, Avro events, examples, compatibility status, and findings.

BR-U07-028: Contract views must not allow editing production contract source artifacts from the UI.

BR-U07-029: Contract views must use accessible tabs, code blocks, description lists, and status labels.

BR-U07-030: Compatibility status must be represented with text and accessible labels, not color alone.

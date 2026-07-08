# Logical Components - U07 Contracts DX

## Component Overview

U07 provides artifact-controlled contract evidence for Shared Platform APIs and events: OpenAPI contracts, Avro schemas, examples, provider/message fixtures, compatibility findings, freeze records, and optional read-only catalog views in `apps/reference-data`.

## Components

### Contract Artifact Registry

Tracks artifact path, owner, version, lifecycle status, source service, compatibility status, and findings for every OpenAPI contract, Avro event schema, example set, and fixture.

### OpenAPI Validator

Validates `reference-data-service` and `identity-service` OpenAPI artifacts, required metadata, examples, operation coverage, and compatibility diff against previous accepted versions.

### Avro Schema Validator

Validates nine typed reference-change event schemas, common envelope fields, schema version, examples, and Confluent Schema Registry compatibility status.

### Example Validator

Validates request/response examples and event payload examples against their linked OpenAPI or Avro artifact. It rejects examples with secrets, tokens, unsafe PII, production identifiers, or schema mismatch.

### Fixture Validator

Validates Pact/message-pact or equivalent fixtures and binds them to an API operation or event contract. Fixtures express provider/message expectations without creating downstream runtime services.

### Compatibility Diff Engine

Compares OpenAPI and Avro changes against previous accepted versions, records compatible/incompatible/failed/unknown status, affected consumers, and versioning impact.

### Freeze Record Manager

Creates versioned freeze records only when required artifacts have compatible status. It blocks unknown compatibility and preserves findings for future U08 gates.

### Read-Only Catalog Views

Display services, events, versions, lifecycle state, compatibility state, examples, fixtures, and findings with accessible text labels and filters. Views cannot edit production contract source.

### Scope Guard

Detects downstream runtime stubs, database contracts, editable production contract UI, generic-only event replacement, or public external portal behavior and blocks U07 readiness.

## Dependency Direction

Contract artifacts feed validators and compatibility checks. Findings and freeze records feed read-only catalog views and later U08 gates. U07 does not depend on downstream runtime services or direct database contracts.

## Source Trace

This design implements constraints from `business-logic-model.md`, `tech-stack-decisions.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md`.

# Security Design - U07 Contracts DX

## Security Goals

U07 makes contracts reviewable without exposing service databases, secrets, unsafe personal data, raw stack traces, or production contract editing controls. Contracts and examples are safe artifacts, not runtime access or shared persistence ownership.

## Contract Safety

Contracts must not expose database tables as integration contracts. OpenAPI examples must not include secrets, tokens, production identifiers, or unsafe PII. Event examples respect Party/Customer classification and include only necessary reference-change data. Identity-service examples expose safe authorization/session summaries only.

Compatibility findings report safe summaries, affected consumers, versioning impact, artifact path, and validation class without leaking internal stack traces or credentials.

## Access Control

Catalog views are read-only and shown only to authorized internal users where exposed by `apps/reference-data`. Downstream reviewers receive artifacts and findings, not runtime database access, service credentials, or deployed downstream infrastructure.

Production contract source remains artifact-controlled in the repository/toolchain and is not editable from the UI.

## Boundary Protection

Charge, Booking, and Container Movement appear only as future external consumers, reviewers, or example personas. Downstream runtime services, UI screens, implementation stubs, shared database contracts, and public external developer portal behavior are out of scope.

## Source Trace

This design implements constraints from `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

# Security Design - contract-platform-catalog

## Source Context

This artifact consumes `security-requirements.md`, `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, `components.md`, and `services.md`.

The Contract Platform protects integration boundaries by validating executable security expectations in OpenAPI, AsyncAPI, Avro, Pact, message-pact, Schema Registry compatibility evidence, and generated health reports.

## Security Metadata Architecture

Every executable contract asset is normalized into a metadata record before syntax or compatibility results can contribute to readiness:

| Field group | Required content | Failure state |
|---|---|---|
| Ownership | Provider, consumer, seam, owner team or module, linked story or requirement. | `invalid_metadata` and readiness blocked. |
| Auth context | User token, service identity, event producer identity, or explicit public/internal exception. | `security_metadata_missing`. |
| Authorization | Capability, role, Kafka ACL, service permission, or approved not-applicable rationale. | `security_metadata_missing`. |
| Denied path | Expected unauthorized or forbidden response, error envelope, or event rejection behavior. | `denied_path_missing`. |
| Correlation and audit | `correlationId`, audit fields, security event linkage, and trace propagation fields. | `observability_metadata_missing`. |
| Idempotency | Idempotency key and duplicate handling for commands or event consumers where semantics require it. | `idempotency_metadata_missing`. |

Metadata validation runs before compatibility aggregation. A syntactically valid contract with missing security metadata is not executable for readiness.

## Authorization And Compatibility Controls

Security-relevant compatibility checks treat these changes as potentially breaking:

- Removing or weakening an auth context.
- Removing a required capability, ACL, role, service permission, or producer identity.
- Changing denied-path status, error envelope, or event rejection semantics.
- Removing correlation, audit, idempotency, or observability fields required by the seam.
- Reassigning provider or consumer ownership without an approved migration.

Compatibility outcomes are `compatible`, `compatible_with_warning`, `breaking`, or `not_comparable`. Required seams fail closed on `breaking` and on `not_comparable` unless the report links an approved major-version migration or retirement exception.

## Secret And Data Protection

Contract definitions, examples, fixtures, validation reports, and release-candidate evidence are internal engineering records. The validation runner applies secret scanning and fixture redaction before publishing readiness evidence.

| Asset | Control |
|---|---|
| Contract source | Repository access control, pull-request review, secret scanning. |
| Examples and fixtures | Deterministic synthetic data only; no production personal data, payment card data, PHI, or production secrets. |
| Validation reports | Internal CI artifacts with retention policy and immutable source-hash linkage. |
| Release-candidate evidence | 180-day retention with `gitRef`, source hash, validator version, timestamp, and runtime profile. |

Reports redact token-like values and include hashes or stable identifiers where full values are not needed for remediation.

## Defense-In-Depth Flow

```text
[Contract Source]
       |
       v
[Metadata Normalizer] --> [Secret Scanner]
       |                       |
       v                       v
[Syntax Validator]      [Blocked on Leak]
       |
       v
[Security Metadata Gate]
       |
       v
[Compatibility Checker]
       |
       v
[Evidence Publisher]
```

Text fallback: contract source is normalized and scanned before syntax and compatibility results can become readiness evidence. Secret leaks or missing security metadata block the evidence publisher.

## Audit And Evidence Integrity

Each validation run records `runId`, `gitRef`, source hashes, validator versions, runtime profile, start and end time, status, owner, and failure location. The generated evidence publisher signs integrity through deterministic hashes and immutable artifact links rather than manual status editing.

The Enterprise Web or operations health view is read-only. It can filter and display contract health but cannot override failed, partial, blocked, or stale statuses.

## Traceability

| Source | Design response |
|---|---|
| `security-requirements.md` | Implements auth, authorization, denied path, correlation, audit, observability, idempotency, redaction, retention, and threat controls. |
| `performance-requirements.md` | Keeps security validation inside the fast changed-contract and full-suite validation paths. |
| `scalability-requirements.md` | Makes security metadata indexable by owner, seam, protocol, story, and stale/fresh state. |
| `reliability-requirements.md` | Fails closed for missing metadata, secret leaks, compatibility gaps, and report tampering risks. |
| `tech-stack-decisions.md` | Uses repository contracts, local Schema Registry, GitHub Actions, generated reports, and read-only Enterprise Web surfaces. |
| `business-logic-model.md` | Extends metadata normalization, compatibility checks, and health publication workflows with security-specific gates. |

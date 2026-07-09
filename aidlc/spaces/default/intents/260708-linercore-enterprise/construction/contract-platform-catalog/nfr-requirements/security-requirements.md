# Security Requirements - contract-platform-catalog

## Source Context

This artifact consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, `technology-stack.md`, and `nfr-requirements-questions.md`.

The contract platform protects integration boundaries by making security metadata executable and reviewable. It supports NFR-SEC-001 through NFR-SEC-004, NFR-COMP-001, FR-SP-007, and the boundary rules in `business-rules.md`.

## Contract Security Metadata

Every protected HTTP or event contract must declare:

| Metadata | Requirement |
|---|---|
| Auth context | User token, service identity, or event producer identity required for the seam. |
| Authorization | Required capability, role, Kafka ACL, or service permission. |
| Denied-path behavior | Expected error/status/event handling for unauthorized or forbidden access. |
| Correlation | `correlationId` or equivalent trace field propagated across the seam. |
| Audit | Audit fields or audit event linkage for security-relevant actions. |
| Observability | Log/metric/trace fields needed to prove access decisions and failures. |
| Idempotency | Idempotency key and duplicate handling where command or event semantics require it. |

## Data Classification

| Asset | Classification | Controls |
|---|---|---|
| Contract definitions | Internal/confidential engineering artifact | Repository access control, review, secret scanning |
| Contract examples and fixtures | Internal/confidential unless explicitly marked safe | Redaction of secrets and production personal data |
| Validation reports | Internal engineering evidence | CI artifact retention and access control |
| Release-candidate evidence bundles | Audit-supporting internal evidence | 180-day retention and immutable artifact linkage |

Contract assets and examples must not contain payment card data, PHI, production secrets, or unredacted production personal data. If a realistic identifier is needed, use deterministic synthetic fixtures.

## Threat Requirements

| Threat | Required control |
|---|---|
| Contract omits auth/authorization expectations | Metadata validation fails for protected seams. |
| Fixture leaks secrets or production data | Secret scanning and example redaction block readiness. |
| Breaking auth behavior hidden as compatible change | Compatibility check treats auth and denied-path changes as potentially breaking. |
| Consumer bypasses service ownership | Contract metadata must name owning provider and consumer; ownership violations are blocking findings. |
| Event producer identity ambiguous | Event contracts must name producer identity and required ACL. |
| Validation report tampering | CI evidence includes `gitRef`, source hash, validator version, and timestamp. |

## Compliance Requirements

- Treat contract artifacts as internal/confidential engineering records.
- Retain release-candidate evidence bundles for at least 180 days.
- Keep normal branch and pull-request artifacts according to CI retention policy.
- Run secret scanning on contract examples, fixtures, and generated evidence where tooling supports it.
- Do not claim PCI, HIPAA, or production-regulated adapter coverage unless later requirements introduce that scope.

## Security Validation

| Check | Evidence |
|---|---|
| Auth metadata present | Contract metadata validation report |
| Denied-path behavior present | OpenAPI/Pact/message-pact checks |
| ACL or service identity present for Kafka seams | AsyncAPI/Avro/message-pact metadata report |
| Secret scanning clean | CI security scan result |
| Synthetic fixture policy followed | Fixture validation and review result |
| Compatibility includes auth/idempotency changes | Compatibility report |

## Traceability

| Source | Security coverage |
|---|---|
| `business-logic-model.md` | Requires metadata normalization, compatibility checks, and health evidence. |
| `business-rules.md` | Defines auth, idempotency, observability, compatibility, and exception rules. |
| `requirements.md` | Supplies NFR-SEC, NFR-COMP, FR-SP-007, and out-of-scope regulatory constraints. |
| `technology-stack.md` | Supplies local Schema Registry, GitHub Actions, and repository contract assets. |
| `nfr-requirements-questions.md` | Q4, Q5, and Q10 define security metadata, retention, and compliance posture. |

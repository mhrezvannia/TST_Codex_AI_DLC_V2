# Reliability Requirements - U07 Contracts DX

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines failure handling for missing artifacts, invalid OpenAPI, invalid Avro, unavailable compatibility checks, invalid examples, and downstream stub detection. `business-rules.md` requires compatibility status values and blocks unknown status for freeze. `requirements.md` fixes CI gates and contract/schema compatibility expectations.

## Reliability Requirements

| Area | Requirement |
|---|---|
| Missing artifact | Catalog validation fails and names missing service/event. |
| Invalid OpenAPI | Publication fails with parser/validation details. |
| Invalid Avro | Publication fails and artifact is not marked compatible. |
| Compatibility unavailable | Status becomes unknown and freeze is prevented. |
| Invalid example | Example set fails with artifact path. |
| Downstream stub detected | Scope violation blocks U07 readiness. |

## Freeze Requirements

- Freeze requires compatible status for relevant OpenAPI and Avro artifacts.
- Incompatible changes record finding summary, affected consumers, and versioning impact.
- Freeze is versioned and later changes require compatibility assessment and documented impact.

## Health and Evidence Requirements

- Contract status evidence must be reproducible by U08 CI gates.
- Read-only catalog views must display pending, compatible, incompatible, failed, and unknown states with text labels.
- Findings must remain associated with contract version and artifact path.

## Non-Goals

- No guarantee downstream teams have implemented against contracts.
- No runtime service availability requirement.
- No manual override of unknown compatibility status for freeze.


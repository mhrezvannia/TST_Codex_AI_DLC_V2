# Performance Requirements - U07 Contracts DX

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines contract publication, OpenAPI, Avro, message-pact/provider fixtures, contract freeze, and error handling workflows. `business-rules.md` fixes examples, owner/version/status metadata, compatibility status, validation, and accessible read-only views. `requirements.md` fixes FR-020, FR-021 through FR-023, FR-047 through FR-049, NFR-004, and C-003.

## Target Requirements

| Requirement | U07 obligation |
|---|---|
| Contract validation | OpenAPI, Avro, example, and fixture validation must be bounded for CI/review use. |
| Compatibility diff | OpenAPI and Avro compatibility checks must compare against previous accepted versions. |
| Catalog rendering | Read-only catalog views must render contract metadata/status without requiring downstream services. |
| Freeze workflow | Unknown compatibility status blocks freeze rather than causing slow manual investigation later. |

## Measurement Requirements

- Measure contract generation/validation duration, OpenAPI diff duration, Avro compatibility duration, example validation duration, and fixture validation duration.
- Track number of compatible, incompatible, failed, unknown, and pending artifacts.
- Record validation findings with artifact path and version.

## Non-Goals

- U07 does not own runtime API latency.
- U07 does not run downstream modules.
- U07 does not replace U08 CI enforcement.


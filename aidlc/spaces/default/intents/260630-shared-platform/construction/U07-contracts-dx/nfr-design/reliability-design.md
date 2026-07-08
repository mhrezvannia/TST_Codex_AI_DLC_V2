# Reliability Design - U07 Contracts DX

## Reliability Goals

U07 makes contract evidence reproducible and freeze decisions defensible. Missing artifacts, invalid contracts, invalid examples, unavailable compatibility checks, and downstream stub scope violations fail explicitly and preserve findings by artifact path and version.

## Failure Handling

Missing contract artifacts fail catalog validation and name the missing service or event. Invalid OpenAPI fails publication with parser/validation details. Invalid Avro fails publication and cannot be marked compatible. Invalid examples fail their example set with the artifact path.

Compatibility check unavailable produces UNKNOWN status and prevents freeze. Downstream stub detection is a scope violation that blocks U07 readiness.

## Freeze Reliability

Freeze requires compatible status for relevant OpenAPI and Avro artifacts. Incompatible changes record finding summary, affected consumers, and versioning impact. Frozen versions become U08 CI baselines; later changes require compatibility assessment and documented impact.

## Evidence and Views

Contract status evidence must be reproducible by later U08 CI gates. Read-only catalog views display pending, compatible, incompatible, failed, and unknown states with text labels, not color alone. Findings remain associated with contract version and artifact path.

## Non-Goals

U07 does not guarantee downstream implementation, runtime service availability, or manual override of unknown compatibility status for freeze.

## Source Trace

This design implements constraints from `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

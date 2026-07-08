# Reliability Requirements - U08 Quality Gates

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines gate aggregation, failure evidence, walking skeleton gate behavior, and merge blocking. `business-rules.md` requires skipped required gates to fail unless deterministic, required gate failures to block merge, and evidence fields. `requirements.md` fixes NFR-004 and NFR-005.

## Reliability Requirements

| Area | Requirement |
|---|---|
| Required failures | Any failed required gate blocks merge. |
| Skipped required gates | Fail unless skipped by deterministic unaffected-path decision. |
| Gate evidence | Every gate result records gate id, scope, command/step, status, required flag, and evidence path. |
| Aggregation | PR result fails if any required gate fails. |
| Walking skeleton | Bolt 1 proves compile/type checks and one smoke path. |
| Audit readiness | Evidence is suitable for AI-DLC approval and later audit. |

## Failure Behavior

- Backend gate failures block affected service merge.
- Frontend gate failures block affected app/package merge.
- OpenAPI, Pact/message-pact, Avro, compatibility, and example failures block affected contract/schema merge.
- Seed validation failures block seed/environment changes.
- Smoke failures block walking-skeleton readiness where smoke is required.

## Recovery Requirements

- Gate reruns must preserve previous evidence and produce new run evidence.
- Flaky tests must be visible as gate instability, not silently ignored.
- Unknown compatibility or missing evidence is treated as not ready.

## Non-Goals

- No production promotion approval.
- No manual override semantics in this design.
- No replacement for later build-and-test implementation details.


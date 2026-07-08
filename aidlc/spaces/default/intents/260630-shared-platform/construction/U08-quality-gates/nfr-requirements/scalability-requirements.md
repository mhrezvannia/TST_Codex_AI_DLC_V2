# Scalability Requirements - U08 Quality Gates

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines changed-path classification and gate group selection. `business-rules.md` requires affected backend/frontend/contract/schema/smoke gates, deterministic skip reasons, and gate aggregation. `requirements.md` fixes CI gates across backend, frontend, contracts, schemas, and coverage.

## Scaling Model

U08 scales CI by classifying changed paths and running only the required gate groups for affected services, apps, packages, contracts, schemas, seeds, and smoke paths.

## Structural Requirements

| Area | Requirement |
|---|---|
| Backend | Independent gates for `identity-service` and `reference-data-service`. |
| Frontend | Gates for `apps/auth`, `apps/reference-data`, and approved `@erp/*` packages. |
| Contracts | OpenAPI and message-contract gates for affected artifacts. |
| Schemas | Avro/Schema Registry compatibility gates for affected event schemas. |
| Seeds/smoke | Deterministic seed and smoke hooks for affected environment paths. |
| Aggregation | Any failed required gate fails the PR. |

## Growth Assumptions

- More apps/packages/contracts may be added later; gate ids and scopes must remain stable.
- Runner capacity may need to grow, but public-cloud runners remain disallowed for required gates.
- Advisory checks may exist, but required checks remain explicit.

## Non-Goals

- No monolithic always-run-only pipeline requirement.
- No manual skip process for required gates.
- No downstream module runtime gates beyond contract-only checks.


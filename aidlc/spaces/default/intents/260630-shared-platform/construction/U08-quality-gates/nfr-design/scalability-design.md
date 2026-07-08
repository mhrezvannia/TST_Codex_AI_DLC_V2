# Scalability Design - U08 Quality Gates

## Scalability Goals

U08 scales CI by stable gate ids, deterministic changed-path classification, scoped execution, explicit aggregation, and evidence that can support more apps, services, packages, contracts, and schemas later.

## Gate Scope Model

Backend gates are independent for `identity-service` and `reference-data-service`. Frontend gates cover `apps/auth`, `apps/reference-data`, and approved `@erp/*` packages. Contract gates cover OpenAPI and message-contract artifacts. Schema gates cover Avro and Schema Registry compatibility. Seed and smoke gates cover deterministic environment paths.

Any failed required gate fails the PR aggregate result.

## Extensibility

Gate ids and scopes remain stable as more apps, packages, contracts, and schemas are added. Advisory checks may exist, but required checks stay explicit and cannot be skipped manually. Runner capacity can grow within the self-hosted/on-prem constraint.

## Non-Monolithic Execution

The design avoids a monolithic always-run-only pipeline requirement. Required checks are scoped by affected paths, but skip behavior is deterministic and auditable.

## Source Trace

This design implements constraints from `scalability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

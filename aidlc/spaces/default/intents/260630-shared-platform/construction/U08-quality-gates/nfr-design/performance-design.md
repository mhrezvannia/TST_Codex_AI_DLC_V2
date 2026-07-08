# Performance Design - U08 Quality Gates

## Performance Goals

U08 provides PR feedback that is bounded and explainable without weakening required checks. Gate groups are path-scoped so unaffected backend services, frontend apps/packages, contracts, schemas, seeds, and smoke paths are skipped only by deterministic classification.

## Gate Selection

The pull-request workflow classifies changed paths and maps them to stable gate ids and scopes. Backend service changes select the affected service gates. Frontend app/package changes select affected Yarn/Turborepo gates. OpenAPI, Pact/message-pact, Avro, Schema Registry, seed, Compose, and smoke paths select their respective checks.

Skip decisions record the changed-path rule and scope. A required gate skipped without deterministic unaffected-path evidence is a failure.

## Gate Execution

Backend gates run formatting/lint/static checks, compile, unit tests, adapter integration tests, and per-service 85 percent line coverage. Frontend gates run TypeScript strict checks, lint, tests, and accessibility-relevant checks where configured. Contract/schema gates run validation, diff/compatibility, fixture validation, and example validation.

Walking skeleton gates remain thin: one backend compile/type equivalent, one frontend type check, one smoke path, and attached evidence.

## Measurement

Gate telemetry records duration by gate id, scope, command, runner, and status. Queue time and execution time on self-hosted runners are separated. Flaky/retry indicators are tracked independently from actual test failures. Evidence paths avoid manual log hunting.

## Source Trace

This design implements constraints from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

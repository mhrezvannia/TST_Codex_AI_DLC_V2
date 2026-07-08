# Reliability Design - U08 Quality Gates

## Reliability Goals

U08 ensures PR readiness decisions are reproducible, merge-blocking, and auditable. Required failures block merge, skipped required gates fail unless deterministically unaffected, and missing or unknown evidence is treated as not ready.

## Aggregation Rules

Each gate result records gate id, scope, command or workflow step, status, required flag, summary, evidence path, runner, duration, and skip reason where applicable. The PR aggregate fails if any required gate fails, lacks evidence, reports unknown compatibility, or is skipped without deterministic unaffected-path evidence.

## Failure Behavior

Backend gate failures block affected service merge. Frontend gate failures block affected app/package merge. OpenAPI, Pact/message-pact, Avro, compatibility, and example failures block affected contract/schema merge. Seed validation failures block seed/environment changes. Smoke failures block walking-skeleton readiness where smoke is required.

## Reruns and Flakes

Gate reruns preserve previous evidence and produce new run evidence. Flaky tests are visible as instability through retry markers and are not silently ignored. Manual override semantics are outside this design.

## Audit Readiness

Evidence is suitable for AI-DLC approval and later audit. Walking skeleton evidence proves compile/type checks and one smoke path before the full gate set expands.

## Source Trace

This design implements constraints from `reliability-requirements.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

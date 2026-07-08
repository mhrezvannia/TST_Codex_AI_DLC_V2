# Infrastructure Services - U08 Quality Gates

## Runner Pool

Self-hosted on-prem GitHub Actions runners execute required gates. Runner metadata is captured in evidence for queue/execution diagnosis.

## Gate Runners

Backend runners use Java 21/Maven. Frontend runners use Yarn/Turborepo. Contract runners validate OpenAPI and Pact/message-pact fixtures. Schema runners validate Avro and Schema Registry compatibility. Seed/smoke runners validate local reproducibility paths.

## Evidence Store

CI artifacts contain gate id, scope, command/step, status, required flag, summary, evidence path, runner, duration, skip reason, and retry markers.

## Aggregator

The aggregator fails the PR if any required gate fails, lacks evidence, reports unknown compatibility, or is skipped without deterministic unaffected-path evidence.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

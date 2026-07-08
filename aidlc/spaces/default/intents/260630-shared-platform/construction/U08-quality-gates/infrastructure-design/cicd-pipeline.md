# CI/CD Pipeline - U08 Quality Gates

## Pipeline Stages

| Stage | Checks |
|---|---|
| Classify | Determine affected services/apps/packages/contracts/schemas/seeds/smoke. |
| Backend | Java/Maven compile, tests, integration, coverage, purity. |
| Frontend | Yarn/Turborepo type, lint, tests, accessibility, package policy. |
| Contracts | OpenAPI, examples, Pact/message-pact, diffs. |
| Schemas | Avro and Schema Registry compatibility. |
| Seeds/smoke | Deterministic seed validation and smoke where affected. |
| Evidence | Store redacted gate evidence. |
| Aggregate | Fail PR for any required failure/missing/unknown/improper skip. |

## Deployment Stages

U08 does not deploy product runtime. It enforces merge readiness and produces evidence consumed by later readiness workflows.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

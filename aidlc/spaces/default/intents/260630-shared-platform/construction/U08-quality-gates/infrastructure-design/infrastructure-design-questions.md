# Infrastructure Design Questions - U08 Quality Gates

## Scope

This file records infrastructure questions resolved during Infrastructure Design for `U08-quality-gates`.

## Resolved Questions

### Q1. Deployment strategy

[Answer]: Implement gates as self-hosted GitHub Actions workflows/jobs/scripts on on-prem runners. U08 does not deploy application runtime or production approval automation.

### Q2. Compute/storage/networking

[Answer]: Use self-hosted runner capacity, workspace caches where allowed, CI artifacts for evidence, and no public-cloud required runners.

### Q3. Monitoring approach

[Answer]: Track gate duration, queue time, execution time, runner, scope, status, skip reason, flaky/retry indicators, and evidence paths.

### Q4. CI/CD pipeline

[Answer]: Provide changed-path classifier, backend/frontend/contract/schema/seed/smoke gate runners, evidence collector, and PR aggregator.

### Q5. Secrets management

[Answer]: Gate logs/evidence redact secrets, tokens, Vault values, production credentials, and sensitive seed data. Required/advisory status is explicit.

### Q6. Scaling policy

[Answer]: Scale by stable gate ids, scoped path classification, and additional self-hosted runners; do not use manual skips for required gates.

## Ambiguity Analysis

No blocking ambiguity remains. Concrete workflow filenames and runner labels are deferred to implementation.

## Source Trace

This decision set traces to `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

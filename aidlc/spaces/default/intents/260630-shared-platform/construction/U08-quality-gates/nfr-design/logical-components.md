# Logical Components - U08 Quality Gates

## Component Overview

U08 defines self-hosted GitHub Actions quality gates for backend services, frontend apps/packages, contracts, schemas, seeds, smoke paths, evidence capture, and PR aggregation. It enforces merge-blocking controls without implementing feature behavior or production deployment approval.

## Components

### Changed Path Classifier

Maps changed files to stable gate groups and scopes for backend services, frontend apps/packages, OpenAPI contracts, Pact/message-pact fixtures, Avro schemas, seed/Compose paths, and smoke checks. It records deterministic skip reasons for unaffected scopes.

### Backend Gate Runner

Configures Java 21 and Maven, then runs formatting/lint/static checks, compile, unit tests, adapter integration tests, domain-core purity checks, and per-service 85 percent line coverage for `identity-service` and `reference-data-service`.

### Frontend Gate Runner

Configures Yarn/Turborepo and runs TypeScript strict checks, lint, tests, accessibility-relevant checks where configured, package-manager enforcement, lockfile checks, and prohibited-library checks for `apps/auth`, `apps/reference-data`, and approved `@erp/*` packages.

### Contract Gate Runner

Validates OpenAPI artifacts, examples, compatibility diffs, Pact/message-pact fixtures, and provider/consumer contract evidence from U07.

### Schema Gate Runner

Validates Avro 1.11 schemas, event examples, and Confluent Schema Registry compatibility against accepted baselines.

### Seed and Smoke Gate Runner

Validates deterministic seed packs and local environment smoke hooks where affected. It blocks seed changes that introduce sensitive or non-repeatable data and verifies walking-skeleton smoke when required.

### Evidence Collector

Captures gate id, scope, command/step, status, required flag, summary, log/evidence path, runner, duration, queue time, execution time, skip reason, and flaky/retry indicators while redacting secrets and credentials.

### Gate Aggregator

Combines gate results and fails the PR when any required gate fails, is missing evidence, reports unknown compatibility, or is improperly skipped. Advisory gate outcomes are reported separately.

## Dependency Direction

The classifier selects gate runners. Gate runners emit evidence. The aggregator consumes evidence and produces the PR readiness result. U08 consumes U07 contract evidence and does not redefine contract semantics.

## Source Trace

This design implements constraints from `business-logic-model.md`, `tech-stack-decisions.md`, `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md`.

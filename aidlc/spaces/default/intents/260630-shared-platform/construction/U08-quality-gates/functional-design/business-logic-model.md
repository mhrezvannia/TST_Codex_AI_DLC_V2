# Business Logic Model - U08 Quality Gates

## Source Trace

This U08 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

It covers US-022 and US-023, supports U07 contract evidence, and follows `team-practices.md`: tests are written alongside code, must run in CI before merge, both backend services target 85 percent line coverage, and contract, integration, and compatibility tests are first-class deliverables.

## Unit Purpose

U08 defines the quality-gate behavior that prevents Shared Platform regressions. It specifies required CI checks for backend services, frontend apps/packages, OpenAPI contracts, Pact/message-pact fixtures, Avro/Schema Registry compatibility, coverage thresholds, smoke hooks, and merge-blocking evidence on self-hosted on-prem GitHub Actions runners.

## Pull Request Gate Workflow

```text
Pull request opens or updates
  -> classify changed paths
  -> select required gate groups
  -> run backend gates for affected services
  -> run frontend gates for affected apps/packages
  -> run contract/schema gates for API/event changes
  -> run smoke or fixture checks where affected
  -> aggregate gate results
  -> block merge if any required gate fails
```

Decision points:

| Decision | Rule |
|---|---|
| Backend service changed? | Run formatting, lint/static checks, compile, unit tests, adapter integration tests, and coverage for that service. |
| Frontend app/package changed? | Run TypeScript, lint, tests, and accessibility-relevant checks where configured. |
| OpenAPI changed? | Run OpenAPI validation, diff/compatibility, and provider/consumer contract checks. |
| Avro/schema/event changed? | Run Avro validation and Schema Registry compatibility checks. |
| Seed/Compose changed? | Run deterministic seed validation and local smoke hooks where practical. |
| Required gate failed? | Mark PR red and emit evidence path. |

## Backend Gate Workflow

```text
Backend path changes
  -> setup Java 21 and Maven
  -> run formatter/linter/static checks
  -> compile service modules
  -> run unit tests
  -> run adapter integration tests
  -> measure line coverage
  -> compare against 85 percent target
```

The backend gate applies independently to `identity-service` and `reference-data-service`. Domain-core purity checks should fail if domain modules import framework, persistence, Kafka, or adapter namespaces.

## Frontend Gate Workflow

```text
Frontend path changes
  -> setup Yarn/Turborepo workspace
  -> install from locked dependencies
  -> run TypeScript strict checks
  -> run lint
  -> run unit/component tests
  -> run accessibility-relevant checks where configured
```

The frontend gate covers `apps/auth`, `apps/reference-data`, and approved `@erp/*` packages. npm, pnpm, prohibited frontend libraries, or unexpected lockfiles must fail the gate.

## Contract and Schema Gate Workflow

```text
Contract path changes
  -> validate OpenAPI syntax and examples
  -> run OpenAPI diff against accepted baseline
  -> validate Pact/message-pact fixtures
  -> validate Avro schemas and examples
  -> run Schema Registry compatibility
  -> publish compatibility evidence
```

U08 consumes U07 contract artifacts and turns their checks into merge-blocking gates. U08 does not redefine contract semantics; it enforces them.

## Walking Skeleton Gate Workflow

Bolt 1 requires one thin CI path that proves compile/type checks and a smoke test can run. The full U08 quality-gate unit expands that into the complete gate set after the walking skeleton proves the basic path.

```text
Walking skeleton PR
  -> backend compile/type or equivalent check
  -> frontend type check
  -> one smoke path
  -> evidence attached to gate
```

## Failure Evidence Workflow

Each gate failure produces:

| Evidence | Purpose |
|---|---|
| Gate id | Stable identifier for the failed gate. |
| Scope | Service, app, package, contract, schema, or smoke target. |
| Command | Command or workflow step that failed. |
| Summary | Human-readable failure reason. |
| Log path | CI artifact or local output path. |
| Required flag | Whether the failure blocks merge. |

## Non-Goals

- No public-cloud CI runners.
- No production deployment approval logic; production promotion remains outside this unit.
- No weakening backend coverage below 85 percent.
- No direct implementation of backend/frontend feature behavior.
- No downstream module runtime gates except contract-only checks.

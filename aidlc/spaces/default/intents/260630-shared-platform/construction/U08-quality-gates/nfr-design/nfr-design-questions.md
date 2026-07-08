# NFR Design Questions - U08 Quality Gates

## Scope

This file records design questions resolved during NFR Design for `U08-quality-gates`.

## Resolved Questions

### Q1. How should CI stay fast without weakening gates?

Changed paths are classified deterministically and mapped to stable gate groups. Unaffected required gates may be skipped only with recorded skip reasons. Required gates that are skipped without a deterministic unaffected-path reason fail the PR.

### Q2. What blocks merge?

Any failed required gate blocks merge. Backend, frontend, OpenAPI, Pact/message-pact, Avro, Schema Registry compatibility, seed validation, and required smoke failures are all merge-blocking when their scopes are affected.

### Q3. What evidence is required?

Each gate result records gate id, scope, command or workflow step, status, required flag, summary, evidence path, runner, duration, and skip reason where applicable. Unknown compatibility or missing evidence is treated as not ready.

### Q4. How are toolchain constraints enforced?

Required gates run on self-hosted GitHub Actions runners. Backend gates use Java 21 and Maven. Frontend gates use Yarn and Turborepo. npm, pnpm, unexpected lockfiles, prohibited libraries, and unmanaged package-manager changes fail relevant gates.

### Q5. How does U08 consume U07?

U08 does not redefine contracts. It consumes U07 OpenAPI, Avro, examples, fixtures, and compatibility baselines and turns them into reproducible merge-blocking checks.

## Open Questions

No blocking questions remain for this stage. Concrete workflow file names and exact runner labels are left to build-and-test implementation.

## Source Trace

This decision set traces to `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

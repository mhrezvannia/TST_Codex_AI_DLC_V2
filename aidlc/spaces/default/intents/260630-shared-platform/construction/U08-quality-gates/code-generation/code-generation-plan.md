# Code Generation Plan - U08 Quality Gates

## Source Trace

This plan implements U08 from `business-logic-model.md`, `business-rules.md`, `security-design.md`, and `cicd-pipeline.md`.

U08 turns U07 contract evidence and the existing app/service checks into merge-blocking quality gates for self-hosted/on-prem GitHub Actions runners. It must not implement product runtime behavior or weaken backend coverage targets.

## Implementation Steps

- [x] Step 1: Add a deterministic quality-gate runner.
  - Traceability: BR-U08-026 through BR-U08-030.
  - Add a Node runner that classifies changed paths, decides affected gate groups, runs available local commands, records required/advisory status, and writes JSON evidence.

- [x] Step 2: Add gate policy checks.
  - Traceability: BR-U08-001 through BR-U08-004, BR-U08-010, BR-U08-017 through BR-U08-024.
  - Fail public-cloud runner usage, unexpected lockfiles, npm/pnpm policy drift, domain-core impurity, missing contracts, invalid catalog/examples, and non-repeatable seed issues.

- [x] Step 3: Add GitHub Actions workflow.
  - Traceability: BR-U08-001 through BR-U08-016, BR-U08-022.
  - Add `.github/workflows/quality-gates.yml` using self-hosted/on-prem runner labels, Java 21/Maven setup, Corepack/Yarn, backend/frontend/contract/seed gates, and evidence upload.

- [x] Step 4: Add tests for gate classification and policy.
  - Traceability: Standard test strategy.
  - Add Node tests for path classification, aggregation failure behavior, policy lockfile checks, and evidence shape.

- [x] Step 5: Add documentation/evidence metadata.
  - Traceability: BR-U08-026 through BR-U08-030.
  - Document gate ids, scopes, required/advisory status, commands, evidence path, and local limitations.

- [x] Step 6: Run verification.
  - Traceability: U08 quality and security rules.
  - Run gate runner in local mode, gate tests, contract/seed validators, app tests/typecheck/build, skeleton validation, workflow static checks, and record unavailable Java/Maven or runner-specific checks.

## Test Strategy

The active strategy is Standard. U08 must include executable Node tests for gate logic and locally runnable checks for contracts/seeds/frontend. Java/Maven backend gates are wired into CI but may not execute in this shell because Java and Maven are unavailable locally.

## Approval

This plan is ready for review before U08 implementation.

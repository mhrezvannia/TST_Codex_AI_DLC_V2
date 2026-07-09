# CI Pipeline Questions - Charge Agreement Walking Skeleton

## Source Alignment

This file consumes `code-summary.md`, `build-and-test-summary.md`, and `build-test-results.md` for B01/U01.

## Questions and Answers

### Q1. What CI tool is in use?

A. GitHub Actions using the existing `.github/workflows/quality-gates.yml`
B. AWS CodePipeline and CodeBuild
C. Jenkins
D. Manual local-only checks
X. Other (please specify)

[Answer]: A

### Q2. What branch strategy should the CI pipeline assume?

A. Pull requests into `main` plus manual `workflow_dispatch`
B. Direct pushes to `main`
C. Release branches only
D. Tags only
X. Other (please specify)

[Answer]: A

### Q3. What quality gates are required before merge for Charge Agreement changes?

A. Workspace policy gates only
B. Frontend Charge Agreement test and typecheck gates only
C. Backend Maven tests only
D. Workspace policy, Charge Agreement frontend test/typecheck, and backend Maven test when affected
X. Other (please specify)

[Answer]: D

### Q4. What artifact repositories are used at this stage?

A. None; CI publishes evidence artifacts only
B. Container registry
C. Maven package repository
D. S3 release bucket
X. Other (please specify)

[Answer]: A

## Decisions

The existing GitHub Actions quality gate workflow remains the CI entry point. The stage updates the quality gate aggregator so changes under `apps/charge-agreements/` select `frontend-charge-agreements-test` and `frontend-charge-agreements-typecheck`, while service changes continue to select Maven service checks.


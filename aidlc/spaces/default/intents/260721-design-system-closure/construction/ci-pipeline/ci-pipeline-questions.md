# CI Pipeline Questions — W2-02 Design-System Closure

## Resolved pipeline choices

These answers are derived from the checked-in workflow, team/project rules, `booking-design-system-closure/code-generation/code-summary.md`, `build-and-test/build-and-test-summary.md`, and `build-and-test/build-test-results.md`. No unsupported platform or environment is introduced.

### Q1. Which CI tool is in use?

GitHub Actions is already authoritative through `.github/workflows/quality-gates.yml`. It runs on the labelled self-hosted on-prem Linux runner pool. No CodePipeline, CodeBuild, Jenkins, or public-cloud runner is added.

### Q2. What branch strategy applies?

The workflow gates pull requests and pushes targeting `main` and `integ/main-reconciled`. W2-02 remains a short-lived intent branch from the explicitly protected integration baseline. Final integration mode remains a program-owner decision; this stage does not infer merge authorization or alter branch protection.

### Q3. Which quality gates block merge?

Checked-in deterministic gates include immutable dependency installation, backend tests, package tests/typecheck/lint/build, W2-02 anti-drift, the 57-case helper suite, auth-state tests, Playwright TypeScript compilation, Compose static validation, existing evidence generators, and both mechanical audits. Any command exit failure blocks the job.

The canonical 98-case live Compose/Playwright acceptance, manager guards, sanitized trace, and terminal-last manifest remain a mandatory reviewed release-evidence gate outside CI. The completed formal proof is recorded in `build-and-test/build-test-results.md`. CI is not authorized to operate the protected manager or local Wave A lifecycle.

### Q4. Which artifact repositories are used?

This closure publishes only GitHub Actions evidence through `actions/upload-artifact`, retained for 14 days. No ECR, CodeArtifact, S3, package publication, container push, deployment environment, or production artifact repository is evidenced or added.

## Open decisions deferred by scope

Production promotion, external registries, environment secrets, release tags, rollback automation, and staging/production approvals belong to the later Operation stages. Their absence is explicit and is not represented as CI PASS evidence.

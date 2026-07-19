# CI Pipeline Questions - W2-01

## Questions And Answers

### Q1. What CI tool is in use?

A. GitHub Actions on self-hosted on-prem Linux runners
B. AWS CodePipeline and CodeBuild
C. Jenkins
D. Azure Pipelines
E. No CI tool selected yet
X. Other

[Answer]: A

Rationale: The repository already contains `.github/workflows/quality-gates.yml`, and previous Construction CI stages identify GitHub Actions on self-hosted on-prem Linux runners as the team standard.

### Q2. What branch strategy should the workflow protect?

A. Short-lived intent branches targeting `integ/main-reconciled`, while retaining `main` triggers
B. Direct trunk pushes to `main` only
C. GitFlow with `develop` and release branches
D. Long-lived environment branches
E. Release branches only
X. Other

[Answer]: A

Rationale: W2-01 started from `integ/main-reconciled` at `5dd6481` on branch `intent/W2-01-app-shell-and-auth`; the workflow already protects pull requests and pushes to `main` and `integ/main-reconciled`.

### Q3. What quality gates are required before merge?

A. Existing W1 gates only
B. W2-01 frontend/shared package gates, backend tests, Compose config, U06 evidence package validation, final live acceptance `--require-pass`, quality-gate aggregator, readiness evidence, and both audit detectors
C. Typecheck only, with live checks after merge
D. Manual review only
E. Full deployment promotion
X. Other

[Answer]: B

Rationale: Build and Test proved the automated code gates locally. W2-01 Definition of Done is live Compose/Nginx/Keycloak proof plus `erp-fidelity-audit` and `aidlc-audit`; CI must fail while the evidence package final decision is `BLOCKED`.

### Q4. What artifact repositories are used by this CI stage?

A. Publish Docker images to ECR
B. Publish Maven/npm packages to a package repository
C. Upload CI evidence only
D. Publish a production release
E. No artifacts
X. Other

[Answer]: C

Rationale: This stage validates and uploads evidence. Image/package publication and promotion belong to Operation deployment stages after live proof is green.

## Open Follow-Ups

- Provide a self-hosted Linux runner with Docker network/proxy access or pre-seeded Elastic images so `docker compose --profile full up -d --build` can run.
- Ensure `bash` is available on the runner so `.claude/skills/erp-fidelity-audit/detectors.sh` and `.claude/skills/aidlc-audit/detectors.sh` execute as blocking checks.
- Replace the current blocked U06 evidence package with live scenario evidence before W2-01 can be marked PASS.

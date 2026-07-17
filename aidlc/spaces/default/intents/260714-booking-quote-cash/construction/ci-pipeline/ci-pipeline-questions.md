# CI Pipeline Questions - W1-01

## Questions And Answers

### Q1. What CI tool is in use?

A. GitHub Actions on self-hosted on-prem Linux runners
B. AWS CodePipeline and CodeBuild
C. Jenkins
D. Azure Pipelines
E. No CI tool selected yet
X. Other (please specify)

[Answer]: A

Rationale: The existing repository already contains `.github/workflows/quality-gates.yml`, and team deployment practice says CI uses GitHub Actions on self-hosted on-premises runners.

### Q2. What branch strategy should the CI workflow protect?

A. Short-lived W1 intent branches targeting `integ/main-reconciled` with squash merge
B. Direct trunk pushes to `main` only
C. GitFlow with `develop` and release branches
D. Long-lived environment branches
E. Release branches only
X. Other (please specify)

[Answer]: A

Rationale: `team.md` states W1-01 Construction Bolts base from and merge to `integ/main-reconciled` using squash commits. The workflow also keeps `main` triggers for the repository trunk.

### Q3. What quality gates are required before merge?

A. Generic shared-platform gate aggregator only
B. W1 backend, script, Booking frontend, Compose static validation, W1 live-acceptance dry run, quality-gate aggregator, local readiness, and both audit detectors
C. Full live Docker acceptance on every pull request
D. Lint only, with live checks after merge
E. Manual review only
X. Other (please specify)

[Answer]: B

Rationale: Build-and-test evidence proves these gates locally. Full live Docker acceptance remains a release gate, but it is too environment-sensitive to require on every PR runner unless the runner has the full image cache and Docker proxy path.

### Q4. What artifact repositories are used by this CI stage?

A. ECR for service images and S3 for evidence
B. CodeArtifact for Maven/npm dependencies
C. Docker Hub only
D. No publish repository in CI yet; upload evidence artifacts only
E. A private artifact repository not represented in the repo
X. Other (please specify)

[Answer]: D

Rationale: W1-01 Construction CI is a validation pipeline. Image/package publication and promotion are Operation-stage concerns after live acceptance can run cleanly.

## Open Follow-Ups

- Add SAST, dependency vulnerability scanning, secret scanning, and image scanning in the next CI hardening pass.
- Decide whether a dedicated runner with cached Confluent/PostgreSQL/Elastic images should run `node scripts/w1-live-acceptance.mjs --run-id <new-id>` as a scheduled or manually dispatched release proof.

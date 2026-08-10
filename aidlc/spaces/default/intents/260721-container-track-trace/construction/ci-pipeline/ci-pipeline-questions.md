# CI Pipeline Questions

## Upstream context

The answers below were validated against all U01/U02/U03 `code-summary.md`
artifacts, `construction/build-and-test/build-and-test-summary.md`, and
`construction/build-and-test/build-test-results.md`.

## Q1. CI provider

Which CI provider should execute this intent's gates?

- A. GitHub Actions on the existing self-hosted Linux runner (recommended)
- B. AWS CodePipeline and CodeBuild
- C. Jenkins
- X. Other (please specify)

[Answer]: A

## Q2. Branch strategy

Which branch flow should gate the W2-04 intent?

- A. Short-lived intent branch to `integ/main-reconciled`, then synchronized promotion to `main` (recommended)
- B. Direct trunk-based merge to `main`
- C. GitFlow with `develop` and release branches
- X. Other (please specify)

[Answer]: A

## Q3. Required merge gates

Which quality-gate posture should block merge?

- A. Full intent gates: backend and frontend checks, contracts, dependency/security scan, isolated live broker/database/Booking proof, Playwright accessibility/responsive evidence, performance, demo guards, and both exit audits (recommended)
- B. Fast static gates only; defer live acceptance and exit audits
- C. Hybrid: static gates on pull requests and mandatory live gates only before promotion to `main`
- X. Other (please specify)

[Answer]: A

## Q4. Artifact repositories

Where should this slice publish or retain CI artifacts?

- A. Keep existing GitHub Actions evidence artifacts and commit-SHA-tagged local Compose images; add no cloud registry for this slice (recommended)
- B. Publish container images to Amazon ECR
- C. Publish packages/evidence to CodeArtifact and S3
- D. Use ECR for images plus CodeArtifact/S3 for packages and evidence
- X. Other (please specify)

[Answer]: A

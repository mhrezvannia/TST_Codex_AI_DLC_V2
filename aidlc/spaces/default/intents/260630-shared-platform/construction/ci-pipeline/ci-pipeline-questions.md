# CI Pipeline Questions

## Answered Questions

These questions were resolved from project memory, U08 `code-summary`, `build-and-test-summary`, and `build-test-results`; no new user input was needed.

1. What CI tool is in use?
   - A. AWS CodePipeline
   - B. AWS CodeBuild only
   - C. GitHub Actions
   - D. Jenkins
   - X. Other (please specify)
   - [Answer]: C. GitHub Actions on self-hosted on-prem runners.

2. What branch strategy is used?
   - A. Trunk-based development on `main`
   - B. GitHub Flow
   - C. GitFlow
   - D. Release branches
   - X. Other (please specify)
   - [Answer]: A. Trunk-based development on `main` with short-lived feature or Bolt branches and squash merge.

3. What quality gates are required before merge?
   - A. Package policy and domain purity
   - B. Contract and seed validation
   - C. Frontend tests and typechecks
   - D. Backend Maven tests
   - E. All of the above
   - X. Other (please specify)
   - [Answer]: E. All of the above, as implemented by `scripts/run-quality-gates.mjs`.

4. What artifact repositories are used for CI outputs?
   - A. GitHub Actions artifacts only
   - B. Amazon ECR
   - C. AWS CodeArtifact
   - D. S3 release buckets
   - X. Other (please specify)
   - [Answer]: A. GitHub Actions artifacts only for MVP quality evidence; deployable artifact repositories are deferred to Operation deployment stages.

## Source References

| Decision | Source |
| --- | --- |
| GitHub Actions self-hosted/on-prem runner | `aidlc/spaces/default/memory/team.md`, `.github/workflows/quality-gates.yml`, U08 `code-summary`. |
| Trunk-based branch strategy | `aidlc/spaces/default/memory/team.md`. |
| Required gates | `docs/quality-gates.md`, `build-and-test-summary`, `build-test-results`. |
| Artifact repository scope | U08 `code-summary`, `build-test-results`, skipped Operation deployment stages in `aidlc-state.md`. |

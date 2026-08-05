# CI Pipeline Questions — W2-03

## Upstream context

This question set consumes every unit `code-summary`, the approved
`build-and-test-summary`, and `build-test-results`. The repository has a
versioned `scripts/run-quality-gates.mjs` registry and package scripts, but no
checked-in `.github/workflows`, Jenkinsfile, CodeBuild buildspec, CodePipeline,
or established cloud artifact repository. Team rules keep W2-03 on
`intent/W2-03-charge-tariffs-and-agreements` and integrate through
`integ/main-reconciled`; production deployment remains out of this feature.

## Decisions required

1. Which CI execution surface should this stage define: a provider-neutral
   repository command contract, GitHub Actions, or AWS CodePipeline/CodeBuild?
2. Should merge validation preserve the program branch flow into
   `integ/main-reconciled`, and should blocked live evidence prevent a
   release-tag/promotion even when deterministic source checks are green?
3. Should CI publish only bounded test/evidence artifacts for this intent, or
   also publish deployable images/packages to a named repository?

## Recommended answers

- Define a provider-neutral repository CI contract now; do not invent an
  unobserved hosted CI provider.
- Trigger validation for the W2-03 intent branch and integration target; require
  every executable gate to pass, and prohibit release/promotion while required
  live cells are BLOCKED or UNMEASURED.
- Retain bounded CI evidence by commit SHA and build ID, but do not configure
  ECR, CodeArtifact, S3, or another deployable repository until a real platform
  and credentials are approved.


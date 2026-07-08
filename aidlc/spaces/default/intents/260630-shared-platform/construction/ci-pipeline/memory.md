# CI Pipeline Memory

## Interpretations

- 2026-07-02T05:00:00Z - Existing project context answers the CI clarifying questions; team memory mandates GitHub Actions on self-hosted on-prem runners, trunk-based `main`, PR quality gates, staging on merge, and manual production approval.
- 2026-07-02T05:01:00Z - The existing `.github/workflows/quality-gates.yml` from U08 is the actual pipeline configuration for this MVP CI stage; this stage records and validates it rather than creating a second overlapping workflow.
- 2026-07-02T05:02:00Z - The CI stage consumes per-unit `code-summary` artifacts plus `build-and-test-summary` and `build-test-results`, with the Maven backend gate remaining CI-runnable on a Java 21/Maven runner.

## Deviations

- 2026-07-02T05:03:00Z - No new interactive question prompt was required because the stage's CI-tool, branch-strategy, quality-gate, and artifact-repository questions are already answered by affirmed team practices and U08 quality-gate artifacts.
- 2026-07-02T05:04:00Z - The CI stage did not run GitHub Actions locally; validation used static workflow inspection plus direct execution of the underlying quality-gate runner.

## Tradeoffs

- 2026-07-02T05:05:00Z - A single aggregator workflow was retained instead of splitting jobs by service because the MVP has one monorepo and the gate runner already centralizes affected-scope classification and evidence output.
- 2026-07-02T05:06:00Z - Artifact publication is limited to quality-gate evidence for MVP CI; deployable container/image repository publication remains out of scope until the skipped Operation deployment stages are enabled.

## Open questions

- 2026-07-02T05:07:00Z - Confirm the self-hosted GitHub Actions runner has Docker, Java 21, Maven, Corepack, Yarn, and Node available before relying on full CI evidence.

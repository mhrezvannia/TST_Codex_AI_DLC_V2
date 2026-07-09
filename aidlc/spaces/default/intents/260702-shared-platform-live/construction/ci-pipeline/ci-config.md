# CI Config

## Inputs

This CI configuration consumes the generated unit `code-summary` artifacts, plus `build-and-test-summary.md` and `build-test-results.md`.

## Platform

CI uses GitHub Actions on self-hosted on-prem Linux runners.

Workflow file:

- `.github/workflows/quality-gates.yml`

Triggers:

- Pull requests targeting `main`
- Manual `workflow_dispatch`

## Pipeline Steps

1. Checkout source.
2. Setup Java 21 with Maven cache.
3. Enable Corepack.
4. Install frontend dependencies with `corepack yarn install --immutable`.
5. Run `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json`.
6. Always run `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json`.
7. Always upload quality/readiness evidence artifacts.

## Evidence Artifacts

- `artifacts/quality-gates/evidence.json`
- `artifacts/readiness/local-readiness.json`
- `artifacts/contracts-live-verification.json`
- `artifacts/seed-apply-attempt.json`

## Current Limitations

- Registry publication is deferred to Operation deployment-pipeline stages.
- Live readiness is evidence-only until Java/Docker service runtime is available and stable on the runner.

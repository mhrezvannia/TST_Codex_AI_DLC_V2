# CI Pipeline Memory

## Interpretations

- 2026-07-03T16:27:00Z - Selected GitHub Actions because `.github/workflows/quality-gates.yml` already exists and matches the on-prem/self-hosted runner requirement.

## Deviations

- 2026-07-03T16:28:00Z - Did not introduce artifact publishing to a registry in this Construction CI stage; local runtime is still blocked and deployment pipeline stages will own promotion and registry decisions.

## Tradeoffs

- 2026-07-03T16:29:00Z - Added readiness evidence as an always-run upload instead of a hard merge gate; current local runtime blockers should be visible without falsely failing otherwise valid frontend/script checks.

## Open questions

- 2026-07-03T16:30:00Z - Confirm whether live readiness should become merge-blocking once Docker/Java service runtime is stable on the self-hosted runner.

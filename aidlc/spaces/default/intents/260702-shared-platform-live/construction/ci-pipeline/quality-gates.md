# Quality Gates

## Inputs

This gate definition consumes unit `code-summary` outputs plus `build-and-test-summary.md` and `build-test-results.md`.

## Required Merge Gates

| Gate | Command | Required |
| --- | --- | --- |
| Package manager policy | `runPolicyChecks()` via `scripts/run-quality-gates.mjs` | Yes |
| Domain-core purity | `runPolicyChecks()` via `scripts/run-quality-gates.mjs` | Yes |
| Contract catalog | `node scripts/validate-contract-catalog.mjs` | Yes |
| Seed dry-run | `node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json` | Yes |
| Skeleton validation | `node scripts/validate-skeleton.mjs` | Yes |
| Reference Data tests | Direct Vitest command from build-test-results | Yes |
| Auth and Reference Data typechecks | Corepack Yarn workspace typechecks | Yes |
| Backend tests | `mvn -f services/pom.xml test` | Yes on CI runner |

## Evidence Gates

| Gate | Command | Merge behavior |
| --- | --- | --- |
| Local readiness | `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json` | Uploaded always; `blocked` is visible evidence |
| Live contracts | Inside readiness: `node scripts/verify-contract-providers.mjs --live` | Evidence until services are stable |
| Live seed apply | Inside readiness: `node scripts/seed-local.mjs --seed-file ...` | Evidence until services are stable |

## Current Status

Build and Test results show frontend/script checks passing. Backend Maven, Docker, and live services are blocked in the current local shell and should be available on the self-hosted CI runner before the gate can go fully green.

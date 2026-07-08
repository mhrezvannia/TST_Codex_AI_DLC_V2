# Quality Gates

U08 defines merge-blocking checks for Shared Platform pull requests. Required gates run on self-hosted, on-prem GitHub Actions runners.

## Gate Groups

| Gate id | Scope | Required | Command |
| --- | --- | --- | --- |
| `policy-package-manager` | workspace | yes | Package manager, lockfile, and domain purity policy checks |
| `backend-domain-purity` | services | yes | Domain-core import policy checks |
| `contracts-validate` | contracts | yes | `node scripts/validate-contract-catalog.mjs` |
| `contracts-verify` | contracts | yes | `node scripts/verify-contract-providers.mjs` |
| `seed-validate` | seeds | yes | `node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json` |
| `readiness-local` | workspace | evidence | `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json` |
| `skeleton-validate` | workspace | yes | `node scripts/validate-skeleton.mjs` |
| `frontend-reference-data-test` | apps/reference-data | yes | Reference-data component and helper tests |
| `frontend-reference-data-typecheck` | apps/reference-data | yes | `corepack yarn workspace @erp/app-reference-data typecheck` |
| `frontend-auth-typecheck` | apps/auth | yes | `corepack yarn workspace @erp/app-auth typecheck` |
| `backend-test` | services | yes | `mvn -f services/pom.xml test` |

## Evidence

The runner writes `artifacts/quality-gates/evidence.json` with:

- `gateId`
- `scope`
- `command`
- `required`
- `status`
- `summary`
- `evidencePath`

The aggregate status fails when any required gate is failed, skipped unexpectedly, or missing.

The readiness runner writes `artifacts/readiness/local-readiness.json` with `passed`, `blocked`, and `failed` counts. `blocked` means required local runtime dependencies are unavailable, not that code validation failed.

## Local Execution

```bash
node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json
node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json
```

Java 21, Maven, Corepack, Yarn, and Node are required for the full gate set. In shells without Java/Maven, backend gates fail locally but remain wired for CI.

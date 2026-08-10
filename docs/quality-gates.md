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
| `package-auth-test` | packages/auth | yes | `corepack yarn workspace @erp/auth test` |
| `package-auth-typecheck` | packages/auth | yes | `corepack yarn workspace @erp/auth typecheck` |
| `package-auth-lint` | packages/auth | yes | `corepack yarn workspace @erp/auth lint` |
| `package-shared-types-test` | packages/shared-types | yes | `corepack yarn workspace @erp/shared-types test` |
| `package-shared-types-typecheck` | packages/shared-types | yes | `corepack yarn workspace @erp/shared-types typecheck` |
| `package-shared-types-lint` | packages/shared-types | yes | `corepack yarn workspace @erp/shared-types lint` |
| `frontend-auth-test` | apps/auth | yes | `corepack yarn workspace @erp/app-auth test` |
| `frontend-auth-typecheck` | apps/auth | yes | `corepack yarn workspace @erp/app-auth typecheck` |
| `frontend-auth-lint` | apps/auth | yes | `corepack yarn workspace @erp/app-auth lint` |
| `frontend-auth-build` | apps/auth | yes | `corepack yarn workspace @erp/app-auth build` |
| `frontend-booking-test` | apps/booking | yes | `corepack yarn workspace @erp/app-booking test` |
| `frontend-booking-typecheck` | apps/booking | yes | `corepack yarn workspace @erp/app-booking typecheck` |
| `frontend-booking-lint` | apps/booking | yes | `corepack yarn workspace @erp/app-booking lint` |
| `frontend-booking-build` | apps/booking | yes | `corepack yarn workspace @erp/app-booking build` |
| `frontend-shell-test` | apps/shell | yes | `corepack yarn workspace @erp/app-shell test` |
| `frontend-shell-typecheck` | apps/shell | yes | `corepack yarn workspace @erp/app-shell typecheck` |
| `frontend-shell-lint` | apps/shell | yes | `corepack yarn workspace @erp/app-shell lint` |
| `frontend-shell-build` | apps/shell | yes | `corepack yarn workspace @erp/app-shell build` |
| `w2-01-live-acceptance` | w2-01-live | yes | `node scripts/w2-01-live-acceptance.mjs --output-root artifacts/w2-01-live/app-shell-auth && node scripts/w2-01-live-acceptance.mjs --validate --require-pass --output-root artifacts/w2-01-live/app-shell-auth` |
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

W2-01 live acceptance writes `artifacts/w2-01-live/app-shell-auth/`. The schema validator can accept an honest `BLOCKED` package for local diagnosis, but CI uses `--require-pass`, so the merge gate fails until live Compose/Nginx/Keycloak scenarios and both audit detectors are green. The W1-01 live-proof waiver must remain explicit as `BLOCKED at compose-start`; it is not a W2-01 pass.

## Local Execution

```bash
node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json
node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json
```

Java 21, Maven, Corepack, Yarn, and Node are required for the full gate set. In shells without Java/Maven, backend gates fail locally but remain wired for CI.

# Build Test Results

## Inputs

Results verify the code generated from each unit `code-generation-plan.md` and `code-summary.md`.

## Executed Commands

| Command | Result |
| --- | --- |
| `corepack yarn --version` | Passed: `4.5.3` |
| `corepack yarn workspace @erp/app-reference-data typecheck` | Passed |
| `corepack yarn workspace @erp/app-auth typecheck` | Passed |
| `node_modules\.bin\tsc.cmd -p apps/auth/tsconfig.json --noEmit` plus Reference Data tsc | Passed |
| `node_modules\.bin\eslint.cmd packages/auth apps/auth apps/reference-data --max-warnings=0` | Passed |
| `node_modules\.bin\vitest.cmd run apps/reference-data/app/page.test.tsx apps/reference-data/lib/service-clients.test.ts --config vitest.config.ts` | Passed: 11 tests |
| `node_modules\.bin\vitest.cmd run packages/auth/src/index.test.ts apps/auth/lib/auth-server.test.ts apps/reference-data/lib/service-clients.test.ts --config vitest.config.ts` | Passed: 15 tests |
| `node --test scripts/local-readiness.test.mjs scripts/seed-local.test.mjs scripts/verify-contract-providers.test.mjs scripts/run-quality-gates.test.mjs` | Passed: 15 tests |
| `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json` | Blocked: 7 passed, 3 blocked, 0 failed |
| `mvn -f services/pom.xml test` | Blocked: `mvn` not found |
| `corepack yarn workspace @erp/app-reference-data test` and auth test | Failed in this shell: `vitest` command not resolved by Yarn script |

## Failure and Blocker Details

- Backend Java tests are blocked by missing Maven.
- Live contract and seed apply checks are blocked because Identity and Reference Data services are not listening.
- The Yarn workspace test-script issue is local shell/tooling specific; direct Vitest commands passed.

## Evidence Files

- `artifacts/readiness/local-readiness.json`
- `artifacts/contracts-live-verification.json`
- `artifacts/seed-apply-attempt.json`

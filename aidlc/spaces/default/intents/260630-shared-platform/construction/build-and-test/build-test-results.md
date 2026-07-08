# Build and Test Results - Shared Platform MVP

## Execution Summary

Build and test execution was run from `D:\TST_Codex` on 2026-07-02 for the Shared Platform MVP code generated across `U01` through `U10`.

| Area | Status | Evidence |
| --- | --- | --- |
| Node/Yarn toolchain | Passed | `node --version` returned `v24.18.0`; `corepack yarn --version` returned `4.5.3`. |
| Java/Maven toolchain | Blocked | `java` and `mvn` are not recognized on this machine. |
| Static validators | Passed | Skeleton, contract catalog, seed dry-run, local smoke, observability smoke. |
| Unit tests | Passed | Node tests 11/11; Vitest tests 28/28. |
| Type checks | Passed | Auth app, reference-data app, `packages/auth`, and `packages/utils`. |
| Builds | Passed | Auth app and reference-data app Next production builds. |
| Lint | Passed | Direct ESLint over apps, packages, scripts, and config. |
| Compose | Passed | `docker compose config --quiet`. |
| Aggregate quality gate | Failed due environment | Only `backend-test` failed because `mvn` is unavailable. |

## Commands Run

| Command | Result |
| --- | --- |
| `node scripts/validate-skeleton.mjs` | Passed: status `ok`, services `identity-service`, `reference-data-service`. |
| `node scripts/validate-contract-catalog.mjs` | Passed: catalog version `0.1.0`, 3 contracts. |
| `node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json` | Passed: 11 created, 0 failed in dry-run. |
| `node scripts/smoke-local.mjs` | Passed: required Compose services, Nginx routes, seed pack, and optional observability marker. |
| `node scripts/smoke-observability.mjs` | Passed: 6 files validated. |
| `node --test scripts/seed-local.test.mjs scripts/validate-contract-catalog.test.mjs scripts/run-quality-gates.test.mjs scripts/smoke-observability.test.mjs` | Passed: 11 tests, 0 failures. |
| `node node_modules/vitest/vitest.mjs run ... --config vitest.config.ts` | Passed: 10 files, 28 tests. |
| `corepack yarn workspace @erp/app-auth typecheck` | Passed. |
| `corepack yarn workspace @erp/app-reference-data typecheck` | Passed. |
| `node node_modules/typescript/bin/tsc -p packages/auth/tsconfig.json --noEmit` | Passed. |
| `node node_modules/typescript/bin/tsc -p packages/utils/tsconfig.json --noEmit` | Passed. |
| `corepack yarn workspace @erp/app-auth build` | Passed with known Next ESLint-plugin warning. |
| `corepack yarn workspace @erp/app-reference-data build` | Passed with known Next ESLint-plugin warning. |
| `node node_modules/eslint/bin/eslint.js apps packages scripts eslint.config.mjs vitest.config.ts` | Passed. |
| `docker compose config --quiet` | Passed. |
| `git diff --check` | Passed. |
| `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json` | Failed only `backend-test`; evidence written. |

## Failure Details

The aggregate quality gate failed because Maven is missing:

```text
Gate: backend-test
Command: mvn -f services/pom.xml test
Status: failed
Summary: 'mvn' is not recognized as an internal or external command, operable program or batch file.
```

This is an environment/toolchain blocker. The Java source, Maven modules, and backend tests remain present from the code-generation units, and should be run on a host with Java 21 and Maven 3.9+.

## Evidence Files

| File | Contents |
| --- | --- |
| `artifacts/quality-gates/evidence.json` | Aggregate gate results and per-gate evidence paths. |
| `artifacts/quality-gates/backend-test.log` | Maven command failure from missing `mvn`. |
| `artifacts/quality-gates/contracts-validate.log` | Contract validation output. |
| `artifacts/quality-gates/seed-validate.log` | Seed dry-run output. |
| `artifacts/quality-gates/frontend-reference-data-test.log` | Vitest output for reference-data app gate. |

## Result

Frontend, shared TypeScript, contracts, seeds, Compose descriptors, observability descriptors, direct lint, and local Node/Vitest tests are build-ready and test-ready. Backend Maven verification is not complete locally until Java 21 and Maven are installed.

# CI Quality Gates - Shared Platform MVP

## Gate Inventory

The CI quality gates consume per-unit `code-summary` artifacts, `build-and-test-summary`, and `build-test-results`. The executable source of truth is `scripts/run-quality-gates.mjs`; the human-readable catalog is `docs/quality-gates.md`.

| Gate id | Scope | Required | Command or check |
| --- | --- | --- | --- |
| `policy-package-manager` | workspace | Yes | Package-manager, lockfile, and package policy check. |
| `backend-domain-purity` | services | Yes | Domain-core import policy check. |
| `contracts-validate` | contracts | Yes | `node scripts/validate-contract-catalog.mjs`. |
| `seed-validate` | seeds | Yes | `node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json`. |
| `skeleton-validate` | workspace | Yes | `node scripts/validate-skeleton.mjs`. |
| `frontend-reference-data-test` | `apps/reference-data` | Yes | Vitest component/helper suites. |
| `frontend-reference-data-typecheck` | `apps/reference-data` | Yes | `corepack yarn workspace @erp/app-reference-data typecheck`. |
| `frontend-auth-typecheck` | `apps/auth` | Yes | `corepack yarn workspace @erp/app-auth typecheck`. |
| `backend-test` | services | Yes | `mvn -f services/pom.xml test`. |

## Pass and Fail Criteria

| Criterion | Rule |
| --- | --- |
| Required gates | Any failed, missing, or unexpectedly skipped required gate fails the aggregate result. |
| Evidence | Every run must write `artifacts/quality-gates/evidence.json`. |
| Backend Maven gate | Must pass on CI runner with Java 21 and Maven even though it is environment-blocked locally. |
| Contracts | Contract catalog, examples, Avro schemas, and event coverage must validate. |
| Seeds | MVP local seed pack must validate deterministically with 0 failures. |
| Frontend | Auth/reference-data typechecks and reference-data tests must pass. |
| Domain purity | Backend domain-core modules must remain framework and adapter independent. |

## Current Evidence

From `build-test-results`:

| Evidence | Result |
| --- | --- |
| Node tests | Passed: 11/11. |
| Vitest tests | Passed: 28/28. |
| App and package typechecks | Passed. |
| Next production builds | Passed for auth and reference-data apps. |
| ESLint | Passed. |
| Compose config | Passed. |
| Quality gate aggregate | Failed only `backend-test` because Maven is missing locally. |

## Merge Policy

PRs to `main` should be blocked unless `scripts/run-quality-gates.mjs --all` returns aggregate `passed`. The only known unresolved item is runner provisioning: the CI runner must have Maven available so `backend-test` can produce real backend evidence.

## Future Expansion

When Operation deployment stages are enabled, add these gates:

| Future gate | Trigger |
| --- | --- |
| Container image build and scan | Before staging promotion. |
| SBOM and dependency vulnerability scan | Before artifact publication. |
| Staging smoke tests | After staging deployment. |
| Manual production approval | Before production promotion. |
| Post-deployment health checks | After production deployment. |

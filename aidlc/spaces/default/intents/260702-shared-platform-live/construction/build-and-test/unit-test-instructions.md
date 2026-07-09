# Unit Test Instructions

## Inputs

Unit tests cover behavior introduced in the unit `code-generation-plan.md` and `code-summary.md` files for UOW-01 through UOW-11.

## Commands

```powershell
node --test scripts/local-readiness.test.mjs scripts/seed-local.test.mjs scripts/verify-contract-providers.test.mjs scripts/run-quality-gates.test.mjs
node_modules\.bin\vitest.cmd run packages/auth/src/index.test.ts apps/auth/lib/auth-server.test.ts apps/reference-data/lib/service-clients.test.ts --config vitest.config.ts
node_modules\.bin\vitest.cmd run apps/reference-data/app/page.test.tsx apps/reference-data/lib/service-clients.test.ts --config vitest.config.ts
```

## Coverage Expectations

- Auth bypass guard: local allowed, staging/production denied.
- Reference Data BFF clients: permission, normalization, mutation command behavior.
- Workbench UI: render, permission-enabled create/edit controls, BFF create submission.
- Seed apply: dry-run validation, command generation, fake live API apply.
- Readiness and contract verifier: blocked-versus-failed classification and provider coverage.

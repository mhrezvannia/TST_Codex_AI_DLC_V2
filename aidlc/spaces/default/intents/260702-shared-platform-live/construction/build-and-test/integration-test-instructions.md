# Integration Test Instructions

## Inputs

Integration checks validate boundaries introduced in `code-generation-plan.md` and reported in `code-summary.md`: BFF-to-service calls, seed apply through live APIs, contract provider checks, and readiness aggregation.

## Commands

```powershell
node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json
node scripts/verify-contract-providers.mjs --live --evidence-file artifacts/contracts-live-verification.json
node scripts/seed-local.mjs --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json --summary-file artifacts/seed-apply-attempt.json
node scripts/smoke-local.mjs
```

## Expected Results

- Before services are running, `readiness:local` should report `blocked`, not `failed`.
- With Docker/Java services running, live contracts and seed apply should pass and readiness should move to `passed`.
- BFF mutation routes should return either created/updated records or explicit `403`/`503` payloads with correlation ids.

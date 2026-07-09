# Code Summary - UOW-08 Seed Apply Through Live APIs

## Files Modified

- `scripts/seed-local.mjs` - Added live API apply mode, identity role assignment calls, reference-data create/update calls, service health waits, and failure summaries.
- `scripts/seed-local.test.mjs` - Added tests for mutation commands, role assignment commands, and fake live API apply mode.

## Files Created

- `artifacts/seed-apply-attempt.json` - Evidence from a real local apply attempt showing services are currently unavailable.

## Key Decisions

- `--dry-run` remains validation-only and safe.
- Non-dry-run execution now attempts real service API calls and exits non-zero if any operation fails.
- Apply mode checks a reference record by immutable id before deciding create versus update.

## Test Coverage

- `node --test scripts/seed-local.test.mjs`: 6 tests passed.
- `node scripts/seed-local.mjs --dry-run --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json`: passed with 11 dry-run creates and 0 failures.
- `node scripts/seed-local.mjs --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json --summary-file artifacts/seed-apply-attempt.json`: failed as expected because identity/reference-data services are not listening.

## Deviations

- Keycloak Admin API user creation is still represented in seed data but not applied directly; local auth bypass and identity-service role assignment cover the current functional path until Keycloak admin provisioning is implemented.

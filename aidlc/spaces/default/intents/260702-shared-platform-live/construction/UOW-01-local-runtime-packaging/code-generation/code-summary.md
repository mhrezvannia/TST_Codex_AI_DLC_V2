# Code Summary - UOW-01 Local Runtime Packaging and Prerequisite Checks

## Files Created

- `scripts/check-local-prereqs.mjs` - Checks command availability and required local ports, with `--json` output.

## Files Modified

- `package.json` - Added `local:check` and `local:check:json`.
- `compose.yaml` - Exposed local ports `8082` and `8083`; added Reference Data app service URL environment variables.

## Key Decisions

- Missing prerequisites are reported as `blocked` rather than mixed into build/test failures.
- Core service ports are required: Postgres `5432`, Keycloak `8080`, Identity `8082`, Reference Data `8083`, and nginx `8088`.

## Test Coverage

- `node scripts/check-local-prereqs.mjs --json` ran successfully as a script but returned blocked status because local prerequisites are missing.
- Observed blockers: Yarn command unavailable, Java unavailable, Maven unavailable, Docker daemon unavailable, Keycloak/Identity/Reference Data/nginx ports not listening.

## Deviations

- Full Compose verification was not run because Docker daemon is unavailable.

# Code Summary - UOW-02 Auth Session and Keycloak Local Flow

## Files Modified

- `apps/reference-data/lib/service-clients.ts` - Added non-production local auth bypass handling for Reference Data BFF permissions.
- `apps/reference-data/lib/service-clients.test.ts` - Added bypass behavior coverage.

## Key Decisions

- The bypass is explicit in the permission reason and cannot activate in production.
- This pass did not modify the auth app because prior local bypass support already exists there.

## Test Coverage

- `node_modules/.bin/vitest.cmd run apps/reference-data/lib/service-clients.test.ts apps/reference-data/lib/reference-data.test.ts --config vitest.config.ts`: 8 tests passed.
- `node_modules/.bin/tsc.cmd -p apps/reference-data/tsconfig.json --noEmit`: passed.

## Deviations

- Keycloak callback/session proof was not run because Keycloak is not listening on local port `8080`.

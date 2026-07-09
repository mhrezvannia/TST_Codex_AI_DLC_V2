# Code Summary - UOW-11 Auth Bypass Non-Local Guard

## Files Modified

- `packages/auth/src/index.ts` - Added `isLocalRuntimeProfile`, `isLocalBypassEnabled`, and guarded `isAuthBypassEnabled`.
- `packages/auth/src/index.test.ts` - Added runtime-profile and app-specific bypass guard tests.
- `apps/auth/lib/auth-server.ts` - Uses the shared auth bypass guard.
- `apps/auth/proxy.ts` - Uses the shared auth bypass guard instead of raw `AUTH_BYPASS`.
- `apps/auth/lib/auth-server.test.ts` - Added non-local bypass denial coverage.
- `apps/reference-data/lib/service-clients.ts` - Uses the shared local bypass guard for Reference Data write bypass.
- `apps/reference-data/lib/service-clients.test.ts` - Added non-local Reference Data bypass denial coverage.

## Key Decisions

- `NODE_ENV=production` always disables bypass even if `APP_ENV=local`.
- Local bypass is allowed only when the runtime profile is `local`, `development`, `dev`, or `test`.
- Reference Data can use either `AUTH_BYPASS=true` or `REFERENCE_DATA_AUTH_BYPASS=true`, but only through the shared local guard.

## Test Coverage

- `node_modules/.bin/tsc.cmd -p apps/auth/tsconfig.json --noEmit`: passed.
- `node_modules/.bin/tsc.cmd -p apps/reference-data/tsconfig.json --noEmit`: passed.
- `node_modules/.bin/vitest.cmd run packages/auth/src/index.test.ts apps/auth/lib/auth-server.test.ts apps/reference-data/lib/service-clients.test.ts --config vitest.config.ts`: 15 tests passed.
- `node_modules/.bin/eslint.cmd packages/auth apps/auth apps/reference-data --max-warnings=0`: passed.

## Deviations

- Global `yarn` is unavailable, so validation used local binaries under `node_modules/.bin`.

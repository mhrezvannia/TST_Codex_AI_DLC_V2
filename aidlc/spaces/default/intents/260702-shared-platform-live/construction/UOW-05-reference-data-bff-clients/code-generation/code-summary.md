# Code Summary - UOW-05 Reference Data BFF Service Clients and Error Mapping

## Files Created

- `apps/reference-data/lib/service-clients.ts` - Identity/reference-data service clients, BFF response shaping, local bypass guard, and upstream error handling.
- `apps/reference-data/lib/service-clients.test.ts` - Focused service-client tests.

## Files Modified

- `apps/reference-data/app/api/reference-sets/route.ts`
- `apps/reference-data/app/api/permissions/reference-data/route.ts`
- `apps/reference-data/app/api/reference-sets/[set]/records/route.ts`
- `apps/reference-data/app/api/reference-sets/[set]/records/[id]/route.ts`
- `apps/reference-data/app/api/reference-sets/[set]/records/[id]/history/route.ts`

## Key Decisions

- Static local arrays remain in `reference-data.ts` for UI labels/tests, but BFF route handlers now call services.
- Upstream failures return `503` with correlation ids, not fake successful mutation responses.
- Local write bypass is guarded by non-production environment checks.

## Test Coverage

- `node_modules/.bin/tsc.cmd -p apps/reference-data/tsconfig.json --noEmit`: passed.
- `node_modules/.bin/vitest.cmd run apps/reference-data/lib/service-clients.test.ts apps/reference-data/lib/reference-data.test.ts --config vitest.config.ts`: 8 tests passed.

## Deviations

- Route integration tests against live services are deferred until Docker/backend services are running.

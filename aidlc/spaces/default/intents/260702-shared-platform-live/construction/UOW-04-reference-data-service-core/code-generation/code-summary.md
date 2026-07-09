# Code Summary - UOW-04 Reference Data Service Persistence and Mutation Core

## Files Modified

- `apps/reference-data/lib/service-clients.ts` - Added reference-data-service clients, record normalization, mutation command construction, and service error mapping.
- `apps/reference-data/app/api/reference-sets/[set]/records/route.ts` - Replaced static list/create behavior with service-backed behavior.
- `apps/reference-data/app/api/reference-sets/[set]/records/[id]/route.ts` - Replaced static detail/update behavior with service-backed behavior.
- `apps/reference-data/app/api/reference-sets/[set]/records/[id]/history/route.ts` - Replaced static history behavior with service-backed behavior.

## Key Decisions

- Browser routes stay behind the BFF and do not call Java services directly.
- Backend records are normalized because Java records serialize `id` and `code` as value objects.

## Test Coverage

- Frontend TypeScript passed.
- Focused service-client tests passed.

## Deviations

- Java persistence and mutation-core internals were not changed because backend toolchain/runtime prerequisites are unavailable in this shell.

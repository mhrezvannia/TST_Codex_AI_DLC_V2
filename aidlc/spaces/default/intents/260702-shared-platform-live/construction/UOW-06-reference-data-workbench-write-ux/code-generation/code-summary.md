# Code Summary - UOW-06 Reference Data Workbench Write UX

## Files Created

- `apps/reference-data/app/ReferenceDataWorkbench.tsx` - Client-side Reference Data workbench with live BFF loading, permission state, create/edit forms, and status feedback.

## Files Modified

- `apps/reference-data/app/page.tsx` - Replaced static mock page with `ReferenceDataWorkbench` plus local fallback data.
- `apps/reference-data/app/page.test.tsx` - Updated tests for interactive write-capable behavior.

## Key Decisions

- The workbench defaults to `CURRENCY` so the existing seed/demo record is immediately visible.
- Create/edit are enabled only when BFF permissions return `canWrite: true`.
- Deactivate remains visible but disabled until the backend exposes the deactivate route through the BFF.
- Backend outages keep the screen usable with fallback data while surfacing service-unavailable status.

## Test Coverage

- `node_modules/.bin/tsc.cmd -p apps/reference-data/tsconfig.json --noEmit`: passed.
- `node_modules/.bin/vitest.cmd run apps/reference-data/app/page.test.tsx apps/reference-data/lib/service-clients.test.ts --config vitest.config.ts`: 11 tests passed.
- `node_modules/.bin/eslint.cmd apps/reference-data --max-warnings=0`: passed.

## Deviations

- Deactivate was not implemented because the current Java controller does not expose the OpenAPI-declared deactivate endpoint through code.

# Code Summary - UOW-03 Identity Authorization Integration and Persistence

## Files Modified

- `apps/reference-data/lib/service-clients.ts` - Added identity-service authorization client and permission mapping.
- `apps/reference-data/app/api/permissions/reference-data/route.ts` - Replaced static read-only response with identity-backed permission resolution.
- `apps/reference-data/app/api/reference-sets/route.ts` - Includes identity-backed permissions in the reference-set response.

## Key Decisions

- BFF routes do not grant writes silently when identity-service is unavailable; they return explicit service errors unless local bypass is enabled.
- Token reference is read from `Authorization`, `X-Token-Reference`, or `LOCAL_REFERENCE_DATA_TOKEN`.

## Test Coverage

- Frontend TypeScript passed.
- Focused service-client tests passed.

## Deviations

- Java identity persistence was not implemented in this pass because Java, Maven, and Docker runtime validation are blocked locally.

# Frontend Components - U05 REST API and OpenAPI

## Applicability

U05 does not render UI, but it defines the API shape consumed by the frontend.

## BFF Impact

| API | Future BFF route |
| --- | --- |
| Agreement search | `apps/charge-agreements/app/api/agreements/route.ts` |
| Agreement detail/update | `apps/charge-agreements/app/api/agreements/[id]/route.ts` |
| Status action | `apps/charge-agreements/app/api/agreements/[id]/status/route.ts` |
| Active lookup | `apps/charge-agreements/app/api/active-lookup/route.ts` |

## Handoff

U06 implements these BFF routes and maps responses into UI view models.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.
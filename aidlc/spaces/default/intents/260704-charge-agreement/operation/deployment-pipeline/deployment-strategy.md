# Deployment Strategy - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `ci-config`, `quality-gates`, `deployment-architecture`, and `cicd-pipeline`.

## Strategy

B01/U01 uses a local recreate strategy:

1. Confirm `quality-gates` pass for Charge Agreement frontend and service changes.
2. Stop any old local runtime processes for the app, service, and proxy.
3. Start `charge-agreement-service` on `8084`.
4. Start `apps/charge-agreements` on `3002`.
5. Start the local reverse proxy with `/charge-agreements/` routed to the app.
6. Run health and module-info smoke checks.

This matches `deployment-architecture`, which defines a local Spring Boot process and a local Next.js process behind the reverse proxy.

## Promotion Gates

| Gate | Required Evidence | Failure Action |
| --- | --- | --- |
| CI | `ci-config` workflow and `quality-gates` pass | Do not start deployment |
| Backend health | `/api/charge-agreements/module-info` returns expected module metadata | Stop service and investigate |
| Frontend health | `apps/charge-agreements/app/api/health/route.ts` returns healthy | Stop app and investigate |
| Proxy route | `/charge-agreements/` reaches the app through local reverse proxy | Roll back proxy route or app process |

## Feature Exposure

The walking skeleton is dark-launched by route. The `/charge-agreements/` route is present for local validation, but business workflows remain informational until later implementation units add persistence, lifecycle commands, and editable UI behavior.

## Production Posture

No production deployment strategy is claimed for this stage. Blue/green, canary, traffic shifting, and external feature-flag providers should be revisited after the module has completed functional units and live integration checks.


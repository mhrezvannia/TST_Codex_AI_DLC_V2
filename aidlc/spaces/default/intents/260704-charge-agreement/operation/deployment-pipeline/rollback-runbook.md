# Rollback Runbook - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `ci-config`, `quality-gates`, `deployment-architecture`, and `cicd-pipeline`.

## Rollback Triggers

Rollback the B01/U01 local deployment when any of these occur:

- `quality-gates` fail before deployment starts.
- Backend module-info endpoint is unavailable or returns unexpected metadata.
- Frontend health/API routes fail.
- Local reverse proxy cannot route `/charge-agreements/`.
- The local runtime causes port conflicts or blocks other Shared Platform modules.

## Rollback Steps

1. Stop the Charge Agreement frontend process on port `3002`.
2. Stop the Charge Agreement backend process on port `8084`.
3. Stop or restart the local reverse proxy if `/charge-agreements/` routing is unhealthy.
4. Re-run the affected `ci-config` and `quality-gates` commands to confirm the workspace still builds.
5. If rollback needs to remove code, revert only the Charge Agreement service, app, proxy route, and CI gate changes from the current change set.

## Verification After Rollback

| Check | Expected Result |
| --- | --- |
| Port `3002` | No stale Charge Agreement app listener |
| Port `8084` | No stale Charge Agreement service listener |
| Existing Shared Platform routes | Continue working or remain intentionally stopped |
| CI aggregator | Still runs without syntax/runtime errors |

## Escalation

This runbook has no production customer impact because the walking skeleton is local-only. If future stages add shared databases, external queues, IAM changes, or production traffic, rollback must be extended with data migration and traffic-shift procedures before deployment execution.


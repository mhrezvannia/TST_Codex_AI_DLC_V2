# Deployment Log

## Inputs

This log consumes `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`.

## Attempt Summary

Deployment status: BLOCKED

No Docker Compose deployment command was executed because pre-deployment validation shows Docker daemon, Java, Maven, and required services are unavailable.

## Commands Executed

| Command | Result |
| --- | --- |
| `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json` | Blocked: 7 passed, 3 blocked, 0 failed |
| `node scripts/smoke-local.mjs` | Passed: seed pack, Compose services, nginx routes, optional observability profile |
| `node scripts/check-local-prereqs.mjs --json` | Blocked: 2 required ready, 8 required blocked |

## Deployment Commands Not Executed

```powershell
docker compose up -d postgres keycloak kafka schema-registry
docker compose --profile apps up -d
```

Reason: Docker daemon unavailable; Java/Maven service build prerequisites unavailable; service images cannot be proven.

## Current Decision

Deployment execution is safely halted at pre-deployment validation. No application runtime was changed.

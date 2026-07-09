# Rollback Runbook

## Inputs

This rollback runbook consumes `ci-config`, `quality-gates`, unit `deployment-architecture`, and unit `cicd-pipeline` artifacts.

## Rollback Triggers

Rollback local/on-prem deployment when any of these occur:

- `node scripts/local-readiness.mjs` returns `failed`.
- Live contract verification fails after a deploy.
- Seed apply fails after services are healthy.
- Reference Data BFF create/edit returns persistent `5xx`.
- Auth bypass guard behaves outside local profile.

## Rollback Steps

1. Capture evidence:

```powershell
node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json
```

2. Stop the apps profile:

```powershell
docker compose --profile apps down
```

3. Restore previous image tags or prior Compose configuration.

4. Restart dependencies and apps:

```powershell
docker compose up -d postgres keycloak kafka schema-registry
docker compose --profile apps up -d
```

5. Re-run readiness and live contracts.

6. If database state is suspected, preserve current volume evidence before restoring any prior local database snapshot.

## Abort Conditions

Do not retry deployment automatically if:

- Maven build fails.
- Docker daemon is unavailable.
- Database migrations or seed apply partially fail.
- Readiness evidence reports `failed` rather than `blocked`.

## Recovery Evidence

Attach these files to the recovery note:

- `artifacts/readiness/local-readiness.json`
- `artifacts/quality-gates/evidence.json`
- `artifacts/contracts-live-verification.json`
- `artifacts/seed-apply-attempt.json`

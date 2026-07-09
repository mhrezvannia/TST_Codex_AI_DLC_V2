# Deployment Strategy

## Inputs

This strategy consumes `ci-config`, `quality-gates`, unit `deployment-architecture`, and unit `cicd-pipeline` artifacts.

## Strategy

Initial strategy: recreate local/on-prem deployment.

Rationale:

- The current intent is Shared Platform local functionality, not cloud production rollout.
- `quality-gates` and readiness evidence show application checks pass, while runtime is blocked by missing Maven/Docker/services.
- Recreate deployment is simpler and more appropriate until service containers and health checks are stable.

## Promotion Gates

Promotion into local/on-prem demo is allowed only when all are true:

- `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json` passes.
- `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json` returns `passed`.
- `node scripts/verify-contract-providers.mjs --live --evidence-file artifacts/contracts-live-verification.json` passes.
- `node scripts/seed-local.mjs --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json --summary-file artifacts/seed-apply-attempt.json` passes.
- Browser smoke confirms Reference Data workbench can load records and submit create/edit through the BFF when local write bypass is enabled.

## Deployment Procedure

1. Build backend service images after Maven is available.
2. Build app images for `apps-auth` and `apps-reference-data`.
3. Start dependencies:

```powershell
docker compose up -d postgres keycloak kafka schema-registry
```

4. Start apps profile:

```powershell
docker compose --profile apps up -d
```

5. Run readiness:

```powershell
node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json
```

6. If readiness passes, run live contracts and seed apply.

## Feature Flags

Local-only flags:

- `AUTH_BYPASS=true`
- `REFERENCE_DATA_AUTH_BYPASS=true`
- `APP_ENV=local`

Guardrail: bypass flags must remain disabled for non-local profiles by the shared `@erp/auth` guard.

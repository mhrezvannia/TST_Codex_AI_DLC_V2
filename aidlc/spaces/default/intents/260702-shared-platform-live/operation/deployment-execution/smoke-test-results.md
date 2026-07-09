# Smoke Test Results

## Inputs

Smoke tests consume `cd-config`, `deployment-strategy`, `environment-inventory`, and `build-test-results`.

## Static Smoke

Command:

```powershell
node scripts/smoke-local.mjs
```

Result: PASSED

Validated:

- Seed pack exists and validates.
- Compose declares postgres, keycloak, kafka, schema-registry, identity-service, reference-data-service, apps-auth, apps-reference-data, nginx, and seed-loader.
- nginx declares `/auth/`, `/reference-data/`, and `/health`.
- Observability profile remains optional.

## Runtime Smoke

Result: BLOCKED

Blocked checks:

- Browser access through nginx `8088`.
- Auth session through apps-auth.
- Reference Data list/create/edit through BFF.
- Live contract checks.
- Live seed apply.

Reason: dependent services are not running.

## Evidence

- `artifacts/readiness/local-readiness.json`
- `artifacts/contracts-live-verification.json`
- `artifacts/seed-apply-attempt.json`

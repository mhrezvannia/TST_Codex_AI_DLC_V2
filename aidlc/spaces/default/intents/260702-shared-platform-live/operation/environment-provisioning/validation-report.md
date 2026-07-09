# Validation Report

## Inputs

This report consumes unit `deployment-architecture`, unit `infrastructure-services`, `cd-config`, and current readiness evidence.

## Validation Summary

Overall status: BLOCKED

Code and configuration checks are passing, but local runtime provisioning is incomplete.

## Evidence

Current readiness evidence:

- `artifacts/readiness/local-readiness.json`
- Status: `blocked`
- Summary: 7 passed, 3 blocked, 0 failed

Quality evidence:

- `artifacts/quality-gates/evidence.json`
- Aggregate failed only on `backend-test`
- Cause: Maven command unavailable in this shell

## Provisioning Validation

| Area | Result | Notes |
| --- | --- | --- |
| Toolchain | Blocked | Java, Maven, Docker daemon missing; direct Yarn missing, Corepack Yarn available |
| Runtime services | Blocked | Keycloak, Identity, Reference Data, nginx, Kafka, Schema Registry are not listening |
| Data services | Partial | Postgres port `5432` is listening |
| Secrets | Local-only | Local env examples exist; no cloud secret store is provisioned |
| Network | Local-only | Compose ports are defined; no AWS VPC resources apply |
| Security posture | Partial | Auth bypass guard is tested; runtime security checks require running services |
| Compliance posture | Partial | No production/cloud environment is provisioned in this intent |

## Required Provisioning Actions

1. Install or expose Java 21.
2. Install or expose Maven 3.9+.
3. Start Docker Desktop and verify the Linux engine is available.
4. Build or provide local images:
   - `linercore/identity-service:local`
   - `linercore/reference-data-service:local`
   - `linercore/apps-auth:local`
   - `linercore/apps-reference-data:local`
5. Start Compose dependencies and apps profile.
6. Re-run:

```powershell
node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json
node scripts/verify-contract-providers.mjs --live --evidence-file artifacts/contracts-live-verification.json
node scripts/seed-local.mjs --seed-file infrastructure/seeds/shared-platform-mvp-defaults.json --summary-file artifacts/seed-apply-attempt.json
```

## Decision

Environment provisioning is not complete. The next stage can continue documenting deployment execution prerequisites, but real local execution remains blocked until the runtime actions above are completed.

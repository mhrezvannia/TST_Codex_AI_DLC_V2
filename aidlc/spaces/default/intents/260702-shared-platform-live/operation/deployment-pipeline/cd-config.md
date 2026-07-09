# CD Config

## Inputs

This CD config consumes `ci-config`, `quality-gates`, each unit `deployment-architecture`, and each unit `cicd-pipeline` artifact from Construction.

## Pipeline Shape

CD is defined as a gated local/on-prem promotion process after CI:

1. CI completes `.github/workflows/quality-gates.yml`.
2. Required quality gates pass:
   - `node scripts/run-quality-gates.mjs --all --evidence artifacts/quality-gates/evidence.json`
   - `node scripts/verify-contract-providers.mjs`
   - Frontend/auth typechecks and tests
   - Backend Maven tests on a runner with Java/Maven available
3. Readiness evidence is generated:
   - `node scripts/local-readiness.mjs --evidence artifacts/readiness/local-readiness.json`
4. Local services are deployed with Compose only when readiness blockers are cleared.
5. Live contracts and seed apply run after services are healthy.

## Environment Matrix

| Environment | Purpose | Promotion gate |
| --- | --- | --- |
| Local developer | Prove Shared Platform behavior and smoke checks | `readiness:local` has no failed checks |
| Self-hosted CI | Merge confidence | `quality-gates` pass; readiness evidence uploaded |
| Local/on-prem demo | User validation of Shared Platform | Docker/Java services running, live contracts pass, seed apply passes |

## Configuration

Required local deployment environment:

```text
APP_ENV=local
AUTH_BYPASS=true
REFERENCE_DATA_AUTH_BYPASS=true
IDENTITY_SERVICE_URL=http://localhost:8082
REFERENCE_DATA_SERVICE_URL=http://localhost:8083
```

## Blockers

Deployment is blocked until:

- Java and Maven are available.
- Docker Desktop/Compose are available.
- Keycloak, Identity, Reference Data, nginx, Kafka, and Schema Registry services are listening.
- `artifacts/readiness/local-readiness.json` reports no failed checks and no required blocked checks.

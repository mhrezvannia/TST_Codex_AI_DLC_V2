# Build Instructions

## Inputs

This build plan consumes every unit `code-generation-plan.md` and `code-summary.md` under `construction/*/code-generation/`.

## Environment Setup

Required local tools:

- Node 24+
- Corepack Yarn 4.5.3
- Java 21
- Maven 3.9+
- Docker Desktop with Compose

Useful environment values:

- `AUTH_BYPASS=true`
- `APP_ENV=local`
- `REFERENCE_DATA_AUTH_BYPASS=true`
- `IDENTITY_SERVICE_URL=http://localhost:8082`
- `REFERENCE_DATA_SERVICE_URL=http://localhost:8083`

## Build Commands

```powershell
corepack yarn workspace @erp/app-auth typecheck
corepack yarn workspace @erp/app-reference-data typecheck
node_modules\.bin\eslint.cmd packages/auth apps/auth apps/reference-data --max-warnings=0
mvn -f services/pom.xml test
docker compose --profile apps up --build
```

## Troubleshooting

- If Yarn is unavailable, use `corepack yarn --version` to activate the pinned package manager.
- If workspace test scripts cannot resolve `vitest`, run `node_modules\.bin\vitest.cmd ... --config vitest.config.ts`.
- If Maven is unavailable, install Java 21 and Maven before backend verification.
- If readiness is `blocked`, inspect `artifacts/readiness/local-readiness.json`.

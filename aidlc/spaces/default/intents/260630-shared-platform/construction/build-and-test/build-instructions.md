# Build Instructions - Shared Platform MVP

## Scope and Inputs

These instructions validate the build outputs produced by the Shared Platform MVP code-generation units `U01-platform-skeleton` through `U10-observability-deployment`.

Upstream artifacts consumed:

| Upstream artifact | Usage |
| --- | --- |
| `construction/U01-platform-skeleton/code-generation/code-generation-plan.md` and `code-summary.md` | Workspace, package, service, Compose, and baseline build shape. |
| `construction/U02-identity-authz-service/code-generation/code-generation-plan.md` and `code-summary.md` | Identity service Maven modules, OpenAPI, and authorization tests. |
| `construction/U03-reference-domain-api/code-generation/code-generation-plan.md` and `code-summary.md` | Reference-data service Maven modules, domain validation, and API contracts. |
| `construction/U04-reference-event-outbox/code-generation/code-generation-plan.md` and `code-summary.md` | Outbox, Avro event contracts, and publication seams. |
| `construction/U05-app-auth/code-generation/code-generation-plan.md` and `code-summary.md` | Auth app, BFF routes, and auth package behavior. |
| `construction/U06-app-reference-data/code-generation/code-generation-plan.md` and `code-summary.md` | Reference-data app, BFF routes, and read-only workspace. |
| `construction/U07-contracts-dx/code-generation/code-generation-plan.md` and `code-summary.md` | Contract catalog, examples, fixtures, and catalog validation. |
| `construction/U08-quality-gates/code-generation/code-generation-plan.md` and `code-summary.md` | Quality-gate runner and CI workflow. |
| `construction/U09-local-seed-compose/code-generation/code-generation-plan.md` and `code-summary.md` | Local seed data, Compose changes, and smoke checks. |
| `construction/U10-observability-deployment/code-generation/code-generation-plan.md` and `code-summary.md` | Observability descriptors, smoke validation, and utility logging helpers. |

## Prerequisites

Install or provide the following tools before running the full build:

| Tool | Required for | Local status observed in this run |
| --- | --- | --- |
| Node.js 24.x | scripts, Vitest, Next.js, TypeScript, ESLint | Available: `v24.18.0`. |
| Corepack/Yarn 4.5.3 | workspace package manager | Available: `4.5.3`. |
| Docker Compose v2 | Compose descriptor validation and optional local runtime | `docker compose config --quiet` passed. |
| Java 21 | backend compile/test runtime | Not available in this shell. |
| Maven 3.9+ | `services/pom.xml` backend build/test | Not available in this shell. |

Use the committed Yarn version through Corepack:

```powershell
corepack enable
corepack yarn --version
corepack yarn install --immutable
```

## Build Commands

Run the frontend and shared package builds with workspace-specific commands:

```powershell
corepack yarn workspace @erp/app-auth typecheck
corepack yarn workspace @erp/app-reference-data typecheck
node node_modules/typescript/bin/tsc -p packages/auth/tsconfig.json --noEmit
node node_modules/typescript/bin/tsc -p packages/utils/tsconfig.json --noEmit
corepack yarn workspace @erp/app-auth build
corepack yarn workspace @erp/app-reference-data build
```

Run lint and descriptor validation:

```powershell
node node_modules/eslint/bin/eslint.js apps packages scripts eslint.config.mjs vitest.config.ts
docker compose config --quiet
git diff --check
```

Run backend build and tests on a host with Java 21 and Maven:

```powershell
mvn -f services/pom.xml -DskipTests package
mvn -f services/pom.xml test
```

## Verification and Troubleshooting

Expected build status:

| Area | Expected result |
| --- | --- |
| Auth app | Typecheck and Next production build pass. |
| Reference-data app | Typecheck and Next production build pass. |
| Shared packages | Direct TypeScript compile passes. |
| Backend services | Maven compile and tests pass when Java 21 and Maven are installed. |
| Compose | `docker compose config --quiet` exits 0. |
| Lint | Direct ESLint command exits 0. |

Common issues:

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `mvn` is not recognized | Maven is not installed or not on `PATH`. | Install Maven 3.9+ and verify `mvn -version`. |
| `java` is not recognized | Java 21 is not installed or not on `PATH`. | Install Java 21 and verify `java -version`. |
| Turbo `spawn EPERM` on Windows | Local shell/process policy issue with Turbo child processes. | Use the direct workspace commands above or run the quality-gate workflow on the self-hosted CI runner. |
| Next build warns about ESLint plugin | The repo uses custom flat ESLint config. | Treat as warning if direct ESLint passes. |

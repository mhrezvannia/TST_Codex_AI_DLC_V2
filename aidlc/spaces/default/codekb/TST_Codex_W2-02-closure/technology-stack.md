# Technology Stack

## Frontend and Workspace Tooling

The root `package.json` pins Yarn `4.5.3` and Turbo `2.3.3` for the workspace. Frontend applications use TypeScript `5.7.2`, Next.js `15.1.3`, React `18.3.1`, and React DOM `18.3.1`. Tests use Vitest `2.1.8`, Vite `5.4.11`, jsdom `25.0.1`, Testing Library, and `@playwright/test` `1.61.1`. ESLint `9.17.0` and `typescript-eslint` `8.19.1` provide static checks.

Package-specific manifests such as `apps/booking/package.json` and `packages/ui/package.json` confirm workspace dependency boundaries. `@erp/ui` is an ESM React peer package whose source entry point is `packages/ui/src/index.tsx`.

## Backend Stack

The backend uses Java 21 and Spring Boot 3.3.7 in a Maven multi-module reactor rooted at `services/pom.xml`. Business services follow separated domain, application, adapter, messaging, and container modules. Kafka and Schema Registry provide asynchronous integration through `services/platform-messaging/`; PostgreSQL supplies service persistence in the Compose topology; Keycloak supplies identity infrastructure.

Representative Spring Boot containers are under `services/identity-service/container`, `services/reference-data-service/container`, `services/charge-agreement-service/container`, `services/booking-service/container`, and `services/container-movement-service/container`.

## Runtime and Delivery Stack

Docker Compose is the local/on-prem acceptance runtime, with nginx as edge routing. W2-02 must invoke Compose only through `scripts/wave-a-compose.mjs`, which fixes the project name to `linercore-wave-a`; the Wave A environment uses host ports 18088/18080. `scripts/demo-guard.mjs` protects the independent `linercore-shared-platform` manager demo on port 8088.

GitHub Actions quality automation is defined in `.github/workflows/quality-gates.yml`. Root scripts in `package.json` coordinate lint, typecheck, tests, backend build/tests, contract validation, readiness, demo guarding, and Wave A lifecycle.

## Stack Constraints for Closure

No additional frontend framework, package manager, micro-frontend host, remote theme system, or UI library is required. W2-02 should close consumption and evidence gaps with the existing Next.js/React workspace and `@erp/ui`. Browser proof should use the already declared Playwright dependency and exercise the live nginx/shell/BFF/service path.

The stack assessment is tied to branch `intent/W2-02-design-system-closure` and commit `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f`; versions must be refreshed from manifests if the branch advances.

# Code Generation Plan - U01 Platform Skeleton

## Source Trace

This plan implements U01 from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `performance-design.md`, `security-design.md`, and `deployment-architecture.md`.

U01 is the Shared Platform skeleton and walking-skeleton baseline. It creates buildable structure, conventions, configuration, and tests only. It must not implement Charge, Booking, Container Movement, full reference aggregates, full authorization policy, Kafka outbox behavior, or production deployment automation.

## Implementation Steps

- [x] Step 1: Create root workspace metadata and script aliases.
  - Traceability: US-021, US-023; BR-U01-018, BR-U01-019.
  - Add root `package.json`, `turbo.json`, `tsconfig.base.json`, `.yarnrc.yml`, `.editorconfig`, `.gitignore`, and documentation stubs that establish Yarn/Turborepo/TypeScript strict conventions.
  - Add stable root scripts for `lint`, `typecheck`, `test`, `build`, backend compile/test placeholders, frontend checks, and smoke validation.

- [x] Step 2: Create backend Maven parent and shared Java conventions.
  - Traceability: US-006, US-023; BR-U01-001 through BR-U01-005.
  - Add a root backend Maven parent under `services/` with Java 21 and Spring Boot 3.3 alignment.
  - Create shared backend conventions for error envelopes, correlation ids, and health responses without domain-specific business logic.

- [x] Step 3: Create `identity-service` hexagonal module skeleton.
  - Traceability: US-001, US-023; BR-U01-001 through BR-U01-005.
  - Add the mandated modules: `domain-core`, `application-service`, `application`, `dataaccess`, `messaging`, `published-language`, and `container`.
  - Add minimal package classes/interfaces that compile and preserve inward dependency rules.

- [x] Step 4: Create `reference-data-service` hexagonal module skeleton.
  - Traceability: US-006, US-023; BR-U01-001 through BR-U01-005.
  - Add the same mandated module layout and minimal compile-safe placeholders.
  - Keep reference aggregate implementation out of U01.

- [x] Step 5: Add backend tests and dependency-rule checks for the skeleton.
  - Traceability: US-023; BR-U01-003, BR-U01-020.
  - Add unit tests for correlation id generation/error envelope behavior where applicable.
  - Add architecture/dependency tests that fail if `domain-core` imports Spring, JPA, Kafka, Jackson, Lombok, frontend packages, or adapter modules.

- [x] Step 6: Create `apps/auth` Next.js App Router shell.
  - Traceability: US-001, US-002, US-023; BR-U01-006 through BR-U01-008.
  - Add `app/`, `app/api/`, `components/`, `providers/`, `services/`, `hooks/`, `lib/`, `schemas/`, `transformers/`, `constants/`, and `proxy.ts`.
  - Add minimal accessible shell routes and BFF placeholder route handlers without full OIDC/session implementation.

- [x] Step 7: Create `apps/reference-data` Next.js App Router shell.
  - Traceability: US-006, US-023; BR-U01-006 through BR-U01-008.
  - Add the same App Router/BFF structure.
  - Add minimal accessible shell routes without full reference administration behavior.

- [x] Step 8: Create shared frontend packages.
  - Traceability: US-001, US-006, US-023; BR-U01-013 through BR-U01-018.
  - Add `packages/ui`, `packages/api-core`, `packages/auth`, `packages/transformers`, `packages/shared-types`, `packages/config`, and `packages/utils`.
  - Add strict TypeScript package metadata and placeholder public exports for approved `@erp/*` imports.

- [x] Step 9: Add frontend tests and test configuration.
  - Traceability: US-023; NFR-015.
  - Add Vitest/testing-library configuration for package and app-level tests.
  - Add basic tests for shared utilities, route shell rendering, and prohibited direct-service browser access conventions where practical.

- [x] Step 10: Create contracts and published-language folders.
  - Traceability: US-023; BR-U01-017.
  - Add `contracts/openapi`, `contracts/avro`, `contracts/examples`, and `contracts/pact` layouts.
  - Add placeholder README files explaining that concrete contracts are owned by U02, U03, U04, and U07.

- [x] Step 11: Create infrastructure baseline.
  - Traceability: US-021, US-023; BR-U01-009 through BR-U01-012.
  - Add Docker Compose baseline for PostgreSQL, Keycloak, Kafka, Schema Registry, backend service slots, frontend app slots, and Nginx.
  - Add optional observability profile placeholders for ELK, Prometheus/Grafana, and Jaeger/OpenTelemetry.
  - Add Nginx route placeholders and local environment examples with development-only values and Vault path comments for staging/production.

- [x] Step 12: Add smoke and skeleton validation scripts.
  - Traceability: US-021, US-023; BR-U01-019 through BR-U01-022.
  - Add scripts that verify the required folder layout, allowed lockfiles, no downstream runtime folders, and expected package/service discovery.
  - Add smoke placeholders for local Compose readiness without requiring later-unit business endpoints.

- [x] Step 13: Add documentation for root development workflow.
  - Traceability: US-021, US-023.
  - Add or update root README content for Yarn, Java/Maven, Docker Compose, local env files, service/app layout, and scope exclusions.

- [x] Step 14: Run baseline verification.
  - Traceability: US-023; NFR-003, NFR-004, NFR-015, NFR-017.
  - Run the available root lint, typecheck, test, build, and skeleton validation commands.
  - Record any unavailable external runtime checks as explicit deviations in `code-summary.md`.

## Test Strategy

The active workflow scope is MVP/standard. U01 therefore creates baseline unit test files per component plus integration/smoke stubs for key boundaries:

- Backend unit tests for shared skeleton utilities and architecture dependency rules.
- Frontend package/app unit tests with Vitest and testing-library.
- Skeleton validation tests/scripts for workspace layout, lockfile policy, and prohibited downstream runtime folders.
- Compose smoke stubs for local readiness that later U09 and U10 can extend.

## Approval

This plan is ready for review before application-code generation.

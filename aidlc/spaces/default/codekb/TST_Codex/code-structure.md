# Code Structure - TST_Codex

## Repository Layout

The repository is a single workspace rooted at `D:\TST_Codex`. The active AI-DLC intent has no recorded multi-repo set, so reverse engineering ran as a single-repo scan. The engine-resolved codekb path is `aidlc/spaces/default/codekb/TST_Codex/`.

Top-level structure:

| Path | Purpose |
|------|---------|
| `services/` | Java Maven backend services |
| `apps/` | Next.js frontend applications |
| `packages/` | Shared TypeScript packages |
| `contracts/` | OpenAPI, Avro, Pact fixtures, examples, catalog |
| `docs/` | Program, enterprise, and contract documents |
| `infrastructure/` | Dockerfiles, nginx, observability, env, seed data |
| `scripts/` | Local readiness, seed, smoke, quality, contract validation scripts |
| `compose.yaml` | Local Compose infrastructure and app runtime |
| `aidlc/` | AI-DLC state, artifacts, codekb, memory |
| `graphify-out/` | Graphify graph/report outputs |

## Backend Structure

Backend services are Maven modules under `services/`:

| Service | Submodules found |
|---------|------------------|
| `identity-service` | `application`, `application-service`, `container`, `dataaccess`, `domain-core`, `messaging`, `published-language` |
| `reference-data-service` | `application`, `application-service`, `container`, `dataaccess`, `domain-core`, `messaging`, `published-language` |
| `charge-agreement-service` | `application`, `application-service`, `container`, `dataaccess`, `domain-core`, `messaging`, `published-language` |

Root Maven aggregator `services/pom.xml` includes these three service modules and uses Java 21, Spring Boot 3.3.7, Maven Compiler 3.13.0, Maven Surefire 3.5.2, and JUnit Jupiter 5.11.3.

## Frontend Structure

Frontend apps:

| App | Purpose |
|-----|---------|
| `apps/auth` | Authentication-oriented app using shared auth/config/API/UI packages |
| `apps/reference-data` | Reference data workbench using React Query, Zustand, transformers, shared UI |
| `apps/charge-agreements` | Charge agreements UI with focused Vitest page test |

Shared packages:

| Package | Purpose |
|---------|---------|
| `packages/api-core` | API client/core utilities, depends on Axios |
| `packages/auth` | Shared auth primitives |
| `packages/config` | Shared configuration |
| `packages/shared-types` | Shared TypeScript types |
| `packages/transformers` | Frontend/backend DTO transformation utilities |
| `packages/ui` | Shared React UI components |
| `packages/utils` | Shared utilities |

## Code Patterns

Observed backend patterns:

- Spring Boot controllers in `container`.
- Application services in `application-service`.
- Ports/interfaces for authorization, repositories, event publication, schema registry, and subject resolution.
- In-memory data access adapters.
- Domain records/value objects in `domain-core`.
- Controller-level request/response records.

Observed frontend patterns:

- Next.js app directories.
- TypeScript strict base config.
- Shared workspace packages using path aliases.
- Vitest with jsdom and React Testing Library.
- Central ESLint config with `no-explicit-any` enforced.

## Notable Missing Structure

No directories were found for:

- `services/booking-service`
- `services/container-movement-service`
- Booking frontend application
- Container movement frontend application
- D&D-specific frontend module beyond charge agreement concepts
- Pricing service/contracts under a provider path such as `pricing-service/contracts/openapi/pricing.v1.yaml`

Enterprise contract documents exist under `docs/enterprise-contracts`, but corresponding executable service modules and provider contracts are not yet present for Booking/CMM/pricing/D&D.

## Build and Generated Artifacts

Maven `target` directories exist for all scanned service submodules, indicating prior local builds. These are generated artifacts and not source-of-truth code.

The monorepo has `node_modules`, Yarn 4 metadata, Turbo config, and Vitest/ESLint/TypeScript configuration.

## Code Structure Risks

- The repository name and package name still say `linercore-shared-platform`, which no longer matches the enterprise intent breadth.
- Compose profiles use `apps`, `seed`, and `observability`; enterprise-required `core`, `app`, `devtools`, and `full` profiles are not yet present.
- In-memory adapters are useful for MVP/demo behavior but must not be mistaken for production database ownership.
- Existing module structure is a useful template for Booking and CMM, but those services do not exist yet.

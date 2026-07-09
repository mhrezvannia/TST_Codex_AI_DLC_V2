# Components - Shared Platform Local Functionality

## Context

This component design consumes `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. It designs the Shared Platform foundation only: Auth, Identity, Reference Data, seed, contracts, local runtime, and readiness.

## Component Catalog

| Component | Path / owner | Purpose | Owns | Does not own |
| --- | --- | --- | --- | --- |
| Auth BFF | `apps/auth` | Local sign-in, callback, sign-out, safe session summary, local bypass guard. | Session cookie, OIDC transaction, safe session API, local-only bypass indicator. | Reference-data authorization rules or data mutations. |
| Auth shared package | `packages/auth` | Shared session, OIDC, access-request, and summary types. | Auth/session primitives and serialization contracts. | Service calls or UI page layout. |
| Reference Data Workbench UI | `apps/reference-data/app/page.tsx` and local components | User-facing Reference Data operations workspace. | Screen state, forms, tables, accessibility, user interactions. | Direct service/database/Kafka access. |
| Reference Data BFF | `apps/reference-data/app/api/**` | Server-side adapter from UI to Shared Platform services. | Correlation ids, session extraction, permission lookup, service HTTP calls, error mapping. | Domain validation rules or persistent state ownership. |
| Reference Data client library | `apps/reference-data/lib/*` | Typed client and view models for BFF/UI. | Request/response mapping, local UI DTOs, runtime config, tests. | In-memory runtime truth once services are wired. |
| Identity service | `services/identity-service` | Authorization decisions, effective permissions, role assignments, audit. | Role/permission catalog, authorization policy, assignment state, authorization audit. | Reference records or reference-data event publication. |
| Reference Data service | `services/reference-data-service` | Reference record lifecycle and publication state. | Reference records, validation, history, outbox, publication status APIs. | Browser session management or identity role catalog ownership. |
| Reference Data persistence adapters | `services/reference-data-service/dataaccess` | Local PostgreSQL-backed repositories for records, changes, outbox. | Durable reference state and outbox state. | Domain rules. |
| Identity persistence adapters | `services/identity-service/dataaccess` | Local PostgreSQL-backed role assignment and authorization audit repositories. | Durable assignment/audit state. | Authorization policy definitions. |
| Event publication adapter | `services/reference-data-service/messaging` | Kafka and Schema Registry integration for outbox events. | Schema registration, event publishing, broker metadata, retry classification. | Mutation transaction ownership. |
| Seed loader | `scripts/seed-local.mjs` plus BFF/service clients | Validates and applies MVP seed data through live APIs. | Seed validation, idempotency fingerprinting, apply summaries, local users/roles/reference data. | Direct database writes. |
| Contract readiness | `contracts/**`, contract scripts, app readiness surface | Verifies OpenAPI, Avro, Pact/message fixtures against running behavior. | Contract catalog and evidence. | Runtime business logic. |
| Local readiness and quality gates | `scripts/run-quality-gates.mjs`, smoke scripts, readiness UI/runbook | Prerequisite, service health, smoke, and quality evidence. | Environment and quality status. | Replacing actual service tests. |
| Compose local runtime | `compose.yaml`, `infrastructure/**`, app/service Dockerfiles or dev profiles | Local/on-prem topology. | Backing services, app/service startup, gateway, observability profile. | Production deployment approval. |

## Public Interfaces

| Component | Interface |
| --- | --- |
| Auth BFF | `GET /api/auth/session`, `GET /api/auth/sign-in`, `GET /api/auth/callback`, `POST /api/auth/sign-out`, `POST /api/auth/request-access`. |
| Reference Data BFF | `GET /api/reference-sets`, `GET/POST /api/reference-sets/{set}/records`, `GET/PUT/POST deactivate /api/reference-sets/{set}/records/{id}`, `GET /history`, `GET /events`, `POST /events/publish`, `GET /api/permissions/reference-data`. |
| identity-service | `POST /internal/identity/authorize`, `POST /internal/identity/effective-permissions`, `POST /internal/identity/roles/assign`, `GET /internal/identity/roles`. |
| reference-data-service | `GET /reference-sets`, `GET/POST /reference-sets/{set}/records`, `GET/PUT /reference-sets/{set}/records/{id}`, `POST /validate`, `GET /history`, `GET /events`, `POST /events/claims`, `POST /events/publish`. |
| Seed loader | `node scripts/seed-local.mjs --dry-run`, `--apply`, `--summary-file`, `--wait`. |
| Quality/readiness | `yarn quality:gates`, smoke scripts, health endpoints, readiness summary files. |

## Boundaries and Ownership

1. Browser code talks only to Next.js BFF routes.
2. BFF routes talk to identity-service and reference-data-service over server-side HTTP.
3. identity-service owns authorization and role assignment policy.
4. reference-data-service owns reference records, validation, history, and outbox state.
5. PostgreSQL persistence adapters are infrastructure details behind service ports.
6. Kafka and Schema Registry are event-publication adapters behind reference-data-service ports.
7. Seed apply mode calls service/admin APIs and must not write service databases directly.
8. Downstream Charge, Booking, and Container Movement modules consume contracts later; they are not implemented in this intent.

## Component Health and Required Change

| Component | Current state | Required design change |
| --- | --- | --- |
| Reference Data UI/BFF | Static local records and disabled write buttons. | Replace static runtime data with BFF service clients, permission-aware actions, mutation forms, and error/status mapping. |
| Auth BFF | Local session placeholder and local bypass support. | Complete local Keycloak flow or keep local bypass explicitly guarded while exposing safe session summary. |
| identity-service | Authorization APIs and in-memory repositories exist. | Wire BFF calls and add durable local repository adapters if required for seeded role assignments. |
| reference-data-service | Use cases and REST controller exist with in-memory adapters and placeholder publisher. | Add durable local persistence, service client wiring, error mapping, and publish/status proof. |
| Compose | Backing services exist; app/service images not buildable from discovered Dockerfiles. | Add Dockerfiles or dev compose profile plus prerequisite/readiness checks. |
| Seed loader | Validates local JSON. | Add apply mode through live service/admin APIs. |

## Review

Verdict: READY

Inline fallback review finds the component model aligned with `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. It uses the existing monorepo and service boundaries and avoids downstream module scope creep.


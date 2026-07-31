# Code Structure — TST_Codex_W2-03

## Repository Organization

| Path | Classification | Responsibility |
|---|---|---|
| `apps/` | Next.js applications | Auth, shell, Reference Data, Charge, and Booking web/BFF surfaces |
| `packages/` | Shared TypeScript packages | Auth/session, UI, API core, config, types, transformers, utilities |
| `services/` | Java/Maven services | Domain services and platform messaging |
| `contracts/` | API/event contracts | OpenAPI, AsyncAPI, Avro, examples, Pact-style fixtures, catalog |
| `infrastructure/` | Runtime topology/config | Compose, Dockerfiles, nginx, databases, Keycloak, observability, seeds |
| `scripts/` | Automation | Local runtime, contracts, quality, acceptance, audits, Wave A wrapper |
| `design-system/` | Shared and domain UI records | LinerCore master/session authority and page-specific additions |
| `docs/` | Product/process documentation | Intent backlog, slicing rules, workflow maps, business/UI analysis |
| `aidlc/` | AI-DLC records and knowledge | Intent artifacts, method memory, code knowledge base, audit shards |

## Frontend Applications

- `apps/auth`: OIDC/local-auth flows, session lifecycle, access requests, and health/BFF routes.
- `apps/shell`: authenticated frame and mounted Booking routes. It is a protected shared seam for W2-03.
- `apps/reference-data`: operational reference-set administration with React Query, Zustand, Zod, BFF authorization, and shared UI.
- `apps/booking`: list/create/detail pages and BFF routes for reference validation, pricing, confirmation, and session-derived actor propagation.
- `apps/charge-agreements`: baseline Charge page, one focused test, and health/module-info proxy. The baseline workbench is hard-coded and disabled; real Charge-owned routes/BFFs are intended W2-03 work.

Next.js applications use App Router conventions: `app/**/page.tsx` for pages, `app/api/**/route.ts` for server routes, and application-local `lib`/component code for contracts and helpers.

## Shared TypeScript Packages

| Package | Pattern and consumers |
|---|---|
| `packages/auth` | HMAC-signed session cookie, actor extraction, safe redirects, local bypass guardrails; consumed by auth, shell, and BFFs |
| `packages/ui` | Shared operational primitives and styles; W2-02-owned and protected from W2-03 redesign |
| `packages/api-core` | Axios client foundation |
| `packages/shared-types` | Shared transport/domain-facing TypeScript types |
| `packages/config` | Workspace/application configuration |
| `packages/transformers` | Cross-surface mapping utilities |
| `packages/utils` | General shared helpers |

W2-03 should prefer existing packages and add Charge-local types/components where the contract does not require a shared type. Shared package changes need ownership-compatible, additive treatment.

## Backend Module Pattern

`services/pom.xml` is the Maven reactor for:

- `platform-messaging`
- `identity-service`
- `reference-data-service`
- `charge-agreement-service`
- `booking-service`
- `container-movement-service`

Business services generally use these modules:

| Module | Role |
|---|---|
| `domain-core` | Aggregates, value objects, domain rules, domain events |
| `application-service` | Use cases, orchestration, inbound/outbound ports, queries/results |
| `dataaccess` | JDBC/in-memory repositories, codecs, schema/migrations |
| `messaging` | Outbox/event mapping, Kafka/Avro adapters |
| `container` | Spring Boot composition, controllers, HTTP clients, configuration |
| `application` / `published-language` | Additional wiring and public language used by selected services |

Dependencies should point inward: container/adapters depend on application/domain abstractions; domain code should not depend on HTTP, JDBC, or UI details.

## Charge Code Structure

The current Charge implementation is split across:

- Domain models for agreements, terms, statuses, identifiers, pricing requests/results/lines, and manual pricing.
- Application services for agreement lifecycle, active lookup, authorization/reference validation, pricing, idempotency, and manual-case recording.
- Repository ports with JDBC and in-memory implementations.
- HTTP controllers for agreement lifecycle and `/pricing-requests`.
- SQL initialization for agreements, terms, activity, manual cases, pricing request state, and outbox data.
- Messaging modules for agreement lifecycle events.
- Unit/controller/repository/schema/event tests.

Current code patterns worth retaining are immutable value objects/records, explicit ports, stable idempotency/correlation metadata, and controller-to-application mapping. Intended additions—typed tariff/rate versions, per-line applicability, immutable approved snapshots, and richer response contracts—are not baseline structures.

## Booking Pricing Code Structure

The pricing path crosses:

1. Booking UI/BFF price action.
2. Booking application `PricingPort`.
3. `ChargePricingPortAdapter` and `HttpChargePricingClient`.
4. Charge `/pricing-requests` controller/application.
5. Booking `PricingSnapshot` storage/serialization and detail rendering.

Baseline snapshot itemisation is a `Map<String,String>` using keys such as `line.1.chargeCode`, `line.1.category`, `line.1.basis`, `line.1.quantity`, `line.1.amount`, and `line.1.currencyId`. The HTTP client cannot populate all of those faithfully because the Charge response omits basis, quantity, and rate. A typed snapshot/breakdown and backward-compatible decoding are intended changes.

## Contracts, Persistence, and Runtime Files

- Canonical Charge pricing contract: `contracts/openapi/pricing.v1.yaml`.
- Legacy divergent Charge contract: `contracts/openapi/charge-agreements.yaml`.
- Event contracts: AsyncAPI/Avro under `contracts/`, backed by provider/message verification scripts.
- Charge schema: Spring SQL initialization from `charge-agreement-schema.sql`.
- Booking schema: Flyway migrations including `V1__booking_baseline.sql` and `V2__booking_w1.sql`.
- Local topology: `infrastructure/compose.yaml` and related env/Docker/nginx/seed/observability files.
- Wave A acceptance entry: `scripts/wave-a-compose.mjs`, fixed to project `linercore-wave-a` and Wave A env defaults.
- Manager-demo protection: `scripts/demo-guard.mjs` / `npm run demo:guard`.

## Tests and Verification Layout

- Java tests live under each module's `src/test/java` and use JUnit Jupiter/Spring Boot Test.
- TypeScript/React tests use Vitest and Testing Library alongside app/package code.
- Automation tests use the Node test runner for scripts, contract checks, and acceptance helpers.
- Playwright 1.61.1 is installed at the root, but no baseline Playwright config/spec exists.
- There are 81 inventoried test files; the Reverse Engineering scan did not execute them.

## Structural Constraints for W2-03

- Do not create a parallel umbrella pricing platform; extend the existing Charge and Booking seams.
- Keep Charge UI changes inside `apps/charge-agreements` and the named Charge design-system page record, except for the minimum integration mount required.
- Do not redesign `packages/ui`, shared shell/navigation, typography, or palette.
- Preserve old Booking snapshot decoding and current agreement/idempotency/manual-case behavior while evolving contracts and schemas.
- Limit graph searches to active source/config areas when possible; this repository also contains historical design and AI-DLC artifacts that can look like live code.

## Known Structure Gaps

- No distinct tariff/rate-card aggregate or rate-version module exists.
- No immutable approved-version table/API identifier exists.
- No explicit Charge CRUD/pricing BFF set or stable edge route exists.
- No typed Booking pricing-line snapshot exists.
- No W2-03-specific Playwright/live-evidence harness exists.


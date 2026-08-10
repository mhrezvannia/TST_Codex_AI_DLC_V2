## Developer Code Scan Results

### Scan Context and Freshness

- **Repository scanned**: `D:\TST_Codex_W2-03` (single-repository intent; whole brownfield workspace)
- **Git baseline observed**: `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f` (`c2f13dd`)
- **Intent state**: feature scope, Standard depth and test strategy, Brownfield, Reverse Engineering in progress
- **Scan method**: Graphify query first, then codebase-memory MCP architecture/search/snippet evidence, then current filesystem manifests, contracts, controllers, schemas, tests, CI, Compose, and acceptance scripts.
- **Graph freshness qualification**: codebase-memory reported 76,352 nodes and 86,737 edges and reflected the current Charge/Booking implementation. `graphify-out/graph.json` was last written at `2026-07-21T11:23:12Z`, about 25 minutes before the current commit timestamp, so Graphify was used as directional architecture evidence and material findings were checked against current files.
- **Execution qualification**: this was a read-only static scan. It did not build, test, start Compose, exercise port 8088, or assert runtime PASS.

### Repository Shape

The repository is a polyglot monorepo for an enterprise liner-carrier platform. It combines a Yarn 4/Turborepo workspace of Next.js applications and shared TypeScript packages with a Java 21/Spring Boot multi-module Maven backend, contract catalogs, local Compose infrastructure, observability configuration, seed data, acceptance scripts, design material, and AI-DLC records.

| Area | Purpose | Principal dependencies/seams |
|---|---|---|
| `apps/auth` | OIDC/local-auth web entry, signed session lifecycle, access/request-access pages | Keycloak, identity service, `@erp/auth`, `jose` |
| `apps/shell` | Authenticated shared application shell and mounted Booking routes | `@erp/auth`, `@erp/shared-types`, Booking BFF routes |
| `apps/reference-data` | Reference-set administration UI and BFF | identity/reference-data services, React Query, Zustand, Zod, shared UI |
| `apps/charge-agreements` | Charge domain frontend | currently a walking-skeleton workbench and module-info proxy only |
| `apps/booking` | Booking list/create/detail, reference validation, pricing and confirmation BFF/UI | booking service, signed session actor propagation |
| `packages/auth` | Shared session, signed-cookie, authorization and actor helpers | Node crypto; consumed by auth, shell and BFFs |
| `packages/ui` | Shared UI primitives/styles owned outside W2-03 | React; must remain protected for this intent |
| `packages/api-core` | Shared Axios API core | Axios 1.7.9 |
| `packages/config` | Shared frontend configuration | TypeScript workspace package |
| `packages/shared-types` | Shared frontend contract types | TypeScript workspace package |
| `packages/transformers` | Shared data transformations | TypeScript workspace package |
| `packages/utils` | Shared utilities | TypeScript workspace package |
| `services/identity-service` | Subject/role/permission authorization and Keycloak integration | Spring web/actuator; identity policy domain |
| `services/reference-data-service` | Versioned carrier reference records, validation, history and outbox events | PostgreSQL, Spring JDBC, Kafka/Avro |
| `services/charge-agreement-service` | Agreement lifecycle, terms, active lookup, pricing, manual cases and outbox | PostgreSQL, Spring JDBC, Booking HTTP consumer seam, Kafka/Avro |
| `services/booking-service` | Booking aggregate lifecycle, validation, pricing snapshots, events and movement projection | PostgreSQL/Flyway, identity/reference/Charge HTTP clients, Kafka/Avro |
| `services/container-movement-service` | Container journey/movement state and Booking integration | PostgreSQL, reference data, Kafka/Avro |
| `services/platform-messaging` | Shared Kafka/Avro/Schema Registry support | Spring Kafka, Avro, Confluent serializers |
| `contracts` | OpenAPI, AsyncAPI, Avro, examples, Pact-style fixtures and catalog | provider verification and catalog validation scripts |
| `infrastructure` | Compose Dockerfiles, databases, Keycloak realm, nginx, observability, seeds | PostgreSQL, Keycloak, Kafka, Schema Registry, nginx, Prometheus/Grafana/Jaeger/OTel/Elastic/Kibana |
| `scripts` | local runtime, seeding, contract checks, quality aggregation and Wave acceptance | Node scripts driving Maven, Yarn, Docker Compose and audit detectors |

### Packages Found

#### Frontend applications

- `@erp/app-auth` — Next.js 15 app — TypeScript/React — OIDC callback/sign-in/sign-out/session and access-denied flows.
- `@erp/app-shell` — Next.js 15 app — TypeScript/React — authenticated shared shell and mounted Booking surface.
- `@erp/app-reference-data` — Next.js 15 app — TypeScript/React — reference-data administration and BFF routes.
- `@erp/app-charge-agreements` — Next.js 15 app — TypeScript/React — Charge Agreement module; baseline is a hard-coded, disabled walking skeleton.
- `@erp/app-booking` — Next.js 15 app — TypeScript/React — Booking list, create and detail flows with validate/price/confirm actions.

#### Shared frontend packages

- `@erp/auth` — TypeScript — session cookies, actor extraction, local-bypass guardrails and authorization helpers.
- `@erp/api-core` — TypeScript — Axios-based API client foundation.
- `@erp/ui` — TypeScript/React — shared primitives and interaction components.
- `@erp/config`, `@erp/shared-types`, `@erp/transformers`, `@erp/utils` — TypeScript — configuration, types, mapping and utilities.

#### Backend service modules

- Maven reactor `services/pom.xml` contains `platform-messaging`, `identity-service`, `reference-data-service`, `charge-agreement-service`, `booking-service`, and `container-movement-service`.
- Domain services follow a ports-and-adapters/module pattern. Common module names are `domain-core`, `application-service`, `dataaccess`, `messaging`, and `container`; identity, reference data and Charge also include `application` and `published-language` modules.
- `container` composes Spring Boot runtime adapters; `application-service` owns use cases/ports; `domain-core` owns aggregate rules; `dataaccess` owns JDBC repositories/codecs/schemas; `messaging` owns Kafka/Avro mapping and publication.

### Build System

- **Frontend type**: Yarn workspaces 4.5.3 (`nodeLinker: node-modules`) orchestrated by Turborepo 2.3.3.
- **Backend type**: Maven reactor with Java 21 and Spring Boot dependency management.
- **Config files**: `package.json`, `yarn.lock`, `.yarnrc.yml`, `turbo.json`, `tsconfig.base.json`, workspace `package.json`/`tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, and `services/**/pom.xml`.
- **Root frontend commands**: `build`, `lint`, `typecheck`, `test`; targeted workspace commands are also defined per app/package.
- **Root backend commands**: `mvn -f services/pom.xml -DskipTests package` and `mvn -f services/pom.xml test`.
- **Runtime commands**: local prerequisite/runtime/seed/readiness scripts; contract validation/provider verification; `quality:gates`; W1 and W2-01 evidence scripts; `demo:guard`; and `wave-a:*` wrappers.
- **Wave A wrapper**: `scripts/wave-a-compose.mjs` always uses `infrastructure/env/wave-a.env.example`, Compose project `linercore-wave-a`, and profile `app` by default. This is the correct isolated acceptance seam for W2-03.
- **Build dependencies**:
  - Frontend apps depend on workspace packages through `workspace:*`; Next.js apps build independently but are combined by nginx/shell at runtime.
  - Backend container modules depend inward on application/dataaccess/messaging modules.
  - Booking application depends on Booking domain; Booking container composes JDBC, Flyway, identity/reference/Charge clients, and messaging.
  - Charge application depends on Charge domain; Charge container composes JDBC persistence, messaging and HTTP controllers.
  - Messaging modules depend on `platform-messaging`, Spring Kafka, Avro and Confluent serialization.

### Frameworks & Libraries

| Technology | Version observed | Purpose |
|---|---:|---|
| Java | 21 | Backend language/runtime |
| Spring Boot | 3.3.7 | Service runtime and managed dependencies |
| Maven Compiler Plugin | 3.13.0 | Java compilation |
| Maven Surefire | 3.5.2 | Backend test execution |
| JUnit Jupiter | 5.11.3 | Java unit/integration tests |
| Flyway | 10.10.0 | Booking database migrations |
| PostgreSQL image | 15 | Local durable stores |
| Node image | 24-alpine | seed/contract devtools containers |
| Yarn | 4.5.3 | Frontend package manager |
| Turborepo | 2.3.3 | Workspace task orchestration |
| TypeScript | 5.7.2 | Frontend/shared package language |
| Next.js | 15.1.3 | Application framework |
| React / React DOM | 18.3.1 | UI runtime |
| Vitest | 2.1.8 | TypeScript tests |
| Playwright | 1.61.1 | Browser evidence capability (root dev dependency) |
| ESLint | 9.17.0 | TypeScript linting |
| Zod | 3.24.1 | BFF/UI payload validation |
| TanStack React Query | 5.62.7 | Reference Data client state |
| Zustand | 5.0.2 | Reference Data local state |
| Axios | 1.7.9 | Shared API client |
| Kafka/Schema Registry | Confluent 7.7.1 | Local event transport/schema registry |
| Apache Avro | 1.11.4 | Event serialization |
| Keycloak | 24.0 | Local OIDC/identity provider |
| nginx | 1.27 | Edge routing on port 8088 |
| Prometheus / Grafana | 2.55.1 / 11.4.0 | Metrics/visualization |
| Jaeger / OTel Collector | 1.63.0 / 0.114.0 | Tracing/telemetry |
| Elasticsearch / Kibana | 8.16.1 / 8.16.1 | Local logs/search UI |

### APIs Discovered

#### Charge Agreement and pricing service

- **Agreement HTTP API** — `ChargeAgreementApiController`:
  - `GET /api/charge-agreements`
  - `POST /api/charge-agreements`
  - `GET /api/charge-agreements/{id}`
  - `PUT /api/charge-agreements/{id}`
  - `POST /api/charge-agreements/{id}/approve`
  - `POST /api/charge-agreements/{id}/suspend`
  - `POST /api/charge-agreements/{id}/expire`
  - `GET /api/charge-agreements/active-lookup`
  - `GET /api/charge-agreements/module-info`
- **Pricing HTTP API** — `POST /pricing-requests`, media type `application/vnd.api.v1+json`; requires `Idempotency-Key` and `X-Correlation-Id`, accepts Booking actor identity.
- **Pricing request input** already carries booking reference, trade lane, POL, POD, equipment, party/customer, commodity, reefer/DG flags, dates, equipment quantity, TEU and amendment sequence.
- **Pricing output** currently returns `bookingRef`, `pricingBasis`, `pricingRef`, and charge entries containing only charge code, category, amount and currency. The richer internal `PricingLine` also has term id, basis, quantity and rate, but those fields are not exposed by `PricingApiController`.
- **No-rate behavior**: application logic records a manual-pricing case and returns `NO_RATE`; controller maps it to HTTP 404. Ambiguity/no-applicable-term outcomes map to manual pricing and HTTP 422.
- **Agreement lifecycle**: create/update/replace-terms are Draft-only; approve requires at least one term; Approved can be suspended/expired. A numeric version increments on mutation, and post-approval edits are prevented.
- **Important versioning qualification**: persistence stores the latest agreement snapshot in one `charge_agreements` row plus activity/terms. There is no full immutable agreement-version history table. The baseline therefore has optimistic/lifecycle version numbers and approved immutability, not separately addressable immutable approved versions.

#### Booking service

- **Booking HTTP API** — `BookingApiController` under `/api/bookings`:
  - create/draft, detail, recent list/search
  - validate references
  - price
  - store pricing snapshot
  - confirm
  - amend and reconfirm
- `POST /api/bookings/{id}/price` calls the Charge pricing client through `PricingPort`/`ChargePricingPortAdapter`.
- `HttpChargePricingClient` calls `POST {chargeBaseUrl}/pricing-requests` and propagates idempotency/correlation/actor headers.
- Booking creates a stable SHA-256-derived pricing request id from booking id/revision/customer/origin/destination/equipment/idempotency material.
- Successful Charge lines are flattened into `PricingSnapshot.quotedAmounts` keys such as `line.1.chargeCode`, `line.1.category`, `line.1.basis`, `line.1.quantity`, `line.1.amount`, and `line.1.currencyId`.
- **Information-loss seam**: the HTTP client currently receives no basis/quantity/rate, forces quantity to `1`, leaves basis blank, and has no rate field in its `ChargePricingLineItem`. Booking therefore does not yet preserve the real internal itemisation faithfully.
- Manual Charge outcomes map to `PricingRequestResult.manual`, Booking status `MANUAL_PRICING`, and a Booking exception. The current vocabulary is `MANUAL_PRICING`/manual result rather than the requested explicit `MANUAL_PRICING_REQUIRED` code at all layers.
- Booking detail serializes the pricing snapshot and the UI renders the generic quoted-amount map. It shows “Manual pricing required” for `MANUAL_PRICING`, but does not yet render a typed Charge breakdown.
- Amend/reconfirm routes exist, and amendment sequence/revision participates in the pricing request/idempotency model; there is no dedicated `reprice` endpoint in the baseline.

#### Other internal APIs

- **Reference Data**: list reference sets/records, detail, create/update, deactivate/reactivate, validate, history, events/claims/publish. Booking and Charge use reference identities; reference events cover party/customer, location, region, voyage, currency, charge code, equipment type, commodity and trade lane.
- **Identity**: authorize, assign roles, effective permissions and list roles under `/internal/identity`; authentication is supplied by Keycloak and shared signed-session helpers.
- **Container Movement**: list/create/detail journeys, lookup by Booking, and capture movements under `/api/container-movement`.
- **Frontend BFFs**: auth/session routes; Booking list/detail/validate/price/confirm/reference-options; Reference Data record/history/permission routes. Charge exposes only health and module-info BFF routes in the baseline.

#### Contract surfaces

- Catalog version `0.2.0` labels its registered contracts `candidate_executable` and compatible.
- OpenAPI: reference data, identity, Charge agreement legacy surface, and canonical `pricing.v1.yaml` (`/pricing-requests`).
- AsyncAPI/Avro: reference-data changes, Booking confirmed, container-movement status, and Charge agreement lifecycle events.
- Pact-style fixtures: Booking↔Charge pricing and D&D, reference-data provider/message, identity provider, Booking confirmed and movement status.
- **Contract drift signal**: `contracts/openapi/charge-agreements.yaml` still advertises `/api/pricing/quote` and `/api/pricing/dnd`, while the catalog’s canonical Charge pricing contract and implementation use `/pricing-requests`. Both files can be mistaken for the authority unless ownership/deprecation is made explicit.
- **D&D signal**: a D&D contract/fixture exists, but Booking’s local container explicitly throws that D&D pricing is not implemented.

### Persistence and Messaging

- Each primary business service has a dedicated PostgreSQL database in Compose: identity, reference data, pricing/Charge, Booking and container movement.
- Charge JDBC persistence includes agreements, terms, activity, manual pricing cases, pricing-request idempotency/lease state and a lifecycle-event outbox. Charge schema is applied via Spring SQL initialization from `charge-agreement-schema.sql`, not Flyway.
- Booking uses Flyway (`V1__booking_baseline.sql`, `V2__booking_w1.sql`) plus JDBC repositories/codecs. The aggregate snapshot contains pricing, validation, lifecycle and exception state.
- Booking pricing snapshots are currently schemaless `Map<String,String>` data within the aggregate snapshot, which keeps backward compatibility but weakens type safety and makes itemised evolution fragile.
- Outbox/publisher machinery exists for Booking, Charge, reference data and movement messaging. Kafka topics initialized by Compose are `booking.events`, `containermovement.status`, `referencedata.events`, and `charge-agreement.events`.
- Charge, Booking and container-movement `OutboxRepository` interfaces still contain default methods throwing “outbox claiming/lifecycle persistence is not implemented”; concrete JDBC repositories may implement the required runtime paths, but the defaults are a latent misconfiguration risk.

### Shared Shell, Auth and Reference-Data Seams

- Shared session helpers use an HMAC-signed `lc_session` cookie, expiration checks, safe return URLs, redaction and actor extraction. Local bypass is restricted to non-production profiles.
- Booking BFFs require a signed-in session, derive the actor server-side, enforce same-origin JSON commands, cap bodies at 32 KiB, require idempotency keys and propagate service/correlation headers.
- The shell owns the authenticated frame and Booking-mounted routes. W2-03 must add Charge pages without changing shell/nav/token ownership.
- The Charge app currently does not consume shared auth/session helpers in its page flow and has no CRUD/pricing BFF routes; only module-info/health are proxied.
- Reference Data already supplies controlled master data and history; Charge’s current application service also uses authorization/reference validation ports. W2-03 should extend these seams rather than introduce local free-text authorities.

### Compose and Wave A Acceptance Seams

- `compose.yaml` defines the complete local topology and profiles `core`, `app`, `devtools`, `observability`, and `full`.
- The intended W2-03 acceptance path is `scripts/wave-a-compose.mjs`, project `linercore-wave-a`, default `app` profile, with environment values from `infrastructure/env/wave-a.env.example`.
- Edge port 8088 is nginx (`NGINX_HOST_PORT`, default 8088). Manager-demo protection is separately enforced by `scripts/demo-guard.mjs`, whose default project is `linercore-shared-platform` and image tag is locked.
- `demo:guard` expects the complete manager stack and probes `/health`, `/booking`, `/reference-data`, and `/charge-agreements` without mutating it.
- **Edge routing gap**: nginx has explicit `/auth`, `/reference-data`, `/bookings` and `/booking` locations but no explicit `/charge-agreements` location. Catch-all goes to `apps-shell`, which has no Charge route. Compose starts `apps-charge-agreements` but does not publish a host port. A stable Charge edge route must be resolved without disturbing the manager demo.
- Existing live acceptance scripts package evidence and run contract, readiness, audit and ERP-fidelity checks. W2-03-specific live pricing and Playwright evidence do not yet exist in the baseline.
- The current environment’s earlier Docker subprocess checks were blocked by sandbox `EPERM`; no static observation here is a replacement for live Compose proof.

### Test Coverage

- **Test files found**: 81 total across Java, TypeScript/React and Node script tests.
- **Backend tests**: Booking 14, Charge 7, reference data 9, identity 5, container movement 5, platform messaging 1.
- **Frontend tests**: auth 5, Booking 5, Charge 1, reference data 4, shell 9; shared packages also have focused tests.
- **Script tests**: readiness, replay/restart, quality aggregation, seeds, contract validation/provider verification, W1/W2-01 acceptance/performance, and observability smoke tests.
- **Test frameworks**: JUnit Jupiter/Spring Boot Test, Vitest, Testing Library, Node test runner, and Playwright dependency.
- **Charge tests already prove**: agreement lifecycle rules, itemised application pricing, manual no-rate case recording, schema shape, JDBC/in-memory behavior, controller basics and lifecycle-event serialization.
- **Booking tests already prove**: pricing adapter success/manual/transient/denied mapping, stable request id/hash, Booking-visible manual state, aggregate lifecycle, JDBC codec/migrations, controller mapping, local auth/reference integration and messaging.
- **Coverage configuration**: absent. No JaCoCo, Istanbul/NYC, Sonar or committed coverage thresholds were found; Turborepo declares `coverage/**` as an output but no producer/config was found.
- **Playwright state**: dependency is present, but no Playwright config/spec was found in the baseline. W2-03 needs new browser evidence rather than relying on unit-render tests.
- **Execution status**: tests were inventoried, not run during this scan.

### Code Quality Indicators

- **Linting**: ESLint 9 with root `eslint.config.mjs`; workspace lint scripts exist. Java has compiler and Surefire configuration but no dedicated Checkstyle/SpotBugs/PMD gate found.
- **Type checking**: workspace `tsc --noEmit` commands and Turborepo dependency ordering.
- **CI/CD**: `.github/workflows/quality-gates.yml` runs on `main` and `integ/main-reconciled` using a self-hosted on-prem Linux runner. It installs Java/Yarn dependencies, runs backend and selected frontend/script checks, validates Compose, creates acceptance evidence, runs AI-DLC/ERP-fidelity detectors, and uploads artifacts.
- **Quality aggregator**: `scripts/run-quality-gates.mjs --all` includes backend tests, contracts, seeds, W2-01 evidence, shared auth/types, auth, reference data, Booking, shell, and Charge tests/typecheck.
- **Charge quality gap**: the aggregator includes Charge test and typecheck but not Charge lint or build. The direct GitHub workflow also does not explicitly run the Charge workspace; it relies on the aggregator for its two checks.
- **Contracts**: deterministic catalog validation and provider verification scripts exist; compatibility is recorded in a catalog with ownership/seam metadata.
- **Documentation**: repository README is brief, but `docs/`, `design-system/`, contracts READMEs, intent records and prior acceptance artifacts provide substantial domain/process documentation. No ADR was detected by codebase-memory.
- **Observability**: actuator health endpoints and Compose Prometheus/Grafana/Jaeger/OTel/Elastic/Kibana services exist; live quality of telemetry was not evaluated here.
- **Architecture quality**: backend boundaries are generally clean and domain/application/dataaccess/container modules are explicit. The code graph’s largest cross-service seams align with reference data, Booking, Charge and container movement.

### Technical Debt Signals

#### W2-03-critical

1. **Charge frontend is non-functional skeleton** — hard-coded agreement, fake itemised total, inline colors/styles, disabled create/edit/approve/lookup buttons, module-info-only fetch, and copy claiming CRUD is future work.
2. **No Charge edge mount** — nginx does not route `/charge-agreements` to `apps-charge-agreements` despite Compose and demo guard expecting that path.
3. **Agreement version history is incomplete** — numeric version and immutable Approved state exist, but only the latest agreement snapshot is persisted; no immutable approved-version records or version-specific API identifiers exist.
4. **Tariff model is agreement-term-only** — `ChargeTerm` has category/basis/rate/validity, but there is no distinct tariff/surcharge/local-charge aggregate, rate-card version, equipment applicability, or explicit origin-only local-charge matching model.
5. **Applicability is too coarse** — agreement selection uses customer, trade lane, commodity, validity and a POL/POD specificity helper; term filtering checks only validity. Equipment, POL/POD and local-charge applicability are not represented on individual terms.
6. **Pricing API drops itemisation detail** — internal lines contain basis, quantity and rate; HTTP lines expose only code/category/amount/currency.
7. **Booking stores an untyped flattened map** — line items are encoded into string keys; rate is absent, basis is blank and quantity is forced to one by the HTTP client.
8. **Manual state vocabulary mismatch** — service error `NO_RATE` becomes Booking `MANUAL_PRICING`; requested `MANUAL_PRICING_REQUIRED` is not an explicit end-to-end result/code yet.
9. **Repricing is implicit** — amendment/reconfirm and revision-aware request hashing exist, but no explicit reprice operation/UI/evidence path is present.
10. **Charge BFF/auth/reference seams are missing** — frontend lacks real agreement/rate endpoints, typed client, session-derived actor propagation and reference-option consumption.
11. **UI tests are minimal** — one Charge test asserts skeleton text and disabled action; no accessibility/responsive/browser evidence.
12. **No W2-03 live proof harness** — baseline scripts stop at W2-01/W1 acceptance and generic quality gates.

#### Cross-cutting

- `HttpChargePricingClient` uses `LocalDate.now()` rather than an injected/request-carried business date, making deterministic pricing and voyage-date repricing vulnerable to clock drift.
- Pricing request defaults `tradeLaneId` to `NA-EU` and commodity to `commodity-general` when Booking attributes are absent, which can silently choose a rate authority.
- Charge uses SQL init while Booking uses versioned Flyway migrations, creating inconsistent migration/upgrade behavior.
- Legacy/canonical Charge OpenAPI files advertise different pricing paths; D&D contracts exist while local D&D implementation throws.
- Several outbox interface defaults throw unsupported-operation exceptions, so incomplete adapters fail only at runtime.
- No quantitative coverage gate, Java static-analysis gate, or ADR store was found.
- Quality automation omits Charge lint/build even though W2-03 will make it production-significant.
- Compose contains local default credentials/tokens appropriate for isolated local use; profile separation and production secret resolution must remain enforced.
- Nginx routing, shell mounting, and separate domain-app routing have overlapping patterns (`/booking` and `/bookings`), increasing regression risk for a new stable Charge route.
- The repository contains historical artifacts and AI-DLC records alongside source; graph searches can surface stale design artifacts unless constrained to `apps/`, `services/`, `packages/`, `contracts/`, and `infrastructure/`.

### W2-03 Change Surface and Preservation Boundaries

The narrowest coherent implementation surface is:

- Extend Charge domain/application/persistence/API with typed tariff/rate versions and per-line applicability while retaining current agreement lifecycle, idempotency, manual-case and outbox behavior.
- Preserve approved versions as immutable pricing authorities and expose a typed itemised response including charge code/category, basis, quantity, rate, amount and currency.
- Extend Booking’s existing Charge client/adapter/snapshot serialization and detail page to retain and render the typed breakdown; provide explicit revision-aware repricing and `MANUAL_PRICING_REQUIRED` mapping.
- Replace only the Charge domain frontend skeleton with real Charge-owned list/detail/editor/approval/rate pages and BFF routes. Reuse shared auth, shell and `packages/ui`; do not redesign or take ownership of them.
- Add a stable nginx/shell integration route only to the extent required to mount the Charge module, with regression tests protecting auth, Reference Data and Booking routes.
- Add Charge-specific unit/contract/integration/Playwright/live acceptance evidence and include Charge lint/build in quality gates.
- Use `scripts/wave-a-compose.mjs` and project `linercore-wave-a` for acceptance; run manager `demo:guard` before and after without rebuilding/restarting/mutating the protected demo project.
- Preserve existing W0/W1/W2-01/W2-02 behavior and evidence wording; a historical waiver/block is not a real PASS.

### Open Questions for Architect Synthesis

- Should immutable approved versions use a separate `agreement_version`/`rate_version` table or append-only snapshot table while retaining current agreement identifiers?
- Which existing OpenAPI file is to be deprecated versus extended so `pricing.v1.yaml` remains the single Booking seam?
- Can the shared shell mount a separately served Charge app through nginx alone, or is a minimal shell route/proxy adapter required under W2-02 ownership constraints?
- What is the canonical business date for pricing/repricing: requested departure, agreement effective date, current date, or an explicitly selected pricing date?
- Which reference-data identifiers are authoritative for tariff lane, origin/destination, equipment type and charge code, and how should local-charge origin-only matching be encoded?
- Is `MANUAL_PRICING_REQUIRED` an API error code, a successful result state, a Booking status, or all three with an explicit translation contract?


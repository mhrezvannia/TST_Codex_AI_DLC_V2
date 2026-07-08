# Enterprise Technical Environment Document — LinerCore

> **Platform:** LinerCore — commercial and equipment-lifecycle platform for container liner / feeder carriers.
> **Document type:** Enterprise Technical Environment Document (the platform-level technical baseline every module inherits).
> **Counterpart to:** the [Program Vision Document](./program-vision-document.md). Where the Program Vision declares *what* the platform is and how its modules connect, this document fixes *how* every module must be built.
> **Methodology:** AI-DLC (`awslabs/aidlc-workflows`). AI-DLC runs **per module**; this baseline applies to every run. Tooling note: the engineering team executes generation via AWS Kiro — wherever this document says "AI-DLC Code Generation," that is the stage Kiro performs.
> **Status:** Standards **v1.1** (greenfield; frontend-standard reconciliation — see §11 version history).

---

## How to Read This Document

Every standard below carries one of four classifications. Each module's Technical Environment Document opens with a **Conformance to Enterprise Technical Standards** table (see the addendum template) stating, per standard, whether it **inherits** or **deviates**.

| Classification | Meaning | Can a module deviate? |
|----------------|---------|------------------------|
| **Mandated** | Non-negotiable. Required for security, compliance, or interoperability. | Only via an approved, time-boxed waiver. |
| **Default (Paved Road)** | Supported, recommended choice; tooling and templates assume it. | Yes, with documented rationale in the module tech-env. |
| **Permitted** | Allowed where justified; not the default. | N/A — already a choice; use requires stated rationale. |
| **Prohibited** | Must not be used. | No. |

Default behaviour is **inherit**. A module writes a conformance row only when it deviates or must pin down a choice this document leaves open.

---

## 1. Enterprise Technical Summary

- **Platform Name**: LinerCore
- **Context**: Greenfield (built new; no legacy platform to converge)
- **Primary Runtime Environment**: On-Premises
- **Cloud Provider(s)**: None — on-premises data centre(s); no public cloud
- **Default Deployment Model**: Containers — **microservices, one deployable per bounded context**, run with **Docker** and orchestrated via **Docker Compose** on the on-premises hosts (confirmed)
- **Number of Modules (current / planned)**: 4 program lanes / 4. The **Shared Platform** lane is physically realised as **two services** (`reference-data-service`, `identity-service`) plus the **Apache Kafka event bus**; the other three lanes are one service each.
- **Standards Owner**: Platform / Architecture team *(named contact TBD)*
- **Standards Version**: v1.1 (versioned; see §11 Governance)

### Deployment Topology Decision (resolves the Program Vision §5 deferral)

The Program Vision deliberately deferred the modular-monolith-vs-microservices choice to this document. **Decision: microservices** — each bounded context is an independently deployable service with its own datastore, integrating only through published contracts. This matches the team's distributed-systems strength and enables the contract-freeze parallel-construction lanes in the Program Execution Plan.

The §5 Context Map already names **Container Movement Management** as the cleanest extraction candidate (events-only, plus a DCSA Open Host Service); under a microservices topology it is simply the most independent service and lowest-coordination lane.

### Service Inventory

| Program Lane | Service (deployable) | Subdomain | Build stance |
|--------------|----------------------|-----------|--------------|
| Charge & Customer Agreement | `pricing-service` | Core | Model carefully — charges are money and dispute evidence |
| Customer Booking | `booking-service` | Core (orchestration) | Build the orchestration; keep capture mechanics plain |
| Container Movement Management | `container-service` | Supporting (critical) | Clean model; conform to DCSA / EDI |
| Shared Platform | `reference-data-service` | Supporting | Minimal; exactly one owner per canonical entity |
| Shared Platform | `identity-service` | Generic | Authorization service (carrier role model); authentication is delegated to Keycloak 24 — do not hand-model identity |
| Shared Platform | *Apache Kafka (event bus)* | Infrastructure | Not a service — the shared async transport (self-managed on-prem) |

---

## 2. On-Premises Foundation and Environment Baseline — *enterprise-only*

The platform runs entirely in the organisation's **own data centre(s)** — there is no public cloud and no cloud landing zone. This section fixes the shared on-premises substrate every service deploys into; services do not redefine it.

### Hosting and Isolation
- **Hosting**: on-premises data centre(s); all compute, storage, and messaging are self-managed.
- **Environment isolation**: separate **dev / staging / prod** environments, isolated at the host, Docker network, and Compose-project level (not by cloud accounts).
- **Container platform**: **Docker**, orchestrated with **Docker Compose** across the on-premises hosts (confirmed). Compose is the convention for both local development and on-prem environments, consistent with the reference implementation's `infrastructure/docker-compose` layout.

### Sites, DR, and Residency
- **Primary site / DR site**: **TBD** — left open, coupled to the deferred *trade/regulatory footprint* Open Question in Program Vision §10. On-premises hosting makes data residency a function of physical site location; the DR strategy (active/passive site, backup/restore targets) is fixed once the footprint is decided.

### Environments

| Environment | Purpose | Promotion Rule |
|-------------|---------|----------------|
| dev | Per-service development | — |
| staging | Integration + cross-module / contract testing | All module + contract tests pass |
| prod | Live | Staging sign-off + change approval |

### Network Baseline
- **Topology**: per-service isolation within segmented internal networks; no service reaches into another's datastore.
- **Cross-service connectivity**: synchronous calls over the internal network; asynchronous over the Kafka event bus. Service-to-service auth via the identity service (§7).
- **Reverse proxy / edge (Nginx)**: **Nginx** is the platform edge — it fronts all public / customer-facing REST, terminates TLS, and applies WAF/rate-limiting rules; no service is exposed directly. Browser traffic terminates at the frontend **BFF** behind Nginx, never directly at backend services (§7).

---

## 3. Enterprise Language and Framework Standards

Modules **select within** these lists; they do not expand them without approval (§11).

### Backend Languages

| Language | Classification | Purpose / Conditions |
|----------|----------------|----------------------|
| Java | **Mandated** for service code | **Java 21 (LTS) target; Java 17 floor.** No language features below 17. Records, sealed types, pattern matching encouraged for domain modelling |
| SQL (PostgreSQL dialect 15+) | Mandated where relational | Schema, migrations |
| Avro IDL / `.avsc` (Avro 1.11.x) | Mandated for inter-service messages | Schema-Registry-governed contracts |
| Groovy / Kotlin | Permitted (test-only, tech-lead approval) | Test DSLs only — never in production domain code |
| Shell | Permitted | Local dev/ops scripts only |
| Any non-Java JVM language in the domain core | **Prohibited** | The domain core stays uniform and framework-free |

### Frontend Languages

| Language | Classification | Purpose |
|----------|----------------|---------|
| TypeScript (**strict mode**) | **Mandated** | All frontend code |
| Plain JavaScript for new app code | **Prohibited** | TypeScript strict only |

### Backend Frameworks

| Framework | Version | Classification | Domain |
|-----------|---------|----------------|--------|
| Spring Boot | 3.3.x (target; reference is 2.6.7 — migrate `javax.*` → `jakarta.*`) | **Mandated** baseline | Bootstrap, DI, web, data, scheduling |
| Spring Data JPA + Hibernate | Boot BOM | Mandated (adapter only) | Persistence — `*-dataaccess` only, never the domain |
| Spring for Apache Kafka | Boot BOM | Mandated (adapter only) | `*-messaging` only |
| Apache Avro | 1.11.x | Mandated | Schema-generated message models |
| Confluent Kafka Avro Serializer | aligned to broker (7.x) | Mandated | Avro (de)serialization against Schema Registry |
| Lombok | provided scope | Default | Boilerplate in **adapters/DTOs only** — never in pure domain entities |
| JUnit 5 + Mockito | Boot BOM | Mandated | Unit & integration testing |
| Jackson | Boot starter | Default | JSON for outbox payloads, REST DTOs |
| Testcontainers | — | Default | Real Postgres/Kafka in adapter integration tests |
| MapStruct | — | Permitted | Compile-time mapping; keep mappers in adapter modules |

### Frontend Frameworks

| Framework | Classification | Notes |
|-----------|----------------|-------|
| Next.js (latest stable) | **Mandated** | App framework + BFF layer |
| React (latest stable) | **Mandated** | UI |
| Turborepo | **Mandated** | Monorepo orchestration |
| Yarn (Workspaces) | **Mandated** package manager | Commit `yarn.lock` only |
| npm / pnpm | **Prohibited** | Never commit `package-lock.json` |

### Frontend Approved Libraries

| Concern | Library | Classification |
|---------|---------|----------------|
| HTTP | Axios (+ interceptors, via `api-core`) | Mandated |
| Forms | React Hook Form + Zod | Mandated |
| Global state | Zustand | Mandated |
| Server state | TanStack Query | Mandated |
| Styling | Tailwind CSS + clsx | Mandated |
| Icons | Lucide React | Default |
| Dates | date-fns | Default |
| Testing | Jest + React Testing Library + Playwright | Mandated |

### Prohibited Frontend Libraries

Redux Toolkit, SWR, CSS Modules, Styled Components, Emotion, jQuery, Moment.js — **Prohibited** (architecture/design inconsistency, bundle size, duplicate patterns).

### Dependency and License Policy (Mandated)
- **Allowed licenses**: MIT, Apache 2.0, BSD. **Prohibited**: GPL, AGPL (production).
- **Dependency scanning**: Dependabot / Snyk on every PR (backend and frontend).
- **Vulnerability SLA**: criticals patched within a fixed platform SLA.

### Adding to the Lists
Submit a tech-review note to the Standards Owner: justification, license check, maintenance status. Anything touching the **backend domain core** or introducing a **new frontend library** requires explicit approval (the core is intentionally minimal; the frontend stack is intentionally fixed).

---

## 4. Shared Platform Services and Paved Road

Provided **once**, consumed by all modules. Modules integrate; they do not rebuild these.

### Backend shared services

| Service | Provided By | Technology | How Modules Consume It | Classification |
|---------|-------------|------------|------------------------|----------------|
| Identity & Access | `identity-service` | Keycloak 24 (OIDC) | OIDC tokens; Conformist token validation at each service edge | Mandated |
| Reference Data | `reference-data-service` | Open Host Service (REST) + reference-changed events | Hold references (codes) + local replica synced via events | Mandated |
| Event Bus | Platform (self-managed Apache Kafka) | Kafka + Confluent Schema Registry | Publish/subscribe of Avro Published-Language messages via the outbox | Mandated |
| Secrets | Platform | HashiCorp Vault (self-hosted) | Per-service least-privilege access | Default |
| Shared infrastructure modules | Platform | Maven `infrastructure/*`, `common/common-domain` | Reused by every backend service (saga, outbox, kafka-config/model/producer, Shared Kernel) | Mandated |

### Frontend shared packages (the FE paved road)

Shared, reusable code lives only in `packages/` — never in `apps/`.

| Package | Purpose | Classification |
|---------|---------|----------------|
| `@erp/ui` | Atomic-design component library (atoms → templates → skeletons) | Mandated |
| `@erp/api-core` | Centralized Axios client, interceptors, request/response objects, error handling | Mandated |
| `@erp/transformers` | Mandatory request/response transformers | Mandated |
| `@erp/auth` | Session handling | Mandated |
| `@erp/shared-types` | Global types (`GenericApiResponse`, `ApiError`, `Pagination`, `Nullable<T>`, …) | Mandated |
| `@erp/utils`, `@erp/config` | Shared utilities and config | Default |

---

## 5. Cross-Module Integration Standards — *the technical core*

The technical realisation of the contracts named in Program Vision §5. These are almost all **Mandated** — they are the contract surface between independently built services.

### Communication styles

| Style | When | Standard |
|-------|------|----------|
| Synchronous (request/response) | Only where strong consistency is required — **Booking → Pricing** | REST (API standard below) |
| Asynchronous (events) | Everything else (state changes, decoupled flows) | Kafka + Avro + the common envelope below |

### Event standard (Mandated)
- **Envelope**: a **common Avro header record embedded in every message schema** (decision v1.0). Every Published-Language `.avsc` composes this header so the envelope lives inside the Schema-Registry-governed contract — there is no second envelope format to police.
- **Required envelope fields**: `id`, `source` (owning service), `type` (e.g. `containermovement.dwell-return`), `time` (UTC), `correlationId`, `dataSchemaVersion`.
- **Schema registry**: **Confluent Schema Registry** (self-hosted), one per environment; compatibility checks enforced at the wire.
- **Versioning**: backward-compatible changes only; a breaking change is a **new `type` version**, never an in-place edit.
- **Idempotency & delivery**: at-least-once via the transactional outbox; consumers dedupe on `id`, must be idempotent and tolerant of out-of-order / late events (movements arrive messy across terminals — track *occurred* vs *received* time).

Indicative envelope (Avro IDL):

```text
record EventEnvelope {
  string id;                 // ULID/UUID — dedupe key
  string source;             // owning service, e.g. "container-service"
  string type;               // e.g. "containermovement.dwell-return.v1"
  string time;               // ISO-8601 UTC
  string correlationId;      // propagated across every hop
  int    dataSchemaVersion;  // payload schema version
  // ... context-specific payload fields follow / nested record
}
```

### API standard for synchronous calls (Mandated)
- **Style**: REST. **Contract**: OpenAPI 3.x published for every endpoint.
- **Versioning**: media-type versioning (`application/vnd.api.v1+json`), as in the reference.
- **Naming**: kebab-case URLs, camelCase JSON.
- **Error format**: one standard error envelope per service, surfaced from a shared exception hierarchy (`DomainException` → context-specific `*DomainException`).
- **Service-to-service auth**: JWT (RS256) validated at each edge, issued via the identity service.

### Contract testing (Mandated)
- Every inter-service interface has a contract test. **Sync (Booking ↔ Pricing):** consumer-driven contracts (Pact). **Async events:** message-based contract testing (Pact message-pact) **plus** Confluent Schema Registry compatibility checks.
- **Gate**: contract tests + Avro compatibility must pass before staging deploy. A producer cannot break a published contract.

### Correlation and tracing (Mandated)
- **Correlation ID** propagated across every hop (sync and async; carried in the event envelope and in REST headers).
- **Trace propagation**: **OpenTelemetry / W3C Trace Context** across all service boundaries (see §9).

### Master data synchronization (Mandated)
- **Mechanism**: `reference-data-service` is the **Open Host Service + Published Language**; consumers are **Conformist** — they hold references (String/UUID codes) and keep a local replica synced via reference-changed events. No shared databases.
- **Consistency**: pricing a booking is **strongly consistent** (synchronous Booking → Pricing). Everything else is **eventually consistent**.

---

## 6. Enterprise Architecture Patterns and Defaults

The boundary test: patterns at the seam between services (or to an external consumer) are decided here and lean **Mandated**; platform-shaping-but-internal patterns get a **Default**; purely internal patterns are left to the module.

### Architecture and topology

| Pattern | Enterprise Position | Classification |
|---------|---------------------|----------------|
| Deployment topology | **Microservices** — one deployable per bounded context; Container Movement is the most independent lane | **Mandated** |
| Hexagonal (Ports & Adapters) | **Mandatory** internal shape for every service | **Mandated** |
| Domain-Driven Design | Aggregates, value objects, domain events for Core/Supporting; the Generic context (Identity) may be thinner | Mandated (Core/Supporting) |
| Transactional Outbox | Any service that publishes events after a state change | **Mandated** where events are emitted |
| Saga | Multi-service business transactions (e.g. booking → container movement) | **Mandated** for cross-service transactions |
| Local replica of reference data | Consumers of Reference Data | **Mandated** for consumers |
| Internal patterns (CQRS, layering, in-service caching) | The service's own choice | Permitted (module decides) |
| Serverless-first | Not the default — the platform is container-based | N/A |

### The mandatory backend service skeleton (Mandated)

Every backend service is a Maven multi-module project with the **same** module shape (the "six-module skeleton"; `*-domain-core` + `*-application-service` are grouped under an intermediate `*-domain` aggregator POM). Using `pricing` as the example prefix:

| Module | Layer | Framework-aware? | Responsibility | Depends on |
|--------|-------|------------------|----------------|------------|
| `pricing-domain-core` | Domain | **No (framework-free)** | Aggregates, VOs, domain events, domain services, domain exceptions | `common-domain` only |
| `pricing-application-service` | Application | Light (Spring stereotypes, `spring-tx`, validation, Jackson) | Use-case handlers, **input ports**, **output ports**, DTOs, mappers, outbox/saga helpers | `pricing-domain-core`, `common-domain`, `outbox`, `saga` |
| `pricing-application` | Inbound adapter (REST) | Yes (`spring-boot-starter-web`) | Controllers calling input ports | `pricing-application-service` |
| `pricing-dataaccess` | Outbound adapter (JPA) | Yes | JPA entities/repos implementing repository ports | `pricing-application-service` |
| `pricing-messaging` | In/out adapter (Kafka) | Yes (`spring-kafka`, Avro) | Publishers/listeners implementing message ports; domain↔Avro mappers | `pricing-application-service`, kafka infra |
| `pricing-published-language` | Published Language | **No framework** | The context's outward contract: DTOs + client interface; cross-context refs as String/UUID codes | nothing context-specific |
| `pricing-container` | Bootstrap | Yes (Spring Boot app) | `@SpringBootApplication`, `BeanConfiguration` wiring framework-free domain beans, `application.yml`, runnable image | all of the above |

**Dependency rules (binding — a violation is a build-review blocker):**

1. **Domain core is framework-free** — depends on `common-domain` and nothing else (no Spring/JPA/Kafka/Jackson). Invariants live in hand-written builders/entities.
2. **Dependencies point inward** — adapters → application-service → domain-core; never the reverse.
3. **Ports defined in `*-application-service`, implemented in adapters** (input ports called by REST; output ports implemented in dataaccess/messaging).
4. **Cross-context isolation** — a service depends on another **only** via that context's `*-published-language` module and shared Avro schemas. Never on another's `*-domain-core` or `*-application-service`.
5. **`common-domain` is a Shared Kernel for generic technical building blocks only** (`BaseEntity`, `AggregateRoot`, `BaseId`, `DomainEvent`, `DomainException`). Mutable business reference data belongs to `reference-data-service`, not here.
6. **Context-specific types stay in their context's domain core** (e.g. `BookingId`, `BookingStatus` belong in `booking-domain-core`).
7. **The bootstrap module owns wiring** — framework-free domain beans are instantiated in a `@Configuration` `BeanConfiguration` in `*-container`.

**Shared backend infrastructure modules** (live once under the `infrastructure` parent, reused by every service): `saga`, `outbox` (+ scheduler), `kafka` (`kafka-config-data`, `kafka-model`, `kafka-producer` / consumer), and `common/common-domain`. `kafka-model` generates Java from `.avsc` at build time.

Other binding patterns: **constructor injection only** (field `@Autowired` Prohibited); domain events extend a `DomainEvent<T>` marker; outbox row written in the **same transaction** as the state change; saga status in the shared `saga` module; mappers named by direction and kept in the adapter that owns the translation.

### Frontend architecture (Mandated)

- **Multi-app monorepo** (Turborepo). Each LinerCore frontend app is independent and owns only its domain code:

  `apps/pricing` (Charge & Agreement) · `apps/booking` · `apps/container` (Container Movement) · `apps/auth` (shared) · `apps/dashboard` (shell/landing) · `apps/reference-data` (admin UI for Customer / Port / Vessel-Voyage / Currency / ChargeCode / Equipment-type)

- **App isolation**: apps may import `packages/*` only; **app-to-app imports are Prohibited**. Apps communicate with backend APIs (through the BFF), never with each other.
- **Atomic design** (`atoms / molecules / organisms / templates / skeletons`) for shared UI only; business-specific components stay inside their app. **Skeletons required** for every async loading state.
- **Component purity**: UI components contain no direct API calls, no `axios`/`fetch`, no business/domain logic, no token access, no `alert()`/`console.error()`. All API traffic flows through `api-core`; all errors through centralized handling.
- **State**: Zustand for global shared state (auth, current user, permissions cache, ERP-wide filters); React Context for UI-only providers (theme, language, modals). Context is **not** a substitute for Zustand.
- **Route protection**: via **`proxy.ts`** — Next.js 16's renamed `middleware` (Node.js runtime); the legacy `middleware.ts` is deprecated. Checks the auth cookie / session and redirects unauthorized requests; never exposes the token to the browser.
- **Implementation steering**: the detailed, always-on frontend conventions — the mandatory per-app structure, the data-flow pipeline (service → `api-core` → transformer), state rules, shared-package usage, and the build/PR workflow — live as steering files at **`.kiro/steering/frontend-*`**. They operationalize this constitution for code generation; **this section remains the classifying authority**.

### API design standard (every exposed API, Mandated)
OpenAPI 3.x, media-type versioning, standard error envelope, kebab-case URLs / camelCase JSON, cursor-based pagination default. Applies to inter-service, BFF-facing, and customer-facing (DCSA) APIs alike so every API on the platform looks alike.

### Data patterns
- **Data ownership**: each service owns its data; access by contract only; **no shared databases** — Mandated.
- **Primary datastore**: **PostgreSQL 15+ (self-managed, on-premises)**, one schema/DB per service — Default (Paved Road); deviation requires a waiver.
- **Caching**: the service's own choice — Permitted.

---

## 7. Enterprise Security and Compliance Baseline

The non-negotiable floor. Modules may add stricter controls, never weaker.

### Identity and access (Mandated)
- **Authentication**: performed by **Keycloak 24** as the OIDC identity provider (SSO; issues tokens). Services do not authenticate users themselves.
- **Authorization**: handled by `identity-service` — it owns the carrier role model (pricing, sales, booking desk, equipment control, customer service, finance-read) and authorization decisions. All other services are **Conformist** token consumers.
- **Token**: JWT (RS256) issued by Keycloak, validated at each service edge.

### Data protection (Mandated)
- **At rest**: encryption for all PostgreSQL stores and Kafka volumes, with on-premises key management (HashiCorp Vault / HSM).
- **In transit**: TLS 1.2+ for all REST and broker connections.
- **PII**: Party/Customer data is PII-bearing and owned by `reference-data-service`; consumers hold references (codes), minimising PII spread. Classify, restrict, and log access.
- **Data classification**: Public / Internal / Confidential / Restricted (applied platform-wide).

### Frontend security (Mandated — the BFF pattern is non-negotiable)
- All browser traffic flows **Browser → Next.js BFF → backend API**. The BFF (route handlers / server actions) is mandatory.
- Tokens stored in **HttpOnly cookies only**; browser JavaScript never accesses auth tokens; **no `localStorage` / `sessionStorage` tokens**.
- Secure cookie flags, **CSRF protection**, **strict CSP headers**, route protection via **`proxy.ts`** (Next.js 16's renamed `middleware`; runs on the Node.js runtime, never exposing the token to the browser).

### Secrets management (Default)
- HashiCorp Vault (self-hosted) for DB creds, registry creds, OIDC client secrets.

### Compliance regimes
- **Audit & traceability** (Mandated): every charge calculation and every container movement is auditable and reconstructable. Infrastructure and access audit logging enabled platform-wide; structured app logs with correlation id retained per the program retention policy.
- **Competition-law / regulatory care** (flag): rate data handling and, where US trades are in scope, FMC tariff-publication rules — to be confirmed per the deferred trade/regulatory-footprint question (§2, Program Vision §10). Not a per-module decision.

### Enterprise security framework (Mandated)
- **Chosen**: **OWASP Top 10 (2021) + OWASP API Security Top 10** for application / API security, plus **CIS Controls v8 / CIS Benchmarks** for on-premises infrastructure and host hardening.
- **Per-module obligation**: each module documents, in its own tech-env, how it addresses each category — control, explicit *N/A* justification, or deferred-with-target-phase. No category left blank. Reference `security/owasp-compliance.md` per module.

### Dependency security (Mandated)
Dependency scanning on every PR; allowed licenses MIT/Apache-2.0/BSD; GPL/AGPL prohibited in production; criticals patched on the platform SLA.

---

## 8. Data Governance Standards

- **Classification scheme**: Public / Internal / Confidential / Restricted — handling rules per class, platform-wide.
- **Canonical data ownership**: per Program Vision §5 — exactly one owning module per entity. `reference-data-service` owns Customer/Party, Port/Location (UN/LOCODE), Vessel/Voyage/Sailing, Currency/Exchange, Charge-code, Equipment-type. Booking owns Booking; Charge owns Tariff/Surcharge/Agreement/Quotation/D&D-ruleset; Container owns Container/Movement/Lifecycle-state.
- **Cross-module sync**: reference API + reference-changed events; consumers Conformist with local replica (§5). No shared DBs.
- **Internationalization & currency**: **MVP is USD only and single carrier entity**; design must not preclude multi-currency / multi-entity later. **Time-zone handling is first-class** on all movement times (track occurred vs received time); locations are UN/LOCODE.
- **Retention & residency**: platform-wide rules derived from the regulatory footprint once fixed (TBD, §2).

---

## 9. Observability and Operations Standards

Standardised so a single booking is traceable booking → charge → movement across services.

### Logging (Mandated)
Structured JSON; required fields include `correlationId`, `service`, `level`, `timestamp`. Central aggregation in a self-hosted **ELK stack (Elasticsearch + Logstash + Kibana)** (confirmed); retention per program policy.

### Metrics (Mandated/Default)
**OpenTelemetry metrics**, scraped into **Prometheus** and visualised in **Grafana**; each service emits a baseline set (request rate, error rate, latency, outbox lag, consumer lag).

### Tracing (Mandated)
**OpenTelemetry + W3C Trace Context**, exported through the **OpenTelemetry Collector** to **Jaeger** (self-hosted, confirmed). Propagation across every service boundary (sync and async) is required; correlation id is carried in the event envelope and REST headers.

### Alerting, SLOs, operational readiness
Each service defines SLOs and a minimum alert set; health checks, runbooks, and on-call expectations are platform-wide minimums.

---

## 10. CI/CD, IaC, and Delivery Standards

### Pipeline platform (Mandated)
- **CI/CD**: **GitHub Actions** (with **self-hosted runners** inside the on-premises network).
- **Artifact registries**: a self-hosted container registry (**Harbor**) for service images (e.g. `linercore/booking.service`); a self-hosted package registry (**Nexus** or **Artifactory**) for shared frontend packages. (confirmed)

### Infrastructure as Code (Mandated)
- **Tool**: **Terraform** for provisioning, with **Docker Compose** files as the versioned service/topology definitions and **Ansible** for host / VM configuration. *(AWS CDK is not applicable on-premises; no Kubernetes, so no Helm/Kustomize.)*
- **Conventions**: standard naming, tagging / labelling, and per-environment targeting (Compose project / Docker network, not cloud accounts).

### Environment promotion and gates (Mandated baseline; modules may add stricter, not remove)

| Pipeline Stage | Required (platform minimum) | Failure Action |
|----------------|-----------------------------|----------------|
| Pre-commit | Lint, format, compile/type-check | Block commit |
| Pull Request | Unit + adapter integration tests; **Avro compatibility check** | Block merge |
| Pre-deploy (staging) | E2E + **contract tests** | Block deploy |
| Post-deploy (prod) | Smoke + health checks | Auto-rollback |

---

## 11. Governance: Ownership, Versioning, and Exceptions — *enterprise-only*

### Ownership
- **Owner**: Platform / Architecture team. **Review cadence**: quarterly (or on a topology/standards change).

### Versioning
- Standards are versioned. **Current: v1.1.** Each module records the version it conforms to in its conformance table.
- **Change classification**: backward-compatible vs breaking; breaking changes are rolled out across modules with a migration window.

#### Version history

| Version | Date | Class | Summary |
|---------|------|-------|---------|
| v1.0 | (first issue) | — | Greenfield baseline: on-prem Docker Compose, Nginx edge, Keycloak 24 + identity-service, self-managed Kafka + Confluent SR, PostgreSQL 15+, Vault, ELK/Prometheus+Grafana/Jaeger, GitHub Actions + Terraform + Ansible, Harbor + Nexus/Artifactory, OWASP + CIS. |
| **v1.1** | **2026-06-28** | **Backward-compatible** | Frontend-standard reconciliation: §12 app-starter scaffold updated to the full App-Router structure (`pages/` removed); §6/§7 route protection corrected to `proxy.ts` (Next.js 16; `middleware.ts` deprecated); §6 pointer added to the `.kiro/steering/frontend-*` steering set; `@erp/utils` confirmed Default (reuse optional). No Mandated-standard behaviour removed. |

### Exception / waiver process
- **Request**: submit a waiver with rationale, scope, risk & mitigation, and expiry.
- **Approve**: Standards Owner (Platform / Architecture).
- **Record**: approved waivers get an ID (e.g. `WAIVER-014`) referenced in the module's conformance table.
- **Expiry**: waivers are time-boxed and reviewed at renewal.

### Onboarding a new module (before Construction)
- [ ] Conformance table completed in the module tech-env (defaults = Inherit)
- [ ] Integrated with shared services: identity, reference data, Kafka event bus, observability
- [ ] Contract tests registered for every interface produced or consumed
- [ ] Event types use the common Avro envelope; schemas registered in Confluent Schema Registry
- [ ] Correlation ID propagated on all inbound/outbound hops
- [ ] Every deviation from a Mandated standard has an approved, in-date waiver
- [ ] OWASP compliance matrix completed (addressed / N/A-justified / deferred)

---

## 12. Enterprise Reference Code and Paved-Road Templates

The platform provides a set of **org-level golden templates** that seed module example code. They establish the canonical patterns for the standards in this document so that, when AI-DLC (Kiro) generates code, it specializes a known-good template rather than inventing a new shape. Each module's Technical Environment Document has an **"Example Code"** section that **references and specializes** these templates rather than starting from scratch.

### What the platform provides

The Standards Owner defines the template **names and locations** here. The **technical team leads provide the actual example code** in these locations/directories, and keep it current as the standards evolve.

| Golden Template | Demonstrates | Suggested Location |
|-----------------|--------------|--------------------|
| Backend service starter | The hexagonal six-module skeleton (§6), structured JSON logging, the standard error envelope, Keycloak token validation, OpenTelemetry tracing, constructor injection | `platform-templates/backend/service-starter/` |
| Event producer / consumer | The common Avro envelope (§5), transactional outbox, idempotent consumer, Confluent Schema Registry registration, message-pact contract test | `platform-templates/backend/event-messaging/` |
| Inter-service REST client | The synchronous call pattern (Booking → Pricing style): service-to-service auth, correlation-id propagation, standard error handling, published OpenAPI | `platform-templates/backend/rest-client/` |
| Frontend app starter | A Next.js **App Router** app scaffold — `app/` (with `api/` BFF route handlers) · `components/ providers/ services/ hooks/ lib/ schemas/ transformers/ constants/` · `proxy.ts` route protection · `types.d.ts` — **App Router only, no `pages/`**; HttpOnly-cookie auth, TanStack Query + Zustand + RHF/Zod, Tailwind, atomic-design consumption. Detailed conventions in `.kiro/steering/frontend-*` | `platform-templates/frontend/app-starter/` |
| Frontend shared packages | The `@erp/*` packages — `ui` (atomic design), `api-core`, `transformers`, `auth`, `shared-types`, `config` | `packages/` in the frontend monorepo |
| Infra / deployment module | A Terraform module + Docker Compose service definition + Ansible host config; naming/tagging conventions and the Nginx edge wiring | `platform-templates/infra/` |

> Locations are suggestions for the team leads to confirm and populate; the only requirement is that they are a single, versioned, discoverable source the module documents can point to.

### Rules
- AI-DLC Code Generation (Kiro) reads **this document, then the module tech-env, then the relevant golden template** — and follows the established pattern rather than inventing alternatives.
- Module example code **extends** these templates; it never contradicts them.
- Templates are versioned with the standards (§11) and updated when a standard changes.

---

## 13. Brownfield Convergence

Not applicable — LinerCore is greenfield. There is no existing platform to converge and no legacy patterns to retire; the golden templates in §12 are authored fresh against these standards. No dual-running or convergence rules are needed.

---

## How This Document Feeds Into AI-DLC

| Section | AI-DLC Stage (per module) | How It Is Used |
|---------|---------------------------|----------------|
| §1 Enterprise Summary, topology | Workspace Detection | Platform context; microservices stance for classifying every service |
| §2 On-Premises Foundation | Infrastructure Design | The substrate services deploy into; bounds service/network choices |
| §3 Language & Framework Standards | Code Generation | The allowed set each module selects from; prohibited-list checks (incl. domain-core purity) |
| §4 Shared Platform Services | Application & Infrastructure Design | Integrate identity, reference data, Kafka, secrets, shared modules/packages — don't rebuild |
| §5 Cross-Module Integration | Application Design, Units of Work, NFR Design | Common Avro envelope, REST/OpenAPI standard, contract tests, correlation — applied to every interface |
| §6 Architecture Patterns | Application, Functional, Infrastructure Design | Microservices topology, hexagonal skeleton, dependency rules, FE multi-app/atomic-design, API & data patterns |
| §7 Security & Compliance | NFR Requirements, NFR Design | Security floor, OIDC, BFF, OWASP framework |
| §8 Data Governance | Application Design, NFR Design | Ownership, sync, classification, i18n/currency, residency |
| §9 Observability | NFR Design, Build & Test | Logging/metrics/tracing format and SLO/alerting baseline |
| §10 CI/CD, IaC | Build & Test | GitHub Actions, self-hosted registry, Terraform + Docker Compose, mandatory gates (incl. contract & Avro-compatibility) |
| §11 Governance & Waivers | All stages | Which standards version applies; which deviations are approved |
| §12 Reference Code & Templates | Code Generation | Read first; module generation extends these, not invents alternatives |

> **Per-module conformance:** each module's Technical Environment Document opens with the **Conformance to Enterprise Technical Standards** table (see Appendix A below, and `module-tech-env-conformance-addendum.md` for the full deviation/waiver blocks) and cites this document's version (**v1.1**), then proceeds with its module-specific selections.

---

## Appendix A — Module Conformance Table Template

Every module Technical Environment Document **opens with the table below, completed for that module.** Default per row is **Inherit**; complete the *Choice / Note* only where the module pins a Default/Permitted option or **Deviates** — and a deviation from any **Mandated** standard requires an approved, in-date waiver (§11). The full deviation and onboarding-checklist blocks live in `module-tech-env-conformance-addendum.md`.

**Module:** [name] · **Enterprise Standards Version Conformed To:** v1.1 · **Last Reviewed:** [YYYY-MM-DD] · **Owner:** [team / contact]

| Enterprise Standard | Class | Status | This Module's Choice / Note | Waiver |
|---------------------|-------|--------|-----------------------------|--------|
| On-premises foundation · Docker + Docker Compose · Nginx edge | Mandated | Inherit | — | — |
| Authentication via Keycloak 24; authorization via `identity-service` | Mandated | Inherit | — | — |
| Event envelope (common Avro header) + Confluent Schema Registry rules | Mandated | Inherit | Emits types: `[module.entity.event]` | — |
| Inter-service API style (REST + OpenAPI) & contract testing (Pact / message-pact) | Mandated | Inherit | APIs exposed: `[…]` | — |
| Observability: structured JSON + OpenTelemetry → ELK / Prometheus+Grafana / Jaeger; correlation id | Mandated | Inherit | — | — |
| Security & compliance baseline (encryption, TLS, BFF for UI) | Mandated | Inherit | [stricter controls added? note here] | — |
| Security framework (OWASP Top 10 + API Top 10; CIS Controls for infra) | Mandated | Inherit | Matrix at `security/owasp-compliance.md` | — |
| CI/CD (GitHub Actions) + IaC (Terraform + Docker Compose + Ansible) + pipeline gates | Mandated | Inherit | — | — |
| Hexagonal six-module skeleton + dependency rules | Mandated | Inherit | — | — |
| Frontend stack (Next.js / React / TS strict · Turborepo · Yarn) | Mandated | Inherit | App(s): `[apps/…]` | — |
| Backend language (Java 21 target / 17 floor) | Default/Permitted | [Inherit/Deviate] | [version] | — |
| Backend framework (Spring Boot 3.3.x) | Default | [Inherit/Deviate] | — | — |
| Secrets (HashiCorp Vault) | Default | [Inherit/Deviate] | — | [WAIVER-NN if deviate] |
| Primary datastore (PostgreSQL 15+) | Default | [Inherit/Deviate] | [selected store] | [WAIVER-NN if deviate] |
| Test coverage targets | Minimum set | Inherit (≥ min) | [module target if higher] | — |

---

*Enterprise Technical Environment v1.1 (greenfield, on-premises). Confirmed since the last revision: Docker + Docker Compose, Nginx edge, Keycloak 24 (auth) + identity-service (authz), Vault (Default), ELK (logs), Jaeger (traces), Harbor + Nexus/Artifactory (registries). One open item carried forward: primary/DR site and data residency, tied to the deferred trade/regulatory-footprint question in Program Vision §10.*

---

### Reconciliation log — applied in v1.1 (2026-06-28)

Three frontend-standard corrections were applied to align this document with the frontend constitution (now distributed as `.kiro/steering/frontend-*`):

1. **§12 frontend app-starter scaffold** — replaced the partial `app/ components/ hooks/ pages/ services/ schemas/ types/` layout with the full App-Router structure (`app/` + `api/`, `components/ providers/ services/ hooks/ lib/ schemas/ transformers/ constants/`, `proxy.ts`, `types.d.ts`); **App Router only, `pages/` removed**.
2. **§6 / §7 route protection** — corrected `middleware` to **`proxy.ts`** (Next.js 16's renamed convention; `middleware.ts` deprecated) and added a §6 pointer to the frontend steering set.
3. **`@erp/utils` (§4)** — confirmed **Default (reuse optional)**; no change to the table (it was already Default). The matching steering rule was relaxed from "never duplicate a utility" to "prefer reuse."

> Applied as a **backward-compatible** change: Standards **v1.0 → v1.1** (see §11 version history). Module conformance tables should now cite **v1.1**; the Shared Platform module tech-env has been updated accordingly.

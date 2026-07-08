# Module Technical Environment Document — Shared Platform (LinerCore)

> **Module:** Shared Platform (foundational / enabling — *not* a business module).
> **Realised as:** two deployable services — `reference-data-service` (Supporting) and `identity-service` (Generic) — plus the **Apache Kafka event bus**, which is enterprise infrastructure this module *operates* but does not build (§4).
> **Frontend apps owned:** `apps/reference-data` (admin UI for the nine reference lists) and `apps/auth` (shared sign-on).
> **Counterpart to:** the [Shared Platform Module Vision](./shared-platform-module-vision.md) v0.2 (the *what/why*). This document covers the *how* — by **inheriting** the [Enterprise Technical Environment Document](./enterprise-technical-environment.md) **v1.1** and recording only this module's selections, domain contents, and its own side of each contract.
> **Methodology:** AI-DLC (`awslabs/aidlc-workflows`). This document is the binding technical input to the Shared Platform's Construction phase.
> **Build order:** #1 — depends on no other module; every module depends on it.
> **Status:** Draft **v0.2** for review · conforms to Enterprise Standards **v1.1** · 2026-06-28.

### How to read this document

Per the LinerCore module tech-env playbook, **default behaviour is inherit**: enterprise standards are referenced, never restated. A line appears below only where this module (a) **pins** a Default/Permitted choice the enterprise leaves open, or (b) defines its **own internal content** — internal patterns, domain contents, its side of each contract, the OWASP matrix, and example-code specialization. Anything not mentioned is inherited from Enterprise Tech-Env v1.1 and recorded only as an *Inherit* row in the conformance table.

A note specific to this module: the Shared Platform is the module that **provides** three enterprise-mandated shared services (identity, reference data, event transport). So where a business module *consumes* those services, this module owns their **provider side** — which is why its domain and integration sections (§5.3–§5.5) carry real content rather than collapsing to *Inherit*.

---

## 1. Project Technical Summary

- **Module Name**: Shared Platform
- **Module Type**: Foundational / enabling (provides shared services; owns no business rules)
- **Services (deployables)**:
  - `reference-data-service` — subdomain **Supporting**; owns and serves the nine canonical reference sets and emits reference-changed events.
  - `identity-service` — subdomain **Generic**; owns the carrier authorization / role model and authenticates synchronous inter-service calls. Authentication is delegated to Keycloak 24.
- **Shared infrastructure operated (not built)**: Apache Kafka event bus + Confluent Schema Registry (self-managed on-prem; fixed in Enterprise Tech-Env §4/§5).
- **Frontend apps**: `apps/reference-data`, `apps/auth` (within the frontend constitution, Enterprise §6).
- **Project Type**: Greenfield
- **Primary Runtime Environment**: On-Premises (Docker Compose; inherited)
- **Owner**: Platform / Architecture team, with Security / IT as joint owner for `identity-service`.

---

## Conformance to Enterprise Technical Standards

- **Module**: Shared Platform
- **Enterprise Standards Version Conformed To**: **v1.1**
- **Last Reviewed**: 2026-06-28 · **Owner**: Platform / Architecture (+ Security / IT for identity)

### Conformance Table

> Status is **Inherit** (use the enterprise standard as-is) or **Deviate** (requires a waiver for any *Mandated* standard). Rows are added for *Default/Permitted* standards this module pins.

| Enterprise Standard | Class | Status | This Module's Choice / Note | Waiver |
|---------------------|-------|--------|-----------------------------|--------|
| On-premises foundation · Docker + Docker Compose · Nginx edge | Mandated | Inherit | — | — |
| Authentication via Keycloak 24; authorization via `identity-service` | Mandated | Inherit | **This module provides it** (`identity-service` owns the carrier role model; Keycloak is the IdP) | — |
| Event envelope (common Avro header) + Confluent Schema Registry rules | Mandated | Inherit | Emits nine types: `referencedata.<entity>.changed` (§5.4) | — |
| Inter-service API style (REST + OpenAPI) & contract testing (Pact / message-pact) | Mandated | Inherit | Provides the **Reference Open Host Service** (read + admin) and the **identity authorization API** (§5.5) | — |
| Observability: structured JSON + OpenTelemetry → ELK / Prometheus+Grafana / Jaeger; correlation id | Mandated | Inherit | — | — |
| Security & compliance baseline (encryption, TLS, BFF for UI) | Mandated | Inherit | **Owns PII (Party) and identity** → stricter access logging on those stores (§6) | — |
| Security framework (OWASP Top 10 + API Top 10; CIS Controls for infra) | Mandated | Inherit | Matrix at `security/owasp-compliance.md` (scaffolded §6; full file is a follow-up) | — |
| CI/CD (GitHub Actions) + IaC (Terraform + Docker Compose + Ansible) + pipeline gates | Mandated | Inherit | — | — |
| Hexagonal six-module skeleton + dependency rules | Mandated | Inherit | Applies to both services | — |
| Frontend stack (Next.js / React / TS strict · Turborepo · Yarn) | Mandated | Inherit | Apps: `apps/reference-data`, `apps/auth` | — |
| Backend language (Java 21 target / 17 floor) | Default/Permitted | Inherit | Java 21 target | — |
| Backend framework (Spring Boot 3.3.x) | Default | Inherit | — | — |
| Secrets (HashiCorp Vault) | Default | Inherit | DB creds, OIDC client secrets, registry creds | — |
| Primary datastore (PostgreSQL 15+) | Default | Inherit | `reference-data-service`: PostgreSQL 15+ · `identity-service`: PostgreSQL 15+ (authz / role-mapping model) **+ Keycloak 24** (authentication) | — |
| Test coverage targets | Minimum set | Inherit (≥ min) | **85% line**, both services | — |

### Deviations and Waivers

**None.** The Shared Platform conforms to every Mandated standard without deviation — as the module that realises several of them, it is effectively the reference implementation. No waiver is required.

### Onboarding Conformance Checklist

- [x] Conformance table completed (defaults = Inherit), citing **v1.1**.
- [x] Integration designed with shared services — this module *provides* identity, reference data, and the event bus; it consumes none of them from elsewhere.
- [x] Contract tests planned for every interface produced: Pact (provider) for the Reference OHS and the identity authorization API; message-pact + Schema-Registry compatibility for the nine reference-changed events (§7).
- [x] Event types use the common Avro envelope; schemas registered in Confluent Schema Registry (§5.4).
- [x] Correlation id propagated on all inbound/outbound hops (inherited).
- [ ] `security/owasp-compliance.md` completed — **scaffolded here; full matrix deferred to a follow-up** (§6).
- [x] Every deviation from a Mandated standard has an approved, in-date waiver — **N/A (no deviations).**

---

## 2. Programming Languages

**Inherit.** Java **21 (LTS) target / 17 floor** for both services; domain-core purity (framework-free) is Mandated and applies unchanged. SQL is the PostgreSQL 15+ dialect. Avro IDL / `.avsc` (1.11.x) for the reference-changed message schemas. TypeScript **strict** for `apps/reference-data` and `apps/auth`. No language additions; no deviations.

---

## 3. Frameworks and Libraries

**Inherit** the Spring Boot 3.3.x baseline and the full enterprise stack. The libraries this module actually exercises, all already on the enterprise lists:

- **Both services**: Spring Boot 3.3.x, Spring Data JPA + Hibernate (adapter only), JUnit 5 + Mockito, Testcontainers, Jackson.
- **`reference-data-service` additionally**: Spring for Apache Kafka + Apache Avro + Confluent Kafka Avro Serializer (it is the only Shared-Platform event **producer**); MapStruct (Permitted) for domain↔DTO/Avro mapping in adapters.
- **`identity-service` additionally**: the Keycloak 24 adapter / OIDC client libraries for IdP integration and the carrier-role administration path. (Per-request token *validation* at each service edge is the inherited Conformist pattern and is not unique to this service.)

**No new libraries** are introduced; nothing touches the backend domain core that would require Standards-Owner approval (Enterprise §3).

---

## 4. Cloud / Infrastructure

**Inherit.** On-premises Docker Compose, segmented internal networks, and the Nginx edge are all enterprise-fixed; this module redefines none of it.

One operational note (not a deviation): this module is the steward of the **Kafka event bus + Confluent Schema Registry**, which Enterprise Tech-Env §4 classifies as platform infrastructure rather than a buildable service. The Shared Platform does **not** build the broker; it operates it and owns the provisioning of the **topics** carrying the `referencedata.*.changed` event types (§5.4), along with their topic-level produce/consume authorization (§6).

---

## 5. Preferred Technologies and Patterns

### 5.1 Inherited architecture (both services)

**Inherit**, no restatement: the hexagonal six-module skeleton and its binding dependency rules, DDD for the Supporting context (the Generic identity context may be thinner), constructor-injection-only, and the **transactional outbox** wherever events are emitted. The **local-replica-of-reference-data** pattern is **N/A** for `reference-data-service` — it is the *source of truth*, not a consumer.

### 5.2 Module-internal patterns (this module's own choices — recorded, no approval needed)

- **`reference-data-service`**: a read-optimised serving path over an admin-maintained write model. The reference sets are low-volume and change-by-administration, so a **full CQRS split is intentionally avoided** at MVP; in-service caching of hot reference lists is **Permitted** and adopted where it helps serving latency. The **outbox is Mandated here** because the service publishes reference-changed events.
- **`identity-service`**: a deliberately **thin Generic-subdomain** service. It persists the **carrier authorization / role-mapping model** in its **own PostgreSQL 15+ store** (the carrier role model is *not* held inside Keycloak), while delegating authentication to Keycloak 24. It **publishes no domain events** to the bus — its surface is synchronous (§5.5).

### 5.3 Domain contents (the contents inside the inherited skeleton — this module's own)

**`reference-data-service` — nine canonical reference aggregates**, each owned here and *only* here:

| Aggregate | Shape / key value objects | MVP note |
|-----------|---------------------------|----------|
| **Party** (Customer) | Generic *party + roles*; PII-bearing | Direct shippers/BCOs populated; model stays generic to absorb later customer types |
| **Location** (Port) | `UnLocode` VO; **intrinsic structural containment** Country → Port (each node created within its parent, loaded in dependency order, never orphaned/re-parented) | Terminal/Facility level deferred |
| **Region** | A **flat grouping layer assigned over** locations — kept deliberately separate from the structural tree; the basis Trade-lanes are defined against | Single flat dimension |
| **Voyage** | Schedule + **nominal capacity** | Entered manually; external feed deferred |
| **Currency** | Currency / exchange reference | USD only |
| **ChargeCode** | Charge-code reference | — |
| **EquipmentType** | Equipment-type reference | — |
| **Commodity** | **Flat code list** | Hierarchy (e.g. HS-aligned) deferred |
| **TradeLane** | Defined as origin↔destination **Region pairs** | Only the lane(s) the MVP slice needs are populated |

The **two location structures are modelled as distinct constructs** — intrinsic containment vs. additive region grouping — so a location's commercial/geographic groupings never distort its physical containment. Each aggregate raises a domain event on change (§5.4). Cross-context references are held as String/UUID codes in the `*-published-language` module; the domain core depends on `common-domain` only.

**`identity-service` — carrier authorization model:** the **carrier role model** (pricing, sales, booking desk, equipment control, customer service, finance-read), role-to-permission mappings, and authorization decisions, persisted in its own store. Authentication (token issuance, SSO) is Keycloak's; this service owns *authorization*. As a Generic subdomain its domain model is intentionally lean.

### 5.4 Messaging and events — emitted types (this module's producer side)

`reference-data-service` emits **nine per-entity reference-changed events** so consumers subscribe selectively to only the sets they hold. Each composes the **common Avro envelope** (inherited; `id`, `source`, `type`, `time`, `correlationId`, `dataSchemaVersion`), carries `source = reference-data-service`, is registered in **Confluent Schema Registry**, and is published via the **transactional outbox** (at-least-once; consumers dedupe on `id`).

| Event `type` | Emitted on change to | Principal consumers (per Program §5) |
|--------------|----------------------|--------------------------------------|
| `referencedata.customer.changed` | Party / Customer | All |
| `referencedata.port.changed` | Location (Port) | All |
| `referencedata.region.changed` | Region | Charge, Booking |
| `referencedata.voyage.changed` | Vessel / Voyage (+ nominal capacity) | Booking, Charge, Container Movement |
| `referencedata.currency.changed` | Currency / Exchange | Charge, Booking |
| `referencedata.chargecode.changed` | Charge-code | All |
| `referencedata.equipmenttype.changed` | Equipment-type | All |
| `referencedata.commodity.changed` | Commodity | Charge, Booking |
| `referencedata.tradelane.changed` | Trade-lane | Charge, Booking |

> **Reconciliation follow-up (flagged, per the two-tier model):** these nine names are *cross-module contract names*, which the two-tier vision model places in **Program Vision §5**. §5 currently names only the business-module contracts and leaves reference distribution as "Reference API / events." These names are **defined module-side here** for Construction, and should be **ratified back into Program Vision §5** in the next reconciliation sweep so the program-level contract map stays authoritative.

**Reference-data freshness SLA (placeholder — TBD, Inception).** The target **change-to-replica lag** — the time within which a consumer's local replica must reflect a reference change after the corresponding `referencedata.*.changed` event — is an open module-vision question to be agreed with the consuming modules. It is **deferred to the Inception phase** and, once set, becomes `reference-data-service`'s freshness **SLO** (with a delivery-lag metric and alert, per the inherited observability baseline) and the acceptance threshold for the replica-freshness tests in §7. *Target: TBD.*

`identity-service` emits **no** events to the bus.

### 5.5 API design — exposed interfaces (this module's provider side)

All APIs inherit the enterprise API standard (OpenAPI 3.x, media-type versioning, kebab-case URLs / camelCase JSON, cursor pagination, standard error envelope, JWT/RS256 service-to-service auth).

- **`reference-data-service` — Reference Open Host Service.** A **read API** over all nine sets (the Published Language; consumers are **Conformist**, holding references by id + a replica synced via the §5.4 events) plus an **admin maintenance API** behind the role model. No shared databases.
- **`identity-service` — authorization API.** Administration of the carrier role model and authorization decisions/queries, plus **authentication of synchronous inter-service calls** (so only authorised callers reach a capability — e.g. a reference-data read, or Booking → Charge pricing). Note the division of labour: per-request **token validation** is performed at *each service's own edge* against Keycloak's keys (inherited Conformist pattern), not by a round-trip to `identity-service`.

**Inbound dependencies from other LinerCore modules: none** — this is the root of the dependency graph (build order #1). Its only external integration points are the **enterprise OIDC provider (Keycloak)** and, at MVP, **manual administration** for voyages/capacity and UN/LOCODE data (automated feeds deferred). Event-bus access is secured by **broker authentication + per-topic authorization**, not module-to-module auth (§6).

### 5.6 Frontend patterns (owned apps)

Both apps live **within** the inherited frontend constitution (Next.js + BFF, atomic design for shared UI only, component purity, HttpOnly-cookie auth, TanStack Query + Zustand + RHF/Zod, Tailwind); shared UI and clients stay in `packages/` (`@erp/*`), never in `apps/`. App-to-app imports are Prohibited.

- **`apps/reference-data`** — admin UI to maintain the nine lists; its own Zustand store(s) for reference-admin working state (selected list, edit buffers, validation state). Business-specific components stay inside the app.
- **`apps/auth`** — shared sign-on; its own session/auth Zustand slice (current user, permissions cache) consumed via `@erp/auth`.

Only the apps' **own stores** are declared here; the state *rules* are inherited.

---

## 6. Security

**Inherit the floor**, do not restate it: Keycloak 24 authentication, `identity-service` authorization, JWT/RS256 validated at each edge, TLS 1.2+ in transit, encryption at rest for all PostgreSQL and Kafka volumes (Vault/HSM key management), the **mandatory BFF pattern** for both apps, and the Public/Internal/Confidential/Restricted classification scheme.

**Where this module is stricter (it owns the most sensitive assets on the platform):**

- **PII ownership.** `reference-data-service` owns **Party/Customer**, the platform's primary PII. It is classified **Confidential/Restricted**; access is restricted and **access-logged**, and the reference-by-id model deliberately keeps PII from spreading to consumers (they hold codes, not PII).
- **Identity ownership.** `identity-service` holds the authorization model; its store and its admin API carry **tighter access logging and least-privilege** than the baseline.
- **Event-bus authorization.** Topics carrying `referencedata.*.changed` are governed by **broker authentication + per-topic produce/consume authorization**; provenance travels in the envelope `source` + correlation id.

**Security framework (Mandated): OWASP Top 10 (2021) + OWASP API Security Top 10 + CIS Controls v8.** The per-module matrix lives at **`security/owasp-compliance.md`**. That file is a **planned follow-up**; the scaffold below fixes its structure so no category is later left blank — each row will be completed as *addressed* (control/pattern), *N/A-justified*, or *deferred-with-phase*.

| Framework category | Approach (to be completed) | Status |
|--------------------|----------------------------|--------|
| OWASP Top 10 (2021) — all 10 categories | Per-category control / N-A-justification / deferral | **To be authored** |
| OWASP API Security Top 10 — all 10 categories | Emphasis on the Reference OHS + identity authorization API surfaces | **To be authored** |
| CIS Controls v8 — host/infra hardening for the two services + operated Kafka/Schema-Registry | Mapped to the on-prem substrate | **To be authored** |

> Scope confirmed: the full `security/owasp-compliance.md` is deferred to a later build; this section references and scaffolds it only.

---

## 7. Testing

**Inherit** the gates and tooling — backend JUnit 5 + Mockito + Testcontainers; frontend Jest + React Testing Library + Playwright; the pipeline gates (PR: unit + adapter integration + **Avro compatibility**; pre-deploy: E2E + **contract tests**).

**Pinned for this module:**

- **Coverage target: 85% line, both services** (above the enterprise minimum).
- **Key fixtures / contract tests:**
  - Testcontainers **PostgreSQL** for both services' dataaccess adapters; Testcontainers **Kafka** for `reference-data-service`.
  - **Outbox-atomicity** test (reference-changed row written in the same transaction as the reference change) and **idempotency/dedupe** tests (consumers tolerate redelivery and out-of-order) for the event path.
  - **message-pact** contract tests for each of the nine `referencedata.*.changed` events, plus **Schema-Registry backward-compatibility** checks at the wire.
  - **Pact provider** verification for the Reference Open Host Service and the identity authorization API.
  - **Location structural-integrity** tests (a Port cannot exist without its Country; regions assign over locations without re-parenting) and **role-model authorization** tests for `identity-service`.

---

## 8. Example and Template Code

This module **specializes** the org-level golden templates (Enterprise §12); it never invents a new shape.

- **`reference-data-service`** specializes the **Backend service starter** (hexagonal six-module skeleton, structured logging, error envelope, OpenTelemetry, Keycloak token validation) for its REST **provider** side (the Reference OHS + admin API, with published OpenAPI), and the **Event producer / consumer** template (transactional outbox, Confluent Schema Registry registration, message-pact) for the nine reference-changed events.
- **`identity-service`** specializes the **Backend service starter**, leaning on its built-in Keycloak token-validation wiring, and adds the carrier authorization / role-mapping model and admin API.
- **`apps/reference-data`** and **`apps/auth`** specialize the **Frontend app starter** (BFF route handlers, HttpOnly-cookie auth, TanStack Query + Zustand + RHF/Zod, Tailwind), consuming the shared **`@erp/*`** packages for UI, API client, transformers, auth, and shared types.

Module example code **extends** these templates and is versioned with the standards; it must not contradict them.

*(Brownfield convergence section omitted — LinerCore is greenfield.)*

---

## How This Document Feeds Into AI-DLC

AI-DLC runs per module. This document, with the Shared Platform Module Vision and Enterprise Tech-Env v1.1, is the technical context the Shared Platform's Construction stages consume.

| Section | AI-DLC Stage (this module) | How It Is Used |
|---------|----------------------------|----------------|
| §1 Summary + Conformance table | Workspace Detection | Classifies the two services + their subdomains; pins versions and the inheritance baseline (v1.1) |
| §2–§4 Languages / Frameworks / Infra | Code Generation, Infrastructure Design | Confirms the inherited stack and the libraries each service exercises; the operated Kafka topics |
| §5.2 Internal patterns | Application / Functional Design | The module's own caching/serving and thin-Generic choices |
| §5.3 Domain contents | Application Design, User Stories | The nine reference aggregates + the identity authorization model |
| §5.4 Emitted events | Application Design, NFR Design, Build & Test | The nine reference-changed types; envelope, outbox, Schema-Registry, contract tests |
| §5.5 Exposed APIs | Application Design, NFR Design | The Reference OHS + identity authorization API (provider side) |
| §5.6 Frontend | Application Design | `apps/reference-data` + `apps/auth` scope and their own stores |
| §6 Security | NFR Requirements / Design | The inherited floor + PII/identity stricter controls; the OWASP scaffold |
| §7 Testing | Build & Test | 85% targets; outbox/idempotency/contract/structural-integrity fixtures |
| §8 Example Code | Code Generation | Which golden templates each artifact specializes |

---

*Draft v0.2, conforming to Enterprise Technical Environment v1.1 and derived from Shared Platform Module Vision v0.2. No deviations. One reconciliation follow-up carried: the nine `referencedata.<entity>.changed` contract names (§5.4), defined module-side here, should be ratified into Program Vision §5. Two deferred items: the full `security/owasp-compliance.md` (§6), and the reference-data freshness SLA / change-to-replica lag (§5.4), to be set in Inception.*

> **Revision note (v0.1 → v0.2, 2026-06-28):** conformance target moved from Enterprise Standards v1.0 to **v1.1** (frontend-standard reconciliation — no change to any standard this backend-plus-admin-UI module relies on; the v1.1 deltas are frontend scaffold/`proxy.ts`/`@erp/utils`, already reflected in the inherited frontend constitution).

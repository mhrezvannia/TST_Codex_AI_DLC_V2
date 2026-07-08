# Module Vision Document — Shared Platform (LinerCore)

> **Module:** Shared Platform
> **Module type:** Foundational / enabling (explicitly *not* a business module — see Program Vision §4).
> **Parent program:** LinerCore — commercial and equipment-lifecycle platform for container liner / feeder carriers.
> **Derived from:** [Program Vision Document](./program-vision-document.md) v0.3.
> **Technical standards:** [Enterprise Technical Environment Document](./enterprise-technical-environment.md) v1.0 (authoritative for *how*; this document covers *what* and *why*). The module's own Technical Environment Document (with its Conformance table) is forthcoming.
> **Build order:** #1 — no upstream module dependencies; everything depends on it.
> **In MVP:** Yes (reduced).
> **Status:** Draft v0.2 for review — reconciled with Program Vision v0.3. The nine canonical reference sets owned here (including Commodity, Trade-lane, and Region) are now mirrored in Program Vision §4/§5, so reference-data ownership is consistent program-wide. The event bus is technology-agnostic and unchanged by the D&D redesign (it carries the CMM→Booking movement feed; D&D pricing itself is a synchronous Booking↔Charge call, not an event).

### Inheritance note

Per Program Vision §9, this module inherits its **purpose, owned capabilities, integration contracts, cross-cutting standards, and place in the MVP/build order** from the Program Vision. Those are referenced here, not re-derived. Cross-cutting concerns (identity model, security, observability, audit, i18n, standards) are defined once in Program Vision §6 and realised technically in Enterprise Tech-Env v1.0; this document does not restate them except where the Shared Platform is the module that *provides* them.

---

## 1. Executive Summary

The Shared Platform is the foundational layer of LinerCore. It owns the **canonical reference data**, **identity & access**, and the **inter-module event transport** that the three business modules — Charge & Customer Agreement, Customer Booking, and Container Movement Management — all depend on. It is an *enabling* module: its direct consumers are the other modules and a small set of reference-data administrators and platform operators, not external commercial users. Its purpose is to make "**defined once, referenced everywhere**" a structural guarantee rather than a convention — so that every customer, port, region, voyage, currency, charge-code, equipment-type, commodity, and trade-lane has exactly one owner; users authenticate once under one carrier role model; and information moves between modules reliably and traceably. The Shared Platform's success is measured not in revenue or bookings but in the **absence of the failure modes it exists to prevent**: duplicate or disagreeing master data, fragmented logins, and untraceable cross-module flows.

---

## 2. Business Context

### Problem Statement

The program-level problem LinerCore solves lives **at the seams** between pricing, booking, and equipment. A large part of that seam problem is *shared foundations*: the same entities (a customer, a port, a vessel/voyage, a currency, an equipment type) are re-keyed across disconnected tools and the versions disagree; there is no single login or role model; and there is no reliable, traceable way to move information between functions. Without a foundational layer, each business module would re-implement and inevitably diverge on these concerns — recreating exactly the fragmentation LinerCore exists to remove. The Shared Platform exists so that master data, identity, and messaging are solved **once**, centrally, and cannot drift apart.

### Business Drivers

- **Single source of truth.** Directly mitigates the Program Vision §10 risk that "two modules diverge on the meaning of Customer or Container." One owner per canonical entity makes divergence structurally impossible.
- **No re-keying.** The platform-level goal of zero manual re-keying across pricing → booking → billing depends on every module reading the *same* customer, port, voyage, and code data.
- **Greenfield standardisation.** Adopt open standards from day one — UN/LOCODE for locations, enterprise OIDC for identity — rather than retrofitting them.
- **Traceability and auditability.** Charges are money and movements are dispute evidence. A correlation id propagated by the shared event transport is what makes a single booking traceable end-to-end (booking → charge → movement), satisfying the program's audit mandate.

### Target Users and Stakeholders

As an enabling module, the Shared Platform's primary "users" are the other modules; its direct human users are administrators and operators.

| Consumer / Stakeholder | Type | Primary Need from the Shared Platform |
|------------------------|------|----------------------------------------|
| Charge & Customer Agreement | Consuming module | Canonical Customer, Port (+ region hierarchy), Vessel/Voyage, Currency, Charge-code, Equipment-type, Commodity, Trade-lane; reliable event transport |
| Customer Booking | Consuming module | Canonical Customer, Vessel/Voyage + nominal capacity, Port (+ region hierarchy), Equipment-type, Commodity, Trade-lane; event transport; staff identity |
| Container Movement Management | Consuming module | Canonical Port/Location and Equipment-type to reference; event transport; staff identity |
| Reference-data administrator | Human user | Maintain the reference lists (parties, ports, regions, voyages, currencies, charge-codes, equipment-types, commodities, trade-lanes) |
| Platform operator / Standards owner | Human user | Operate identity, event bus, and reference services; enforce single-ownership of canonical entities |
| Security / IT (identity owner) | Stakeholder | One role model, single sign-on, least-privilege access for carrier staff |
| Carrier staff (all functions) | Indirect users | Authenticate once and act across the modules they are entitled to |

*Customer (shipper/BCO) identity is deliberately deferred (see §4 MVP scope and §3 roadmap).*

### Business Constraints

- **Single owner per canonical entity.** The Shared Platform owns the reference entities listed in §3 and *only* those; it owns **no business rules** of the three modules.
- **Authentication is delegated.** The platform authenticates carrier staff via the **enterprise OIDC identity provider** and owns the **authorization / carrier role model**; it does not hand-model identity. (Technical realisation is fixed in Enterprise Tech-Env v1.0.)
- **Vessel/Voyage ownership is split.** The Shared Platform owns the voyage **schedule and nominal capacity**; **allocation and capacity consumption are owned by Booking**. Detailed vessel scheduling and stowage are out of scope platform-wide.
- **MVP boundaries (inherited).** Single carrier entity; USD only; internal carrier-staff identity only.
- **Narrow scope (confirmed).** The module owns exactly three capability areas — reference data, identity & access, event transport. Observability, audit storage, and secrets management are **enterprise Tech-Env standards each module conforms to**, not platform-owned services. The Shared Platform's contribution to auditability is the **correlation-id propagation** carried on the shared event envelope, which lets per-module audit trails be stitched into one cross-module story — not a central audit store.

### Success Metrics

Baselines are TBD (greenfield); measured at first production deployment.

| Metric | Current State | Target State | Measurement Method |
|--------|---------------|--------------|--------------------|
| Canonical entities with exactly one owning record | Manual / duplicated today | 100% single-owned; zero duplicate canonical records | Reference-data audit |
| Cross-module flow traceability | None | A single booking is traceable end-to-end via one correlation id | Trace sampling booking → charge → movement |
| Reference replica freshness at consumers | N/A | Consumers reflect a reference change within the agreed SLA | Change-to-replica lag |
| Internal identity coverage | Fragmented logins | 100% of internal roles via single sign-on, least privilege | Access review |
| Event delivery reliability | N/A | No lost events; consumers idempotent under redelivery / out-of-order | Delivery + dedup metrics |

---

## 3. Full Scope Vision

### Product Vision Statement

When fully realised, the Shared Platform is **invisible infrastructure the business never has to think about**: every module reads canonical reference data it can trust, every user signs in once under one role model, and every cross-module message arrives reliably and is traceable end-to-end — so the three business modules focus purely on pricing, booking, and movement without ever re-solving identity, master data, or messaging.

### Feature Areas

#### Feature Area 1: Reference-Data Services
- **Description:** Canonical ownership and serving of all shared master data, with administrative maintenance and change notification.
- **Key Capabilities:**
  - Own and serve the canonical reference sets: **Customer/Party** (modelled generically as *party + roles*), **Port/Location** (UN/LOCODE; a typed containment tree — Country → Port at MVP, Terminal/Facility deferred — where each node carries its structural parent intrinsically), **Region** (a grouping layer assigned *over* locations — flat regions / trade-areas at MVP — and the basis on which Trade-lanes are defined), **Vessel/Voyage + nominal capacity** (externally fed at maturity; manual at MVP), **Currency/Exchange**, **Charge-code**, **Equipment-type**, **Commodity**, and **Trade-lane**.
  - Maintain **two distinct location structures**, kept deliberately separate: the *structural containment hierarchy* (Country → Port → Terminal) is **intrinsic** — each location is created within its parent, loaded in dependency order, never orphaned and never re-parented after the fact — whereas the *region grouping hierarchy* is **additive and assigned afterward**, letting a location belong to commercial / geographic groupings independently of, and without distorting, its physical containment.
  - Provide an administrative capability to maintain each list.
  - Publish **reference-changed notifications** so consuming modules keep a current local replica (consumers reference by id, never share a database).
  - Enforce **exactly one owner** per canonical entity.
- **User Value:** Defined once, referenced everywhere — removes the disagree-on-master-data failure mode at its root.

#### Feature Area 2: Identity & Access
- **Description:** Authentication of users and the carrier authorization / role model.
- **Key Capabilities:**
  - Authenticate carrier staff via the enterprise OIDC identity provider (single sign-on).
  - Own the **carrier role model** — pricing, sales, booking desk, equipment control, customer service, finance-read — with least-privilege authorization.
  - Authenticate **synchronous inter-service calls** (e.g. a module reading the reference-data Open Host Service; Booking calling Charge for pricing) so only authorized callers reach a capability. *(Event-bus traffic is secured separately — see Feature Area 3 — by broker authentication and topic-level authorization, not module-to-module auth.)*
  - *(Full vision)* Extend identity to **customer-facing users** (shippers/BCOs) for self-serve track & trace.
- **User Value:** One sign-on, one role model, least privilege; secure inter-service communication.

#### Feature Area 3: Inter-Module Event Transport
- **Description:** The reliable asynchronous backbone over which modules exchange events.
- **Key Capabilities:**
  - Reliable publish/subscribe delivery of events between modules, with no point-to-point coupling.
  - A **versioned shared event envelope** — identity, source, type, time, correlation id, schema version — as the common contract every event composes.
  - **Correlation-id propagation** across hops, enabling end-to-end tracing and audit reconstruction.
  - At-least-once delivery with **consumer idempotency** and tolerance of out-of-order / late events.
  - Schema-versioned, compatibility-governed contracts (backward-compatible evolution; breaking changes are new versions).
  - **Controlled access to the bus:** each service authenticates to the broker, and produce/consume rights are authorized **per topic** — so security on the async path is broker authentication + topic-level authorization, with event provenance carried in the envelope's `source` and correlation id (not module-to-module authentication).
- **User Value:** Modules integrate cleanly and independently; every flow is reliable, traceable, and auditable.

> The specific technologies that realise these capabilities — the OIDC provider product, the messaging system and schema governance, and the reference API / change-event mechanism — are fixed in **Enterprise Tech-Env v1.0**, not here. This document stays at the level of *what the platform provides*.

### Integration Points

- **Enterprise OIDC identity provider** — the authentication source the platform conforms to.
- **Vessel schedule / capacity source** — an external feed into the Vessel/Voyage reference at maturity (deferred; manual entry at MVP).
- **UN/LOCODE reference list** — the open standard Port/Location follows; an automated connection to a UN/LOCODE source is **deferred to a later phase**, so at MVP this data is **entered manually** by administrators.
- **The three business modules** — consumers of all three feature areas.

*(External finance, terminal/EDI movement feeds, and DCSA track-and-trace consumers integrate at the business modules, not at the Shared Platform.)*

### User Journeys (Full Vision)

#### Journey 1: A module operates on canonical reference data
1. A module (e.g. Booking) needs Customer, Vessel/Voyage, Port, Equipment-type, Commodity, and Trade-lane.
2. It reads them from the reference services and holds a synced local replica.
3. When an administrator changes a reference value, a reference-changed notification updates the consumer's replica.
**Outcome:** every module operates on the same, current master data — no re-keying, no divergence.

#### Journey 2: A user signs in once and acts across modules
1. A pricing manager signs in via single sign-on.
2. The carrier role model grants least-privilege access across the modules they are entitled to.
3. Their actions carry an identity usable for audit.
**Outcome:** one login, one role model, traceable actions.

#### Journey 3: An event flows reliably and traceably between modules
1. Container Movement records a validated container movement and publishes a movement event.
2. The transport delivers it reliably to Booking; the correlation id ties it to the originating booking.
3. Booking consumes it idempotently, even on redelivery or out-of-order arrival (and may then trigger D&D pricing from Charge).
**Outcome:** cross-module flows are reliable and end-to-end traceable.

#### Journey 4 (full vision): A customer self-serves
1. *(Phase 2+)* An external customer authenticates to self-serve DCSA-aligned track & trace.
**Outcome:** identity extends to customers once customer-facing publication arrives.

### Scalability and Growth

The platform grows along several axes without changing its shape: larger reference volumes (more trade lanes, equipment types, parties); **multi-entity** operation (additional carrier legal entities); **multi-currency** depth with exchange-rate handling; **customer-facing identity**; richer external feeds (vessel schedule, leasing) replacing manual entry; and higher event throughput. The design is chosen so as not to preclude these — a generic *party + roles* model, strict single-owner discipline, and a versioned event envelope.

### Long-Term Roadmap (directional)

| Phase | Shared Platform scope | Cross-platform capability unlocked |
|-------|-----------------------|------------------------------------|
| MVP | Core reference data (incl. Region, Commodity + Trade-lane) + internal identity + event bus; locations at Country → Port; manual voyage/capacity; USD; single entity | Everything else can connect |
| Phase 2 | Customer-facing identity; external vessel-schedule feed; automated UN/LOCODE connection; Terminal/Facility locations; multi-level region hierarchy; groundwork for multi-currency | Customer self-serve track & trace; automated voyages; terminal-level visibility |
| Phase 3 | Multi-entity isolation; multi-currency depth | Multi-company carrier operation |

---

## 4. MVP Scope

### MVP Objective

Provide the **reduced foundation** that lets the three business modules connect for the single-trade-lane end-to-end slice: canonical reference data they can read and replicate, single sign-on under the carrier role model for internal staff, and a reliable, traceable event transport.

### MVP Success Criteria

- [ ] All **nine reference sets** exist and are administrable: Customer/Party, Port/Location (Country → Port; terminals deferred), Region (flat), Vessel/Voyage (+ nominal capacity, manual), Currency (USD), Charge-code, Equipment-type, Commodity, Trade-lane.
- [ ] Locations enforce **structural integrity** — a Port is always created within a Country (no orphans) — and **Regions are assigned over** locations as a separate grouping that Trade-lanes are defined against.
- [ ] Each canonical entity has **exactly one owning record**; consumers reference by id and hold a synced local replica.
- [ ] Internal carrier staff sign in via **single sign-on** under the carrier role model with least-privilege roles.
- [ ] A **voyage with nominal capacity** can be entered manually and read by Booking.
- [ ] An event published by one module is delivered to another **idempotently**, carrying a **correlation id** that ties the cross-module flow together.
- [ ] A single booking is **traceable end-to-end** (booking → charge → movement) via correlation id.

### Features In Scope (MVP)

| Feature | Description | Priority | Rationale for Inclusion |
|---------|-------------|----------|--------------------------|
| Reference services for all nine sets (read + admin maintenance) | Serve and maintain the canonical lists | Must Have | Nothing connects without canonical references |
| Location structures: structural tree (Country → Port) + flat Region grouping | Containment parent is intrinsic and loaded in dependency order; regions are assigned over locations and feed Trade-lane | Must Have | Locations need referential integrity from the start; regions underpin trade-lanes |
| Reference-change notification to consumers | Notify consumers so local replicas stay current | Must Have | Prevents divergence; keeps replicas fresh |
| Manual Vessel/Voyage + nominal capacity entry | Admin enters voyages and their nominal capacity | Must Have | Booking must validate capacity; external feed deferred |
| Authentication (enterprise OIDC) + carrier role model (internal roles) | Single sign-on, least-privilege authorization | Must Have | One login, one role model |
| Service-to-service authentication (synchronous seams) | Authenticate direct calls — reference-data reads, Booking → Charge pricing | Must Have | Secures the synchronous seams; event-bus security is broker authentication + topic authorization, not module-to-module auth |
| Inter-module event transport (versioned envelope + correlation id + idempotent delivery) | The async backbone with traceability | Must Have | Enables decoupled integration and end-to-end tracing |
| Currency = USD (single entry) | One currency only | Must Have | MVP is USD only |
| Generic Party model (party + roles); shippers/BCOs populated | Party records carry roles; direct shippers/BCOs only at MVP | Must Have | Does not preclude later customer types |

### Features Explicitly Out of Scope (MVP)

| Feature / Capability | Reason for Deferral | Target Phase |
|----------------------|---------------------|--------------|
| Customer-facing identity (shippers/BCOs self-serve) | Internal visibility only in MVP | Phase 2 |
| External vessel-schedule / capacity feed | Manual voyage entry proves the slice | Phase 2 (tied to deferred schedule question) |
| Automated UN/LOCODE connection / feed for Port/Location | Manual entry suffices for the MVP slice | Phase 2 |
| Terminal / Facility level of the location tree | Country → Port is sufficient for the MVP slice | Phase 2 |
| Multi-level region hierarchy (continent → region → sub-region) and multiple overlapping grouping dimensions | A single flat region set suffices at MVP | Phase 2 |
| Multi-currency / exchange-rate handling | USD only in MVP | Phase 2/3 |
| Multi-entity (multiple carrier legal entities) | Single entity in MVP | Phase 3 |
| Additional customer *types* as customers (forwarders/NVOCCs) | Deferred program open question; Party model kept generic to absorb it later | TBD |
| Shared observability / audit stores as platform services | Enterprise Tech-Env standards each module conforms to — not platform-owned services (narrow scope confirmed) | N/A |
| Leasing-partner feeds (lease movements) | Entered manually at container registration **in Container Movement Management**, not here | Phase 2 |

### MVP User Journeys

#### Journey A: Reference bootstrap & sync
A consuming module reads the MVP reference sets, holds a local replica, and updates it on a reference-changed notification (as Full-Vision Journey 1, with MVP reference sets).
**Limitation vs Full Vision:** manual voyage entry; USD only; internal users only.

#### Journey B: Internal sign-on under the role model
An internal staff user signs in via SSO and is granted least-privilege access across entitled modules (as Full-Vision Journey 2, internal only).
**Limitation vs Full Vision:** no customer-facing identity.

#### Journey C: Reliable, traceable event
An event is published by one module and consumed idempotently by another, carrying a correlation id (as Full-Vision Journey 3).
**Limitation vs Full Vision:** same mechanism, lower volume.

### MVP Constraints and Assumptions

- **Assumption:** the enterprise OIDC provider is available for internal staff — **Risk if wrong:** no single sign-on; mitigate by standing the provider up early (Tech-Env item).
- **Assumption:** voyages and nominal capacity can be entered manually — **Risk if wrong:** Booking cannot validate capacity; manual entry is the agreed MVP mitigation.
- **Assumption:** Port/Location data (Country → Port, UN/LOCODE) can be **entered and maintained manually** at MVP — **Risk if wrong:** higher admin effort and keying error; mitigated by validation. An automated connection to a UN/LOCODE source is deferred to a later phase.
- **Accepted Limitation:** Vessel/Voyage is held as **schedule + nominal capacity only**; allocation/consumption is owned by Booking; detailed scheduling is out of scope.
- **Accepted Limitation:** single carrier entity; USD only; internal identity only.
- **Accepted Limitation:** locations are held at **Country → Port** (UN/LOCODE), terminals deferred; the **Region** grouping is a **single flat level** at MVP and is the basis for Trade-lanes.
- **Accepted Limitation:** the **Trade-lane** set exists, but *which* lanes (and therefore which regions) are populated depends on the deferred trade/regulatory-footprint decision (Program §10); MVP populates only the single lane the slice needs.

### MVP Definition of Done

- [ ] All "Must Have" features implemented and tested.
- [ ] Single-owner reference model verified — no duplicate canonical records.
- [ ] Each consuming module successfully reads, replicates, and reacts to a change in every reference set.
- [ ] Internal SSO and the carrier role model work with least privilege.
- [ ] An end-to-end correlation id is demonstrated across booking → charge → movement.
- [ ] The module's Technical Environment Document — including its Conformance table to Enterprise Tech-Env v1.0 — is completed.
- [ ] Stakeholder sign-off (Platform / Architecture + Security / IT).

---

## 5. Risks and Dependencies

### Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Two modules diverge on the meaning of Customer / Container | Medium | High | Single ownership here + reference-change notifications + reference-by-id (this module *is* the mitigation) |
| A consumer prices/books on a stale reference replica | Medium | Medium | Change notifications + a freshness SLA; the pricing path itself is synchronous and strongly consistent, so unaffected |
| Manual voyage / capacity entry error | Medium | Medium | Validation + admin discipline; external feed in a later phase |
| Carrier role model too coarse or too fine for least privilege | Low | Medium | Start from the program role list; iterate with Security/IT |
| Trade-lane / Commodity reference sets under-specified pending the footprint decision | Medium | Low | Populate minimally for the slice; expand once the footprint is decided |

### External Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Enterprise OIDC identity provider | IT | TBD |
| Vessel schedule / capacity source | Operations | Deferred; manual entry at MVP |
| UN/LOCODE reference list | External standard | Standard available; automated connection deferred, manual entry at MVP |
| Enterprise Technical Environment v1.0 (technical standards) | Platform / Architecture | Issued |

### Open Questions

Inherited from the Program Vision (resolve before this module enters Construction):

- [ ] **Customer types** (Program §10): **MVP is resolved to direct shippers/BCOs only**; whether the Party model must admit forwarders/NVOCCs *as customers* remains the deferred full-vision question — Party is kept generic (*party + roles*) so this does not require rework.
- [ ] **Trade/regulatory footprint** (Program §10): which trade lanes/regions populate the Trade-lane set at MVP, and are US trades in scope (FMC implications)? — Also gates the primary/DR site decision in the Tech-Env.
- [ ] **Vessel schedule source** (Program §10): external feed vs. continued manual entry; the capacity-allocation model (owned by Booking).

Module-level (raised here; recommended MVP defaults given):

- [ ] **Reference-data freshness SLA** — the target change-to-replica lag, to be agreed with the consuming modules.
- [ ] **Commodity granularity** — a flat code list, or a hierarchy (e.g. HS-aligned)? *Recommend a flat code list at MVP.*
- [ ] **Trade-lane definition** — defined as origin↔destination **Region** pairs (regions being the flat grouping layer), or as port pairs? *Recommend region pairs at MVP.*
- [ ] **Region grouping dimensions** — MVP uses a single flat region set; do later phases need multiple overlapping dimensions (e.g. trade region vs. customs / reporting region)? *Recommend a single dimension at MVP.*

---

## How This Document Feeds Into AI-DLC

AI-DLC runs per module. This Module Vision Document — together with the Program Vision and the Enterprise Tech-Env — is the context the Shared Platform's Inception phase consumes.

| Module Vision Section | AI-DLC Stage (this module) | How It Is Used |
|-----------------------|----------------------------|----------------|
| Executive Summary (1) | Workspace Detection | Classifies the module as foundational/enabling |
| Business Context (2) | Requirements Analysis | Drives clarifying questions; supplies consumers, constraints, and metrics |
| Full Scope Vision (3) | User Stories, Application Design | Source for the reference, identity, and event-transport capabilities |
| MVP Scope (4) | Workflow Planning | Sets which capabilities are built now vs deferred |
| Features In/Out of Scope (4) | Code Generation | Defines exactly what is built in this iteration |
| Risks and Dependencies (5) | All stages | Informs risk assessment and integration testing |
| Open Questions (5) | Requirements Analysis | Become clarifying questions in the module's question files |

---

*Draft v0.2, derived from Program Vision v0.3 and Enterprise Technical Environment v1.0. The three inherited open questions should be resolved before this module enters AI-DLC Construction; the two module-level reference-shape questions can be settled with the recommended MVP defaults.*

# LinerCore ERP — Business-Logic, DCSA & UI/UX Gap Analysis

> Reviewer: Claude (Opus 4.8) · 2026-07-11 · Verified against source, not docs alone.
> Companion to [`codex-review-findings.md`](codex-review-findings.md) (backend integrity) and [`erp-workflow-map.md`](erp-workflow-map.md) (diagrams).
> Purpose: this is the gate review before the real company ERP. The question answered here is **"is the practice output useful and working?"** — and specifically where the *domain model, field naming, DCSA alignment, and UX* diverge from what the docs promised.

## Bottom line

The docs describe a **real liner-shipping ERP** with a DCSA-aware maritime domain (multi-leg routing, vessel/voyage, equipment units, D&D, invoicing, track & trace). Codex implemented a **generic CRUD-with-a-state-machine skeleton** wearing that vocabulary. The layering and lifecycle code are good; the **domain itself is degenerate**, the **field names silently diverge from the contracts**, **DCSA exists only in prose**, and the **UI is a developer-facing "workbench," not an ERP product**. It is not yet useful/working in the sense you need — but the bones are sound enough to refine rather than restart.

---

## Part 1 — Business-logic fidelity (docs vs. code)

### 1.1 The Booking domain is a flat origin→destination toy vs. a maritime routing model

The authoritative `booking.confirmed` contract specifies ordered `routing[]` legs (POL → transshipment → POD) each with `loadUnLocode`, `dischargeUnLocode`, `voyageId`, and an `equipment[]` array with `equipmentTypeCode`, `quantity`, and ISO-6346 `equipmentId`. The implemented [`Booking.java`](services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/model/Booking.java:8) record is:

```
Booking(id, bookingNumber, revision, status,
        customerId, originLocationId, destinationLocationId, equipmentType,
        pricingSnapshot, exceptions, dndTriggerCandidates, lifecycleEvents, attributes)
```

- **No `routing[]`** — a single origin/destination pair. Transshipment, POL/PTS/POD, legs, and per-leg voyages are impossible to express.
- **No `equipment[]`** — a single `equipmentType` string; container number is smuggled into the stringly-typed `attributes` map as `containerId`.
- **No voyage, ETD/ETA, cutoffs, commodity, reefer/DG, quantities** — all named in the Booking module profile (Vision §4) and the `pricing.request` contract, none modeled.

This is the single most important finding: **the shape of the core aggregate is wrong**, so every layer above it (event payload, UI, contract test) inherits a model that cannot represent a real booking.

### 1.2 Missing owned capabilities (measured in code)

| Capability (owner, per Vision §4) | In code | Evidence |
|---|---|---|
| Tariff / Surcharge / Local charge (Charge) | ❌ | `tariff` = 0, `surcharge` = 0 hits |
| D&D rule types + rates (Charge, "authoritative ruleset") | 🟡 shallow | D&D pricing ports exist; no real ruleset |
| Capacity validation vs Vessel/Voyage (Booking) | ❌ | `capacity` ≈ 0; `validate()` only checks reference activeness |
| Equipment assignment + container numbers (Booking) | 🟡 | single string + attributes bag |
| Invoice emission `invoice.booking`/`invoice.dnd` (Booking) | ❌ | `invoice` ≈ 0 hits |
| Reefer/DG indicators, commodity on booking (Booking) | ❌ | not modeled |
| Vessel/Voyage/Sailing reference (Shared Platform) | ❌ | `voyage` = 5, `vessel` = 1; **not a seeded reference set** |
| DCSA track & trace OHS (CMM) | ❌ | `dcsa` = 0 in code |
| EDI ingestion (CMM/Booking ACL) | ❌ | Phase-2 per docs — acceptable to defer |

### 1.3 Canonical reference data is under-seeded

Vision §4 lists nine Shared-Platform canonical entities. Seeds (`infrastructure/seeds/*.json`) cover **Currency, Party/Customer, Location, Region, Trade-lane, Commodity** — but **Vessel/Voyage, Charge-code, and Equipment-type are not seeded as reference sets**, even though Booking's `validate()` calls `activeReference("equipment-type", …)`. The booking flow validates against reference sets that the seed layer doesn't guarantee exist.

### 1.4 Field-naming drift (docs → code) — a correctness and integration hazard

The contracts are the published language; the code renamed fields silently. Worse, the code is inconsistent **with itself**.

| Canonical (contract / Vision §5) | In domain/UI code | Where | Problem |
|---|---|---|---|
| `routing[].loadUnLocode` / `dischargeUnLocode` | `originLocationId` / `destinationLocationId` | `Booking.java`, `BookingWorkbench.tsx` | Wrong concept (flat vs. legs) + wrong name |
| `routing[].voyageId` | — | absent | Missing |
| `equipment[].equipmentTypeCode` | `equipmentType` | `Booking.java` | Name drift |
| `equipmentTypeCode` | `equipmentTypeId` | `HttpContainerMovementClient.java:36` | **Code disagrees with itself** |
| `equipment[].equipmentId` (ISO 6346) | `attributes.containerId` | `BookingWorkbench.tsx:73` | Untyped, wrong name |
| `bookingRevision` | `revision` | `Booking.java` | Minor drift |
| `moveCode` (DCSA DISC/GTOT/GTIN) | `movementStatus` (ARRIVED/DELIVERED) | `BookingApplicationService.java:307` | Non-DCSA vocabulary |

**Why it matters:** the whole point of the contract-first / published-language approach (which the docs invest heavily in) is that names *are* the interface. When the emitted event says `equipmentTypeId` and the schema says `equipmentTypeCode`, a real Schema-Registry/Pact gate would reject it — the reason it doesn't is finding H2 in the backend review (the gate only checks string existence).

---

## Part 2 — DCSA alignment

**The docs are commendably DCSA-aware; the code has zero DCSA.** `dcsa` appears 55× across 8 docs (T&T v2.2 move codes DISC/GTOT/GTIN, `eventClassifierCode` PLN/EST/ACT, `facilityTypeCode`, laden/empty indicator, UN/LOCODE, ISO 6346, "DCSA Open Host Service" for track & trace) and **0×** in any `.java`/`.ts`/`.avsc`.

### What to adopt, and roughly in what order

Since this may go commercial, treat DCSA as the **internal published language**, not a future export adapter — retrofitting it later is far costlier.

| DCSA standard | Use for | Priority |
|---|---|---|
| **UN/LOCODE + ISO 6346 + SMDG** identifiers | Ports, container numbers, terminals — as typed value objects, not free strings | **Now** (foundational) |
| **DCSA Track & Trace 2.2/3.0** event model | CMM's movements: `TRANSPORT`/`EQUIPMENT`/`SHIPMENT` events, `eventType`, `eventClassifierCode` (PLN/EST/ACT), `equipmentEventTypeCode` (LOAD/DISC/GTIN/GTOT/STUF/STRP), `emptyIndicatorCode` | **Now** — this is the `containermovement.status` contract's actual shape |
| **DCSA Booking (eBooking)** | Booking request/confirm payloads, `routing`/`transport plan`, `requestedEquipments` | **Next** — replaces the flat booking model |
| **DCSA OVS** (Operational Vessel Schedules) | Vessel/Voyage reference data feed | **Next** |
| **DCSA eBL** | Bill of Lading (future Documentation module) | Later (Phase 3, per Vision roadmap) |

**Concrete first move:** rebuild the two async event schemas (`booking.confirmed`, `containermovement.status`) to the DCSA field model *before* refining the aggregates — the contracts already reference DCSA, so this closes the doc↔code gap at the highest-leverage point. Then propagate the DCSA value objects (UN/LOCODE, ISO 6346, move codes) down into the domain records so the field-naming drift in Part 1.4 disappears structurally.

---

## Part 3 — UI/UX review (senior-designer lens)

I reviewed the source of all five apps and `@erp/ui`. The verdict: **this is a set of engineer "workbenches," not an ERP application.** It demos endpoints; it does not let a user *do their job*. Your instinct ("UI/UX is broken," "no detail page") is correct and is the tip of a larger structural problem.

### 3.1 There is no application — there are five disconnected pages

- **No app shell.** No top bar, no global navigation, no user menu, no breadcrumbs. Each module is a separate Next.js app (`apps/auth`, `apps/booking`, …) with a single page. The user's mental model — *log in once, move between modules* — is impossible; there's no shell to move within.
- **Auth is a disconnected island.** `apps/auth` has real sign-in/session/request-access pages, but the business apps ignore it: [`BookingWorkbench.tsx:71`](apps/booking/app/BookingWorkbench.tsx:71) hardcodes `actorSubjectId: "local-user"`. So "login then use the app" is not wired at all — you can't actually log in *to* Booking.
- **No routing, no list, no detail.** Every module is one screen: a create form + a flat list + an inline "status" panel. There is **no `/[id]` detail route anywhere** (confirmed: no `booking/[id]`, no `journeys/[id]` page). Your example — "no detail page for bookings" — is literally true for every entity in the system.

### 3.2 The information architecture is wrong for ERP

ERP users live in **list → detail → action** loops with deep records. The current "workbench" crams create + list + status into one non-scalable screen. There is no:
- filtering, search, sorting, pagination, or saved views on lists;
- master-detail record page (summary, tabs for routing/equipment/charges/journey/history, action rail);
- cross-entity linking (booking ↔ its container journey ↔ its charges ↔ its invoice);
- empty / loading / error / permission states beyond a single status string.

### 3.3 The design system is a placeholder, styling is ad-hoc

- **`@erp/ui` is a single file** (`packages/ui/src/index.tsx`) exporting essentially one `WorkflowCommandCenter` widget — despite the Enterprise Tech-Env mandating **atomic design (atoms/molecules/organisms/templates/skeletons)**. There is no component library, no primitives (Button, Input, Table, Badge, Dialog), no form abstractions.
- **Inline styles with hardcoded hex everywhere.** [`BookingWorkbench.tsx:186-206`](apps/booking/app/BookingWorkbench.tsx:186) defines a local `styles` object with literals like `#0c2742`, `#11427a`, `#f4f7fb`. No design tokens, no theme, no dark mode, and every app will drift to its own palette. This is unmaintainable and off-brand by construction.
- **No accessibility baseline.** Some `aria-live` on status (good), but color-only status encoding, no focus management, no keyboard nav for the list, unlabeled icon affordances, and contrast not verified. An ERP shipped to customers must clear WCAG AA.
- **Not responsive.** Fixed three-column grid (`300px minmax(0,1fr) 360px`) with no breakpoints.

### 3.4 The UI is domain-illiterate

Because it sits on the degenerate model (Part 1), the Booking form asks for "Origin / Destination / Equipment / Container" as four free-text boxes. A real booking screen needs: customer + agreement lookup, commodity, a **routing builder** (add legs, pick UN/LOCODE ports, choose voyages), **requested equipment lines** (type × quantity, reefer/DG params), cutoffs, and a **charges panel**. The form doesn't just look plain — it can't capture a booking.

### 3.5 What "working UI/UX" should look like (target)

1. **One app shell** (single Next.js app or a proper micro-frontend host behind the gateway) with persistent left nav across modules, top bar with user/session, and breadcrumbs. Login gates the shell; session flows to every module (kill the `local-user` hardcode).
2. **Per module: List page** (server-driven table: filter, search, sort, paginate, status chips, row actions) → **Detail page** (master-detail: header + lifecycle timeline + tabbed sections + right-hand action rail) → **cross-links** between related records.
3. **A real design system in `@erp/ui`**: tokens (color/space/type/radius/elevation), primitives (Button, Input, Select, Combobox for reference lookups, Table, Badge, Tabs, Drawer, Toast, EmptyState, Skeleton), and form patterns. Every app consumes it; no local `styles` objects.
4. **State discipline**: explicit loading (skeletons), empty, error, and no-permission states for every data surface.
5. **Domain-true forms**: routing builder, equipment lines, reference-data comboboxes backed by the reference service, commodity/reefer/DG capture.
6. **Accessibility + responsiveness as gates**: WCAG AA contrast, keyboard paths, focus rings, responsive breakpoints — enforced in CI, not left to chance.

---

## Part 4 — Prioritized path to "useful & working" (the gate to the real project)

Ordered by leverage. Each is a refinement of what exists, not a rewrite.

1. **Fix the Booking aggregate to the DCSA model** (routing legs, equipment lines, voyage, commodity, reefer/DG). Everything else inherits from this. *(Part 1.1, Part 2)*
2. **Rebuild the two event schemas to DCSA field names** and make code emit them exactly; kill the `equipmentTypeId`/`equipmentTypeCode` self-disagreement. *(Part 1.4)*
3. **Make the async events real** (backend findings C1–C5) so the model actually flows between modules.
4. **Seed the missing reference sets** (Vessel/Voyage, Equipment-type, Charge-code) and add the Charge tariff/surcharge model. *(Part 1.2, 1.3)*
5. **Build the app shell + auth wiring + one real List→Detail module** (Booking first) as the pattern the others copy. *(Part 3.1–3.2)*
6. **Stand up `@erp/ui` as a real design system** and migrate one app onto it as the reference. *(Part 3.3)*
7. **Add invoice emission and DCSA track & trace OHS** to close Journey 1 end-to-end. *(Part 1.2)*

**Do not green-light the real company ERP until at least 1–5 are done and one full Journey-1 booking has been driven end-to-end over the real runtime** — that is the concrete definition of "the practice output became useful and working."

---

## Appendix — canonical field-name reference (use these names everywhere)

| Concept | Canonical name | Standard |
|---|---|---|
| Port / location | `unLocode` (5-char UN/LOCODE) | UN/LOCODE |
| Container number | `equipmentReference` (ISO 6346) | DCSA / ISO 6346 |
| Equipment type | `isoEquipmentCode` / `equipmentTypeCode` | DCSA / ISO 6346 |
| Vessel voyage | `carrierVoyageNumber` + `universalVoyageReference` | DCSA OVS |
| Move event | `equipmentEventTypeCode` (LOAD/DISC/GTIN/GTOT/STUF/STRP) | DCSA T&T |
| Event certainty | `eventClassifierCode` (PLN/EST/ACT) | DCSA T&T |
| Empty/laden | `emptyIndicatorCode` (EMPTY/LADEN) | DCSA T&T |
| Booking key | `carrierBookingReference` + `bookingRevision` | DCSA Booking |

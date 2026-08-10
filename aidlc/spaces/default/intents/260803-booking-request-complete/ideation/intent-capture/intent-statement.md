<!-- BINDING TEMPLATE. The ## headings below are required (required-sections sensor). Fill each section; keep the headings. -->

# Intent Statement — W3-04 Booking Request Completeness

## Context Pack (read before starting)

1. `docs/intents/W3-04-booking-request-completeness.md`
2. `docs/intents/00-INTENT-BACKLOG.md`
3. `docs/aidlc-v2-slicing-playbook.md`
4. `docs/program-vision-document.md` §§3–5 and §7
5. `docs/erp-workflow-map.md` §1 steps B–F
6. `docs/erp-business-ui-gap-analysis.md` Parts 1.1, 3.4, and 4
7. `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md`
8. `docs/enterprise-contracts/async-event-contract-booking-confirmed.md` §§4–6
9. Closed W0-02, W1-01, W2-02, and W2-03 intent outputs and live-proof manifests
10. Current Booking domain/API/UI entry points named in the source W3-04 intent, including `Booking`, `RoutingLeg`, `EquipmentAssignment`, `CreateBookingCommand`, `BookingApiController`, both Booking create forms, and `packages/shared-types/src/index.ts`
11. `design-system/linercore/MASTER.md`, `design-system/linercore/SESSION-PROMPT.md`, and reviewed Booking queue/create/detail designs under `docs/ui-ux-design/`
12. For Refined Mockups only, after Requirements Analysis and User Stories approval: `docs/ui-ux-prompts/25-booking-request-completeness.md` and `docs/ui-ux-prompts/EXECUTION-GUIDE.md`, used with UI/UX Pro Max

## Intent

A booking-desk or customer-service user can create, validate, price, confirm, and reopen a commercially usable FCL-dry booking request. The request captures the approved commercial party/customer references, customer booking reference, cargo and canonical commodity facts, requested schedule, and equipment type × quantity without implying that a physical container is already assigned. Those facts remain typed and consistent through persistence, live reference validation, live pricing, confirmation, and Booking detail. Booking is the driver; Shared Platform and Charge are contract reviewers and contributors.

## Problem Statement

The current W1 walking-skeleton record is too thin for commercial booking work. The create path lacks the approved party, cargo, package, weight, and operational schedule dictionary; it fixes equipment quantity at one and requires a physical `equipmentId` before allocation has occurred. This forces users either to omit material facts or invent an assignment, undermining pricing accuracy, confirmation integrity, legacy-record handling, and downstream trust.

## Target Customer

Primary customers are authenticated booking-desk and customer-service users responsible for turning a customer request into a validated, priced, confirmed dry booking. Secondary beneficiaries are Charge, CMM, operations, support, and audit users who depend on exact, non-fabricated booking facts and stable contracts.

## Success Metrics

- A user can create and reopen one FCL-dry booking with equipment quantity greater than one and no `equipmentId`, with every entered commercial fact preserved.
- Invalid or stale canonical references block confirmation without losing user input; valid references are checked through the live Reference Data OHS.
- The live pricing request carries the exact party, commodity, POL/POD, equipment type, requested date, and quantity, and the resulting quote scales by quantity.
- Confirmation publishes a schema-valid `booking.confirmed` with full current routing/equipment state and no fabricated container identifier.
- The complete request and pricing basis are visible in the shared shell across required loading, denied, validation, pending, conflict, provider-error/retry, degraded-reference, success, accessibility, and responsive states.
- The live acceptance run, contract gates, accessibility evidence, `aidlc-audit`, and `erp-fidelity-audit` are green.

## Initiative Trigger

The program now has the prerequisite live booking spine, canonical reference sets, shared Booking UI baseline, and date/quantity-aware pricing provider. These dependencies are closed, making W3-04 ready to replace the walking-skeleton request with the next commercially usable vertical slice while preserving the already published contracts.

## Initial Scope Signal

Scope is `feature` at Standard depth and Standard test strategy. The change crosses existing UI, API, domain, persistence, live reference validation, synchronous pricing, and asynchronous confirmation seams, but remains bounded to one FCL-dry route and one requested equipment line.

## Vertical Slice Definition

The user enters the approved party, cargo, requested-schedule, and one equipment-request line in the canonical Booking UI → live Reference Data validates canonical choices → Booking persists and reopens the typed draft → Booking sends the exact pricing-determining subset through the real `pricing.request` seam → the user confirms → `booking.confirmed` exposes the complete current routing/equipment quantity without a fabricated container assignment → Booking detail shows the complete request and pricing basis.

- **Layers cut through:** shared-shell Booking UI · BFF/API · Booking domain · persistence · Reference Data OHS · Charge pricing seam · `booking.confirmed` compatibility · Booking detail
- **Thinnest viable form:** one FCL-dry routing leg, one requested equipment line with editable positive quantity, USD, canonical commodity, requested departure, and no assigned container number at initial creation or confirmation
- **Explicitly deferred to later intents:** amendment/reconfirmation and container assignment (W3-03), multi-leg/transshipment routing (P2-04), reefer/DG parameters and surcharges (P2-06), cancellation (P2-03), multi-currency (P3-02), special equipment/full reefer depth (P3-03), and eBL issuance (P3-04)

## In Scope / Out of Scope

**In scope**

- Commercial baseline fields: booking party/customer reference, customer booking reference, shipper reference, optional consignee and notify-party references, cargo description, canonical commodity, package count/type, gross weight, and optional volume.
- Required-before-confirmation rules: booking party/customer, shipper, cargo description, canonical commodity, package count/type, and gross weight; explicit units and positive numeric values.
- Requested departure as a POL-local date; carrier voyage number, ETD/ETA, cargo cutoff, and documentation deadline as read-only, timezone-aware facts derived from the selected voyage and snapshotted on confirmation.
- Equipment type × editable quantity with an absent/optional physical `equipmentId` until later assignment.
- Create/read/detail UI, API/domain/persistence mappings, live reference validation, exact pricing mapping, confirmation compatibility, and safe authoritative upcasting of existing records.
- Complete operational states, keyboard/focus behavior, and responsive evidence within the one LinerCore shell.

**Out of scope**

- Shipping-instruction fields, Bill of Lading/document issuance, multi-leg routing, reefer/DG entry or pricing, rolls/splits, cancellation, capacity allocation, CMM equipment assignment, non-USD pricing, and special equipment depth.
- Party PII or cargo expansion of `booking.confirmed`; Booking retains these facts unless a separately approved consumer requirement changes the contract additively.
- Fabricated defaults for legacy records or physical container identifiers.

## Actors & Journey

1. A booking-desk or customer-service user opens New Booking in the authenticated LinerCore shell.
2. The user selects canonical booking customer, shipper, optional consignee/notify party, commodity, locations, voyage, and equipment type; enters the customer reference, cargo measures, POL-local requested-departure date, and quantity; then saves without a container number.
3. Booking validates reference-backed facts against the live Reference Data service and preserves all input when correction or retry is required.
4. Booking derives read-only voyage schedule facts, persists the complete request, and sends the exact pricing basis to the live Charge endpoint.
5. The user reviews the itemised result and confirms the booking.
6. Booking detail shows the persisted request, schedule snapshot, and pricing basis; CMM receives only the contractually approved route/equipment state, with `equipmentId` absent until later assignment.

## Cross-Module Seams (must be real)

- **Shared Platform → Booking:** live lookup and validation of party/customer, commodity, UN/LOCODE locations, voyage, and ISO equipment type through the Reference Data OHS. No copied masters or free-text substitutes for canonical facts.
- **Booking → Charge:** the existing `pricing.request` contract receives the exact party, commodity, port pair, equipment type, requested date, and quantity. Repricing follows the contract's pricing-determining fields and failure semantics; no guessed defaults or attributes-only mapping.
- **Booking → CMM:** the published `booking.confirmed` contract carries full current `routing[]` and `equipment[]`; `equipmentId` is absent until assignment. Party PII and cargo stay within Booking.
- **Frontend:** Booking owns page composition inside the shared shell and consumes `@erp/ui`; W3-04 creates no second shell, local theme, authentication surface, or shared-primitive fork.

## Standards Alignment

- UN/LOCODE identifies load and discharge places.
- ISO 6346 size/type codes identify requested equipment; an ISO 6346 equipment identifier appears only after physical assignment.
- DCSA-aligned party, booking, cargo, routing, schedule, and equipment names will be frozen in the field dictionary before Application Design and used consistently across domain, REST, persistence, pricing fixtures, and events.
- Party/customer data is PII-bearing. Booking stores stable references and only the minimum approved snapshot/audit facts.
- Contract evolution remains additive/BACKWARD within the current major. Existing records are upcast only from authoritative data or rendered explicitly incomplete; values are never invented.

## Definition of Done (observed, not "tests pass")

On the live Compose stack:

1. Create one FCL-dry booking containing the approved commercial baseline, one route/voyage, requested departure, and an equipment quantity greater than one, with no `equipmentId`.
2. Reload draft and detail views and observe every entered fact round-trip from persistence.
3. Observe live canonical-reference validation; an invalid or stale reference blocks confirmation while preserving input.
4. Price through the real Charge endpoint and observe the exact party, commodity, dates, equipment type, and quantity on the request and quantity-scaled charges in the response.
5. Confirm and observe a schema-valid `booking.confirmed` carrying full routing/equipment quantity with no fabricated container identifier.
6. Observe the complete request, derived schedule snapshot, and pricing basis on Booking detail in the shared shell.
7. Prove denied, validation, duplicate-submit, provider-error/retry, conflict, degraded-reference, and success states; keyboard/focus behavior; and responsive evidence at 375, 390, 768, 1024, and 1440 px.
8. Observe green contract, accessibility, live acceptance, `aidlc-audit`, and `erp-fidelity-audit` gates.

## Dependencies

- **W1-01 — live booking spine:** supplies the working create → validate → price → confirm path and live proof conventions.
- **W0-02 — canonical reference sets:** supplies live vessels, voyages, equipment type codes, charge codes, and reference-validation behavior.
- **W2-02 — shared Booking UI baseline:** supplies the one-shell Booking queue/create/detail experience and LinerCore design contract.
- **W2-03 — live pricing provider:** supplies the date/quantity-aware Charge endpoint and contract proof.

All are closed; W3-04 has no dependency on a parallel in-flight intent.

## Suggested Scope & Sizing

Retain `feature` scope. A likely decomposition is approximately five vertical units: field dictionary and typed create/read/detail; party/commodity/cargo validation; requested schedule, quantity, optional later assignment, and legacy upcast; exact live pricing and confirmation mapping; shared-shell operational states/accessibility/responsive evidence. Each unit must include all affected layers and seams rather than being split by technical layer.

## Open Questions

No Intent Capture question remains open. The ten framing and completeness questions—including the formerly open field-dictionary and schedule questions—are resolved in `intent-capture-questions.md`. Later stages may refine field lengths, code lists, precision, error copy, authorization, and acceptance criteria without reversing these confirmed intent-level decisions.


# Intent Statement — W3-04 Booking Request Completeness

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §§3–5 and §7 (Booking request, confirmation, reference ownership, and MVP boundaries)
2. `docs/erp-workflow-map.md` §1 steps B–F and `docs/erp-business-ui-gap-analysis.md` Parts 1.1, 3.4, and 4
3. `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md` (`pricing.request` fields, validation, repricing, and failure semantics)
4. `docs/enterprise-contracts/async-event-contract-booking-confirmed.md` §§4–6 (full routing/equipment state, optional later `equipmentId`, and BACKWARD evolution)
5. W1-01, W0-02, W2-02, and W2-03 outputs: the live quote-to-cash spine, canonical reference sets, shared Booking UI baseline, and quantity/date-aware pricing provider
6. Current Booking entry points: `services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/model/Booking.java`, `services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/model/RoutingLeg.java`, `services/booking-service/domain-core/src/main/java/com/linercore/platform/booking/domain/model/EquipmentAssignment.java`, `services/booking-service/application-service/src/main/java/com/linercore/platform/booking/applicationservice/command/CreateBookingCommand.java`, `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java`, `apps/booking/app/bookings/new/BookingCreateForm.tsx`, `apps/shell/app/booking/new/BookingCreateForm.tsx`, and `packages/shared-types/src/index.ts`
7. `design-system/linercore/MASTER.md`, `design-system/linercore/SESSION-PROMPT.md`, and the reviewed Booking queue/create/detail designs under `docs/ui-ux-design/`

## Intent

A booking-desk or customer-service user can create a commercially usable FCL-dry booking request instead of a W1 walking-skeleton record: the request captures the approved party/customer references, customer reference, cargo and canonical commodity facts, requested schedule, and requested equipment quantity without pretending that a physical container is already assigned. Those facts remain typed and consistent through persistence, live reference validation, live pricing, confirmation, and Booking detail. **Driver: Booking team; Shared Platform and Charge are contract reviewers/contributors.**

## Vertical Slice Definition

One complete dry booking request end-to-end: enter the approved party, cargo, schedule, and one equipment-request line in the canonical Booking UI → validate reference-backed fields through the live Reference Data OHS → persist and reopen the typed draft → send the pricing-determining subset through the real `pricing.request` seam → confirm → observe the full current routing/equipment state on `booking.confirmed` and the complete request on Booking detail.

- **Layers cut through:** shared-shell Booking UI · BFF/API · Booking domain · persistence · Reference Data OHS · live Charge pricing seam · `booking.confirmed` compatibility · Booking detail
- **Thinnest viable form:** one FCL-dry routing leg, one requested equipment line with editable quantity, USD, canonical commodity, requested departure date, and no assigned container number at initial creation/confirmation
- **Explicitly deferred to later intents:** amendment/reconfirmation and container assignment (W3-03), multi-leg/transshipment routing (P2-04), reefer/DG parameters and surcharges (P2-06), multi-currency (P3-02), special equipment/full reefer depth (P3-03), and eBL issuance (P3-04)

## In Scope / Out of Scope

- **In:** a requirements-approved field dictionary for the FCL-dry booking request; typed party/customer and customer-reference fields; canonical commodity and cargo facts; requested departure and voyage schedule facts; equipment type × quantity; optional/unassigned `equipmentId` until later assignment; create/read/detail UI; BFF/API/domain/persistence mappings; live reference validation; exact `pricing.request` mapping; confirmation compatibility; migrations/upcasting for existing W1 records; complete loading/denied/validation/pending/conflict/error/degraded/success behavior.
- **Out:** multi-leg routing (P2-04); reefer/DG data and pricing (P2-06); cancellation (P2-03); rolls/splits; capacity-allocation policy; equipment allocation from CMM; non-USD pricing (P3-02); special equipment (P3-03); Bill of Lading/document issuance (P3-04).
- **Privacy boundary:** party/customer PII and cargo details remain in Booking unless an approved contract explicitly requires them. W3-04 must not widen `booking.confirmed` merely to mirror the Booking aggregate.

## Actors & Journey

1. A booking-desk or customer-service user opens New Booking inside the authenticated LinerCore shell.
2. The user selects canonical party/customer, commodity, locations, voyage, and equipment type; enters the approved customer, cargo, date, and quantity facts; and saves a draft without a container number.
3. Booking validates reference-backed facts against the live Reference Data service and preserves every entered value when correction or retry is required.
4. Booking sends party, commodity, POL/POD, equipment type, requested departure date, and quantity through the live pricing seam and stores the itemised result and pricing basis.
5. The user confirms the booking; the detail page shows the persisted request and commercial result, while CMM receives only the contractually required routing/equipment state.

## Cross-Module Seams (must be real)

- **Shared Platform → Booking:** live reference lookups/validation for party/customer, commodity, location, voyage, and equipment type through the Reference Data OHS; no copied reference master data or free-text canonical substitutes.
- **Booking → Charge:** the existing `pricing.request` contract carries the exact party, commodity, port pair, equipment type, requested dates, and quantities. Consumer/provider contract fixtures and live behavior must agree; no attributes-bag-only mapping or guessed defaults.
- **Booking → CMM:** `booking.confirmed` remains the minimal published contract. It carries full current `routing[]` and `equipment[]`; `equipmentId` is absent until assignment. Party PII and cargo fields are not added unless a consumer requirement and BACKWARD-compatible contract change are separately approved.
- **Frontend:** the Booking domain owns page composition inside the one shared shell and consumes `@erp/ui`; W3-04 creates no second Booking frontend, local theme, shell, authentication surface, or shared primitive fork.

## Standards Alignment

- UN/LOCODE for load/discharge places; ISO 6346 size/type codes for requested equipment and ISO 6346 identifiers only when physical equipment is later assigned.
- DCSA-aligned booking/routing/equipment naming must be frozen in the W3-04 field dictionary before Application Design; domain, REST, persistence, pricing fixtures, and events must not use divergent aliases.
- Party/customer data is PII-bearing and stays reference-owned; Booking stores stable references and only the minimum approved snapshot/audit facts.
- Contract evolution is additive/BACKWARD within the current major; existing W1 records are upcast or rendered explicitly incomplete, never silently fabricated.

## Definition of Done (observed, not "tests pass")

On the live Compose stack: (1) create an FCL-dry booking with the approved party/customer, customer reference, cargo/commodity, requested departure, one voyage/route, and equipment quantity greater than one, with no `equipmentId`; (2) reload the draft/detail and observe every entered fact round-trip from persistence; (3) validate canonical references live and observe an invalid/stale reference block confirmation while preserving input; (4) price through the real Charge endpoint and observe the request carry the exact party, commodity, dates, and quantity and the quote scale by quantity; (5) confirm and observe a schema-valid `booking.confirmed` carrying the full route/equipment quantity with no fabricated container id; (6) observe the complete request and pricing basis on Booking detail in the shared shell; (7) prove denied, validation, duplicate-submit, provider-error/retry, conflict, degraded-reference, and success states plus keyboard/focus and 375/390/768/1024/1440 responsive evidence; (8) `aidlc-audit`, `erp-fidelity-audit`, contract, accessibility, and live acceptance gates are green.

## Dependencies

W1-01 (live booking spine), W0-02 (canonical reference sets), W2-02 (shared UI/shell baseline), and W2-03 (live pricing provider with date/quantity inputs). All are closed, so W3-04 is ready to start.

## Suggested Scope & Sizing

`feature`. Approximately five vertical units: (U01) approve the field dictionary and typed create/read/detail path; (U02) party/customer, commodity, and cargo reference validation end-to-end; (U03) requested schedule and equipment quantity with optional later assignment plus legacy upcasting; (U04) exact live pricing and confirmation-contract mapping; (U05) shared-shell state/accessibility/responsive work and live evidence. Keep units vertical—each must include its UI/API/domain/persistence/contract effects rather than splitting by layer.

## Open Questions

1. Which party and cargo facts form the Phase-1 commercial baseline?
   - A. Booking party/customer reference, customer booking reference, shipper/consignee/notify references, cargo description, canonical commodity, package count/type, gross weight, and volume (recommended)
   - B. Pricing-minimum only: customer, canonical commodity, requested date, and equipment quantity
   - C. A plus additional shipping-instruction fields
   - X. Other
   - `[Answer]:`

2. How are schedule commitments represented in this slice?
   - A. Requested departure is editable; carrier voyage number, ETD/ETA, cargo cutoff, and documentation deadline are derived/read-only from the selected voyage and snapshotted on confirmation (recommended)
   - B. Capture requested departure and show ETD/ETA only; defer cutoff/deadline fields
   - X. Other
   - `[Answer]:`

3. Does W3-04 introduce reefer or dangerous-goods entry?
   - A. No—keep W3-04 FCL dry and retain P2-06 as the typed reefer/DG + surcharge intent (recommended)
   - B. Pull simplified boolean indicators into W3-04
   - X. Other
   - `[Answer]:` A — W3-04 remains the complete dry-booking baseline; P2-06 owns specialised reefer/DG behavior.

4. Is a physical container number required at booking-request creation?
   - A. No—`equipmentId` is optional/absent until W3-03 assignment and reconfirmation (recommended; matches the published event contract)
   - B. Require a container number when creating the draft
   - X. Other
   - `[Answer]:` A — initial requests and confirmations must not fabricate an equipment assignment.

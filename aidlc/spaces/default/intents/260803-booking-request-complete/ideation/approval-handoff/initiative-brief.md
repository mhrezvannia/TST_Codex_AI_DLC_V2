# Initiative Brief — W3-04 Booking Request Completeness

## Recommendation

**CONDITIONAL PROCEED to Inception.** Authorize requirements analysis, user stories, refined UX, application design, unit generation, and delivery planning. Do not treat this handoff as funding, calendar, staffing, implementation, production, or release approval.

Evidence chain: `intent-statement.md`, `scope-document.md`, `intent-backlog.md`, `competitive-analysis.md`, `feasibility-assessment.md`, `constraint-register.md`, `team-assessment.md`, and `wireframes.md`.

## Intent and problem

An authenticated booking-desk or customer-service user needs to create, save, reopen, correct, validate, price, confirm, and inspect one commercially usable FCL-dry booking request. The current walking skeleton omits key party/cargo/schedule facts, fixes equipment quantity at one, and requires a physical container identifier before assignment. That produces incomplete pricing and confirmation evidence or encourages invented facts.

W3-04 replaces those thin assumptions with a typed request containing the approved commercial baseline, authoritative schedule provenance, and equipment type × positive quantity with no initial physical identifier.

## Market and customer validation

`competitive-analysis.md` confirms that carrier portals, forwarding/TMS suites, and DCSA-aligned ecosystems treat structured parties, cargo, routing, equipment quantity, schedules, pricing, and confirmation visibility as normal operational expectations. The approved differentiation is trustworthy operations: preserve facts, expose authority and recovery, and avoid fabricated assignments or schedules.

The approved build posture is to extend the Booking-owned LinerCore core and selectively reuse standards/connectivity. This is qualitative validation; no invented market size, vendor price, ROI, or financial forecast is claimed.

## Minimum complete scope

The Must-have vertical path in `scope-document.md` is inseparable:

1. Capture booking customer, customer reference, required shipper, optional consignee/notify, cargo description, canonical commodity, package count/type, gross weight/unit, optional volume/unit, POL/POD, requested departure, selected voyage, equipment type, and positive quantity.
2. Show carrier voyage number, ETD/ETA, cargo cutoff, and documentation deadline as read-only authoritative voyage facts with provenance.
3. Save/reopen/correct a typed draft and legacy record without a physical `equipmentId` or invented data.
4. Validate canonical references live; block confirmation rather than draft recovery on missing, stale, or invalid required facts.
5. Send the exact party/commodity/ports/type/date/quantity basis to Charge and show quantity-scaled itemised pricing with truthful failure/retry states.
6. Confirm through a BACKWARD-compatible event carrying current routing/equipment quantity and no fabricated identifier or party/cargo widening.
7. Inspect request, schedule snapshot, pricing basis, state, and recovery in the shared shell.
8. Prove the journey, negative/degraded states, contracts, migration, accessibility/responsive behavior, live Compose run, `aidlc-audit`, and `erp-fidelity-audit`.

The five risk-first vertical increments in `intent-backlog.md` are: authoritative request spine, commercial completeness, legacy correction, exact pricing, and compatible confirmation/live proof.

Deferred boundaries include physical assignment/amendment, cancellation, multi-leg, reefer/DG, multi-currency, shipping instructions/eBL, rolls/splits/allocation, external portal/marketplace, and any new AWS/cloud topology.

## Concept and user journey

The approved `wireframes.md` concept keeps the one authenticated LinerCore shell:

- One grouped request page: Booking and parties, Cargo, Route and schedule, Equipment request, Review and save.
- One explicit `Save draft` command; detail exposes exactly one next action at a time: Validate, Price, or Confirm.
- `Correct booking` edits the same record and preserves authoritative legacy/user-entered facts.
- Booking detail retains route-backed Overview, Charges, Journey, and Activity; Overview gains request completeness, schedule provenance, equipment request, and validation evidence.
- Desktop/mobile concepts cover create, detail, legacy correction, and confirmation; matrices cover loading, denied, validation, stale/degraded reference, duplicate/uncertain submission, conflict, provider error, manual/no-rate, success, legacy incomplete, unavailable, and not-found states.

The binding experience remains quiet, dense, accessible, responsive, and operational—not marketing-oriented.

## Feasibility and critical conditions

`feasibility-assessment.md` is **CONDITIONAL GO**. The existing on-premises LinerCore services, versioned Booking snapshots, Reference Data OHS, Charge provider, Kafka/Avro confirmation, and observability stack are sufficient; no new infrastructure service or purchase is required.

`constraint-register.md` conditions remain release-blocking:

- Freeze one field/validation/PII/temporal dictionary in Requirements Analysis.
- Shared Platform must add typed authoritative cargo cutoff and documentation deadline facts, or the user must explicitly revise schedule scope.
- Migration/upcast must be additive, rolling-compatible, restartable/idempotent, observable, and non-inventive.
- Exact pricing mapping and provider failures require bilateral contract evidence.
- `booking.confirmed` remains BACKWARD-compatible, omits an unassigned identifier, and does not widen into party/cargo PII.
- LinerCore shared-shell, accessibility/responsive, live Compose, contract, audit, privacy, and operational evidence remain mandatory.

## Team and resource posture

`team-assessment.md` defines Booking as the stream-aligned Driver with time-boxed Shared Platform and Charge contributions, CMM contract review, LinerCore/W2-02 UI governance, and enabling quality/security/privacy/compliance/operations support. Focused seam mobs cover field/voyage authority, migration, pricing, confirmation, UI governance, and live exit proof.

The topology is approved but not staffed or scheduled. Named people, backups, availability, time zones, collaboration windows, budget, hard deadline, and capacity allocations remain unconfirmed. Delivery Planning must resolve them before committed execution; unavailable critical contributors return to an approval gate rather than weakening scope or evidence.

## Inception entry conditions and decision

Inception may proceed while retaining these checkpoints:

- Reverse Engineering refreshes brownfield facts and contract/source discrepancies.
- Requirements Analysis freezes the field dictionary, authority, validation, privacy, error, and acceptance semantics.
- User Stories cover the five vertical outcomes and every required negative/degraded branch.
- Refined Mockups occurs only after Requirements Analysis and User Stories approval and uses the user-prescribed W3-04 UI/UX Pro Max prompt and execution guide under LinerCore authority.
- Application Design and Units Generation preserve additive seams and vertical delivery; Delivery Planning confirms actual resources and contributor windows.

**Decision:** proceed conditionally to Inception. Any attempt to bypass these conditions, infer unrecorded commitments, or narrow live evidence requires a new user approval decision.


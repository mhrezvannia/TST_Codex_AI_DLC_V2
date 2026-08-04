# Scope Definition — W3-04 Booking Request Completeness

## Decision and Source Artifacts

W3-04 retains `feature` scope at Standard depth and Standard test strategy. The minimum complete outcome is the full approved FCL-dry vertical path; pricing, confirmation, shared-shell behavior, migration, and live proof are not deferrable from this intent.

Binding inputs:

- `intent-statement.md` — approved business outcome, field/schedule decisions, seams, and observed DoD.
- `feasibility-assessment.md` — Conditional GO and technical/infrastructure/compliance viability.
- `constraint-register.md` — non-negotiable ownership, contract, migration, privacy, UI, and live-quality conditions.

## Scope Objective

A booking-desk or customer-service user can create, save, reopen, correct, price, confirm, and inspect one commercially complete FCL-dry booking request. The request uses canonical commercial references, carries authoritative schedule provenance and equipment type × quantity, and remains valid without a physical container identifier until later assignment.

## Minimum Complete Vertical Slice

One authenticated shared-shell journey:

1. Enter booking customer/party, customer booking reference, shipper, optional consignee/notify party, cargo description, canonical commodity, package count/type, gross weight, optional volume, POL/POD, requested departure, selected voyage, equipment type, and positive quantity.
2. Derive carrier voyage number, ETD/ETA, cargo cutoff, and documentation deadline from the authoritative live voyage; show them read-only and preserve provenance.
3. Save and reopen the typed draft with no `equipmentId`; preserve every value through correction and provider failures.
4. Validate canonical references live and block confirmation—not draft recovery—on missing, stale, or invalid required facts.
5. Send the exact pricing basis to Charge, show itemised quantity-scaled pricing, and handle contract failures/retry without guessing.
6. Confirm and publish full current routing/equipment quantity through the compatible event with no fabricated container identifier.
7. Inspect the complete request, schedule snapshot, pricing basis, status, and recovery actions on Booking detail.
8. Prove the journey, negative/degraded states, accessibility/responsive behavior, contracts, and audits on the live Compose stack.

Anything less is a delivery increment, not completion of W3-04.

## In Scope

### Commercial data and completeness

- Booking customer/party reference and customer booking reference.
- Shipper reference required for confirmation; consignee and notify-party references captured but optional.
- Cargo description, canonical commodity, package count/type, gross weight with explicit unit required; volume with explicit unit captured but optional.
- Requiredness, normalization, allowed values, length/precision/unit rules, validation messages, and confirmation completeness matrix frozen in Requirements Analysis.

### Routing and schedule

- One FCL-dry route with canonical POL/POD and one selected voyage.
- Requested departure as a POL-local calendar date.
- Carrier voyage number, ETD/ETA, cargo cutoff, and documentation deadline as read-only timezone-aware voyage facts.
- Minimum approved snapshot/audit facts persisted at confirmation; stale/degraded authority handled explicitly.
- Additive Shared Platform voyage-model/OHS/event/seed contribution for cutoff and documentation deadline.

### Equipment lifecycle

- One requested equipment line using canonical ISO size/type code and positive editable quantity, including quantity greater than one.
- `equipmentId` optional/absent at draft and initial confirmation.
- Compatibility with later W3-03 physical assignment and reconfirmation.

### Brownfield data

- Versioned additive Booking snapshot/schema evolution.
- Authoritative upcast of existing facts, preservation of unknown legacy attributes during migration, explicit incompleteness for unsupported fields, correction journey, and confirmation block until complete.
- Restartable/idempotent migration evidence and recorded outcomes/reasons.

### Integration and contracts

- Live Reference Data lookup/validation; no copied masters.
- Exact Booking → Charge `pricing.request` mapping, repricing triggers, error semantics, and quantity-scaled result.
- BACKWARD-compatible `booking.confirmed` with full current route/equipment quantity and absent unassigned identifier; no party/cargo expansion.
- Correlation, idempotency, stale/reference/provider/conflict/duplicate behavior, Pact and Avro compatibility.

### UI and operational quality

- Canonical New Booking and Booking detail inside the one LinerCore shell using `@erp/ui`.
- Loading, denied, validation, pending, stale/degraded reference, pricing provider error/retry, duplicate submit, optimistic conflict, success, legacy incomplete, empty/not-found states as applicable.
- Input preservation, keyboard/focus/live-region behavior, reduced motion, and responsive evidence at 375, 390, 768, 1024, and 1440 px.
- UI/UX Pro Max during Refined Mockups only after Requirements Analysis and User Stories approval, using the named W3-04 prompt and execution guide.

### Live evidence

- One live Compose run proving create → reopen → validate → price → confirm → event/detail.
- Exact captured pricing request and quantity-scaled response.
- Schema-valid event consumed with no fabricated identifier.
- Contract, migration, authorization, accessibility, responsive, `aidlc-audit`, and `erp-fidelity-audit` gates green.

## Out of Scope

| Capability | Owning future intent / reason |
|---|---|
| Physical container assignment, amendment, and reconfirmation | W3-03 |
| Cancellation | P2-03 |
| Multi-leg/transshipment routing | P2-04 |
| Reefer/DG entry, rules, and surcharges | P2-06 |
| Multi-currency | P3-02 |
| Special equipment/full reefer depth | P3-03 |
| Shipping instructions, Bill of Lading, eBL issuance | P3-04 or documentation track |
| Rolls, splits, capacity-allocation policy, CMM allocation | Later Booking/CMM intent |
| External shipper portal or cross-carrier marketplace | Later customer-self-service intent |
| New public cloud/AWS service, account, or region | Binding platform is on-premises; no need for W3-04 |
| Program trade-footprint, residency/retention, DR-site, FMC decision | Program-level unresolved dependency, not a Booking-local choice |

## MoSCoW Priority

### Must Have

- All capabilities in the minimum complete vertical slice.
- Capture and round-trip of optional consignee/notify/volume fields, while keeping them non-blocking.
- Authoritative voyage cutoff/deadline contribution or an explicit approval-gate scope revision.
- Safe legacy correction, exact pricing, compatible confirmation, one-shell UI, operational states, and live/audit proof.

### Should Have

- Efficient defaults/prefill that use authoritative data and never guess required commercial facts.
- Clear provenance/help text for requested versus carrier-derived dates and cargo weight versus later SOLAS VGM.
- Operator diagnostics that accelerate support without exposing PII-linked values.

### Could Have

- Nonessential entry accelerators such as recent-choice suggestions, only if they use existing governed primitives and do not affect scope, authority, or delivery risk.

### Won't Have in W3-04

- Every capability listed in Out of Scope, plus any local theme, second Booking frontend, copied reference list, guessed schedule value, fabricated container ID, or weakened live gate.

## Value Stream Map

```mermaid
flowchart LR
    A["Open New Booking"] --> B["Enter canonical commercial request"]
    B --> C["Resolve authoritative voyage schedule"]
    C --> D["Save and reopen typed draft"]
    D --> E["Correct incomplete or stale facts"]
    E --> F["Price exact request"]
    F --> G["Review and confirm"]
    G --> H["Publish compatible booking.confirmed"]
    H --> I["Inspect complete Booking detail"]
```

Text fallback: Open New Booking → enter canonical commercial request → resolve authoritative voyage schedule → save/reopen → correct incomplete or stale facts → price the exact request → review/confirm → publish compatible confirmation → inspect the complete operational record.

## Scope-to-Value Trace

| Value outcome | Scope elements that prove it | Observable evidence |
|---|---|---|
| Commercially usable request | Approved field dictionary, required/optional semantics, typed persistence/detail | Quantity >1 request round-trips every entered fact |
| No premature assignment | Equipment request lifecycle and optional identifier contract | Draft and initial confirmation succeed with no `equipmentId` |
| Trusted schedule | Live voyage authority and snapshot provenance | Derived carrier number/ETD/ETA/cutoffs/deadline match selected voyage |
| Trusted price | Exact bilateral mapping and repricing/failure behavior | Captured request and quantity-scaled itemised result |
| Trusted downstream state | Minimal BACKWARD event | CMM consumes full routing/equipment without party/cargo leakage or fabricated ID |
| Safe brownfield adoption | Additive migration and explicit incompleteness | Old record reopens, preserves data, guides correction, and blocks incomplete confirm |
| Operable enterprise UI | Shared shell, state model, a11y/responsive | Required negative/degraded/success evidence across breakpoints and keyboard paths |

## Dependencies and Sequencing Constraints

1. Shared Platform cutoff/deadline authority and equipment-request semantics are the first risk proof.
2. Commercial dictionary/validation builds on that typed request spine.
3. Legacy correction requires the frozen new model and completeness rules.
4. Exact pricing requires the commercial and requested-date/quantity basis.
5. Confirmation/live exit proof requires all preceding facts and contracts.

No proto-increment may declare success using stubs, copied reference data, omitted contracts, or tests without observed live behavior.

## Timeline and Change Control

No hard deadline or budget is documented. Delivery Planning must revalidate capacity and expose any later constraint as an explicit gate decision. Scope does not expand because work is technically adjacent: additions route to their owning future intent unless the user reopens W3-04 at an approval gate with affected owners and revised DoD.

## Scope Exit Criteria

- Every Must Have maps to approved requirements and at least one vertical story/proto-unit.
- Every out-of-scope request has an owner/future intent or explicit rejection.
- Conditional GO criteria and Critical constraints remain visible in the backlog.
- Five proto-increments are dependency-valid, vertical, and collectively cover the full live DoD without duplication or gaps.


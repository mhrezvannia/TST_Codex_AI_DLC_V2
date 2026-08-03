# Intent Statement — P2-06 Reefer & Dangerous-Goods Booking Parameters

> **Phase 2.** Answers provisional (recommended defaults) — reconfirm at Phase 2 start.

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §4 Booking profile ("reefer/DG indicators; detailed reefer parameters at maturity")
2. `docs/erp-business-ui-gap-analysis.md` Part 1.2 (reefer/DG = 0 in code today)
3. W3-04 (complete FCL-dry booking aggregate and form to extend), W2-03 (pricing to add reefer/DG surcharge dimensions), and W1-01 historical spine

## Intent

A booking can carry **reefer** (temperature-controlled) and **dangerous-goods** parameters — reefer setpoint/ventilation, DG UN number + IMDG class — which drive pricing surcharges and are carried through to the container journey. Phase 1 was FCL-dry only; this adds the next commodity dimensions the MVP scope named. **Driver: Booking team (Charge + CMM contribute).**

## Vertical Slice Definition

One reefer booking + one DG booking end-to-end: create a booking with reefer setpoint (or DG UN/class) → priced with the reefer/DG surcharge → confirmed → indicators carried on `booking.confirmed` → visible on the detail and to CMM.

- **Layers cut:** UI (reefer/DG fields) → API → domain (typed params) → pricing dimension → event → CMM carry → UI.
- **Thinnest viable form:** reefer setpoint + one DG (UN number + IMDG class + indicator); one surcharge each.
- **Deferred:** full IMDG documentation/segregation rules, detailed reefer profiles (controlled atmosphere), DG approval workflow.

## In Scope / Out of Scope

- **In:** reefer/DG value objects on the booking (not attributes-bag), reefer/DG surcharge in pricing (extends W2-03), indicators additive on the event schema (BACKWARD), reefer/DG shown on detail + carried to CMM.
- **Out:** IMDG compliance engine, reefer telemetry/monitoring, DG documentation generation.

## Actors & Journey

Customer-service books a reefer cargo with a setpoint; pricing adds the reefer surcharge; the journey carries the reefer indicator so operations handle it correctly.

## Cross-Module Seams (must be real)

`pricing.request` gains reefer/DG dimensions (dual sign-off on the fixture); `booking.confirmed` gains **additive optional** reefer/DG fields (BACKWARD-compatible per the contract's evolution rule) consumed by CMM.

## Standards Alignment

DCSA reefer fields (setpoint, ventilation) as typed VOs; **IMDG** UN number + class for DG; additive-optional schema evolution only.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) create a reefer booking with a setpoint → reefer surcharge applied in the quote; (2) create a DG booking with UN number + class → DG surcharge applied; (3) confirm → event carries the reefer/DG fields (schema still BACKWARD-compatible); (4) CMM journey shows the reefer/DG indicator; (5) a plain FCL-dry booking is unaffected (regression); (6) both audits green.

## Dependencies

W3-04, W2-03. Independent of other Phase-2 intents; W1-01 is inherited through W3-04.

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) reefer params + surcharge end-to-end; (U02) DG params + surcharge; (U03) event fields + CMM carry + FCL-dry regression.

## Open Questions

1. DG scope for this slice?
   - A. Indicator + UN number + IMDG class + surcharge; full IMDG segregation/docs deferred (recommended)
   - B. Full IMDG compliance now
   - X. Other
   - `[Answer]:` A *(provisional)*

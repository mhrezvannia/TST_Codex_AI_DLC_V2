# Intent Statement — P3-03 Additional Equipment Types & Full Reefer Depth

> **Phase 3.** Answers provisional (recommended defaults) — reconfirm at Phase 3 start.

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §3 Scalability ("more equipment types (dry, reefer, special)")
2. W0-02 outputs (equipment-type reference set), P2-06 (reefer/DG params — this deepens them)
3. W1-01/P2-04 (booking equipment lines), W2-04 (CMM equipment tracking)

## Intent

The platform supports **special equipment** (open-top, flat-rack, tank) and **full reefer parameter depth** beyond the Phase-2 indicator: these types are bookable, priced with type-specific rates, and tracked. Extends the dry+basic-reefer scope. **Driver: Reference Data team (Booking/Charge/CMM contribute).**

## Vertical Slice Definition

One special-equipment booking + one full-reefer booking end-to-end: extend the equipment-type reference (ISO 6346 size/type codes for the new types + full reefer param model) → book with the new type → priced with the type-specific rate → confirmed → tracked with the correct type.

- **Layers cut:** equipment-type reference → booking equipment line → type-specific pricing → event → CMM tracking → UI.
- **Thinnest viable form:** reefer (full params) + one special type (flat-rack).
- **Deferred:** out-of-gauge cargo dimensioning, breakbulk, project cargo.

## In Scope / Out of Scope

- **In:** new ISO 6346 equipment-type codes in reference data, full reefer parameter model (from P2-06's indicator to a profile), type-specific pricing dimension, type carried on event + tracked in CMM, UI selection.
- **Out:** stowage/securing rules, out-of-gauge measurement workflows.

## Actors & Journey

Customer-service books a flat-rack or a fully-specified reefer; pricing reflects the type; the journey tracks the correct equipment type.

## Cross-Module Seams (must be real)

Equipment-type reference OHS extended (live); `pricing.request` gains type-specific dimension (dual sign-off); `booking.confirmed` `equipment[].equipmentTypeCode` carries the new ISO codes; CMM tracks by type.

## Standards Alignment

**ISO 6346** size/type codes for the new types; DCSA reefer parameter fields for the full reefer profile; additive-optional evolution.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) new equipment types appear in the reference set + booking selector; (2) book a flat-rack → type-specific rate applied → confirmed → CMM shows the type; (3) book a full-param reefer → params priced + tracked; (4) existing dry/basic bookings unaffected (regression); (5) both audits green.

## Dependencies

W0-02 (equipment-type set), P2-06 (reefer/DG base). Independent of other Phase-3 intents.

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) new equipment types in reference + booking; (U02) type-specific pricing + tracking; (U03) full reefer profile + regression.

## Open Questions

1. Which special types for this slice?
   - A. Reefer (full params) + flat-rack (recommended — one temperature-controlled + one out-of-standard)
   - B. Reefer + open-top + flat-rack + tank (all)
   - X. Other
   - `[Answer]:` A *(provisional)*

# Intent Statement — P3-04 Documentation / Bill of Lading (DCSA eBL) Module

> **Phase 3.** Answers provisional (recommended defaults) — reconfirm at Phase 3 start. This introduces a **new bounded context/module.**

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §3 Scalability + §Roadmap ("candidate Documentation/B/L module", "end-to-end document flow"), §4 (B/L noted as future module out of Booking scope)
2. `docs/program-vision-document.md` §5 Context Map (to place the new module's seams)
3. W3-04 (booking parties/cargo/equipment request facts), P2-04 (full routing), W1-01 historical spine, and W2-04 (movements/shipment context)
4. DCSA eBL standard (external — target its data model)

## Intent

A **Documentation module** issues **Bills of Lading** to the DCSA electronic Bill of Lading (eBL) data model: from a confirmed/carried booking, a B/L is drafted, verified, and issued, and made available to the customer. This is the new module the roadmap names for Phase 3's "end-to-end document flow." **Driver: new Documentation team.**

## Vertical Slice Definition

One B/L end-to-end: from a confirmed booking (with routing + equipment + parties) → draft a DCSA eBL (mapping booking + shipment data to the eBL model) → verify → **issue** → the issued eBL is available to the customer, with a draft→issued lifecycle.

- **Layers cut:** new module domain (eBL aggregate) → data drawn from Booking/CMM via contracts → API → issue lifecycle → customer availability → UI.
- **Thinnest viable form:** a straight (non-negotiable) eBL, data-only, draft→issued; one booking → one B/L.
- **Deferred:** negotiable/transferable eBL, title transfer/endorsement, DLT/eBL-platform interoperability (EDI/DCSA eBL exchange), amendments/surrender.

## In Scope / Out of Scope

- **In:** eBL aggregate to the DCSA data model, mapping from booking + shipment context (via contracts, not shared DB), draft/verify/issue lifecycle, customer-visible issued document, module owns its data + exposes via contract.
- **Out:** transferable-title mechanics, carrier haulage docs, customs filings, physical/print B/L.

## Actors & Journey

Documentation clerk drafts a B/L from a carried booking, verifies the parties/cargo, issues it; the customer accesses the issued eBL.

## Cross-Module Seams (must be real)

Consumes booking + shipment context from Booking/CMM **via published contracts** (a new `documentation` context in the map — Conformist to Booking's published language); exposes the eBL via its own API/OHS. No shared database.

## Standards Alignment

**DCSA eBL** data model; UN/LOCODE, ISO 6346, `carrierBookingReference` reused as the linking keys; eBL fields conformant so future platform interop is cheap.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) from a confirmed booking, draft a B/L → data auto-populated (parties, routing, equipment) from the booking via contract; (2) verify + issue → status draft→issued observable; (3) issued eBL is retrievable and DCSA-eBL-schema conformant; (4) a change to the source booking after issue does not silently mutate the issued B/L (immutability of an issued document); (5) both audits green.

## Dependencies

W3-04 (complete Booking source facts), P2-04 (real routing), and W2-04 (shipment context). Later in Phase 3; benefits from P3-01 (entity scope) if present.

## Suggested Scope & Sizing

`enterprise` (new module, new context). ~5 vertical units: (U01) module skeleton + eBL aggregate; (U02) draft from booking via contract; (U03) verify/issue lifecycle; (U04) customer availability + immutability; (U05) DCSA-eBL conformance + contract tests.

## Open Questions

1. eBL scope for this slice?
   - A. DCSA eBL **data model + draft/issue** lifecycle, straight (non-negotiable), data-only; transferable/DLT interop deferred (recommended)
   - B. Include transferable/negotiable eBL + title transfer now
   - X. Other
   - `[Answer]:` A *(provisional)*

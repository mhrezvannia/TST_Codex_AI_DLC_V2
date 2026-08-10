# Intent Statement — W2-04 Container Journey & Track-Trace

## Intent

CMM speaks **DCSA**: journeys derive expected moves from the confirmed booking's routing, operational movements are captured with DCSA T&T vocabulary (`equipmentEventTypeCode`, `eventClassifierCode`, laden/empty), the lifecycle state machine runs, and `containermovement.status` events carry DCSA move codes back to Booking. **Driver: CMM team.**

## Context Pack (read before starting)

1. `docs/enterprise-contracts/async-event-contract-containermovement-status.md` (the DCSA-coded event contract — authoritative)
2. `docs/program-vision-document.md` §4 CMM module profile (lifecycle states, owned capabilities)
3. `docs/erp-business-ui-gap-analysis.md` Part 2 (DCSA adoption table) + Appendix (canonical names)
4. `services/container-movement-service/` (existing journey intake — refactor, don't discard)
5. W1-01 outputs: real `booking.confirmed` consumption + journey open
6. `design-system/linercore/MASTER.md` and `design-system/linercore/SESSION-PROMPT.md` (binding shared UI/UX contract)

## Vertical Slice Definition

One container tracked end-to-end: journey opened from `booking.confirmed` (exists post-W1-01) → expected moves derived from routing (POL: LOAD; POD: DISC for the one-leg form) → operational moves captured via API/UI with DCSA codes → lifecycle state transitions (Allocated → Gated-out → In-transit → Discharged → Returned-empty) → each validated move emits `containermovement.status` (real event, DCSA `moveCode`) → Booking renders it.

- **Thinnest viable form:** one-leg journey, the journey-moves subset (GTOT, LOAD, DISC, GTIN, returned-empty); ACT classifier only.
- **Deferred:** EDI ingestion (P2-01 territory), condition/lease movements (Damaged/On-hire…), PLN/EST classifiers, public DCSA API (P2-02).

## In Scope / Out of Scope

- **In:** DCSA vocabulary as typed value objects; expected-move derivation; movement validation/sequencing rules; lifecycle state machine per Vision §4; journey list + **detail page with movement timeline** in the CMM app; real status events per the contract's `.avsc`.
- **Out:** container registry depth (owned/leased fleets), depot stock, M&R workflows — all explicitly out per Vision.

## Actors & Journey

Operations clerk records a gate-out/load/discharge against a journey; customer-service sees the movement land on the booking; the journey detail shows the DCSA-coded timeline.

## Cross-Module Seams (must be real)

`containermovement.status` on the real broker (W0-01 foundation), fields exactly per the contract Avro (`moveCode`, `eventClassifierCode`, `sequenceNumber`, `emptyIndicatorCode`…); Booking consumes and dedupes (its consumer exists from W1-01 — this intent upgrades payload fidelity, dual sign-off on the schema change).

## Standards Alignment

**DCSA T&T v2.2** equipment event vocabulary; UN/LOCODE locations; ISO 6346 `equipmentReference`; extending the DCSA `moveCode` vocabulary is **not** a schema change per the contract — but any envelope/field change is BACKWARD-checked.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) confirm a booking → journey opens with derived expected moves; (2) capture GTOT→LOAD→DISC→GTIN via the running CMM UI; (3) each emits a real `containermovement.status` (observed on the topic, SR-validated, DCSA `moveCode`); (4) Booking detail shows the movement progression; (5) out-of-sequence/duplicate capture is rejected/deduped observably; (6) `erp-fidelity-audit` shows DCSA present in code (detector 4 code-count > 0 at the seams).

## Dependencies

W1-01 (journey-open path live), W0-01 (real eventing).

## Suggested Scope & Sizing

`feature`. ~4 vertical units: (U01) DCSA value objects + expected-move derivation live; (U02) movement capture UI/API with validation + state machine; (U03) DCSA-coded status events end-to-end to Booking; (U04) journey list/detail timeline pages.

## Open Questions

1. Movement capture surface for MVP?
   - A. CMM UI form + API (manual capture) (recommended — EDI is Phase 2)
   - B. API-only, no UI capture
   - X. Other
   - `[Answer]:` A — CMM UI form + API for manual capture; EDI ingestion is Phase 2.

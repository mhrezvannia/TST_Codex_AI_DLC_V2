# Intent Statement — W3-03 Booking Amendments & Re-confirmation

## Intent

The `bookingRevision` semantics in the `booking.confirmed` contract become real: a basic amendment (equipment quantity, type/size, or later container-number assignment) re-runs the commercial gates, **re-confirms**, re-emits `booking.confirmed` with an incremented revision carrying full state, and **CMM reconciles by upsert** — exactly per contract §5. **Driver: Booking team.**

## Context Pack (read before starting)

1. `docs/enterprise-contracts/async-event-contract-booking-confirmed.md` §5 change semantics + §2 idempotency (the spec of this intent)
2. `docs/program-vision-document.md` §4 Booking profile (amendments owned)
3. W3-04 outputs (typed complete dry-booking request, editable quantity, optional/unassigned initial `equipmentId`) and W1-01 outputs (initial-confirmation flow, revision=1)

## Vertical Slice Definition

One amendment end-to-end: amend a confirmed booking's equipment quantity in the UI → re-validate + re-price (live) → re-confirm → `booking.confirmed` re-emitted with `bookingRevision=2`, full `routing[]`+`equipment[]` → CMM upserts (adds/retires journeys by count), ignores stale/duplicate revisions → both detail pages reflect the amended state.

- **Thinnest viable form:** equipment-quantity change + container-number assignment (populating `equipmentId` per contract); type/size change if trivial after those.
- **Deferred:** rolls, splits, cancellations (explicitly Phase-2 contracts per the event doc — P2-03 carries `booking.cancelled`).

## In Scope / Out of Scope

- **In:** amendment commands re-entering the gate sequence, revision increment + full-state re-emission, CMM upsert-by-`bookingId` reconciliation (count-based; by `equipmentId` when present), amendment history on the booking detail.
- **Out:** routing changes (rolls), split/cancel, amendment fees (Charge work later).

## Actors & Journey

Customer-service amends quantity 1→2 on a confirmed booking; operations sees a second journey open in CMM automatically; a replayed old revision changes nothing.

## Cross-Module Seams (must be real)

`booking.confirmed` re-emission on the real broker; CMM consumer implements the contract's upsert/highest-revision/dedupe rules — observable, including out-of-order delivery tolerance (per-key ordering assumed, but dedupe on envelope id proven).

## Standards Alignment

`bookingRevision` monotonic per contract; `equipmentId` ISO 6346 when assigned; no new fields without BACKWARD-compatible defaults.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) amend quantity on a confirmed booking → observe revision-2 event with full state on the topic; (2) CMM journey set reconciles (1→2 journeys); (3) assign a container number → re-confirmation populates `equipmentId`, CMM attaches it to the exact journey; (4) manually replay revision-1 → CMM ignores it (stale) — observed; (5) amendment history renders on the booking detail; (6) audits green.

## Dependencies

W3-04 (the field and create/detail baseline this intent amends). W1-01 is inherited transitively. W2-04 is helpful but not required — reconciliation is against journeys W1-01 already opens.

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) amend→re-gate→re-confirm→revision-2 emission live; (U02) CMM upsert/stale-handling reconciliation; (U03) container-number assignment path + history UI.

## Open Questions

1. Where does the container number come from in MVP (the contract defers it to "a separate contract")?
   - A. Manual assignment in the Booking UI (recommended MVP stand-in; the future CMM-allocation contract replaces it)
   - B. CMM proposes available units and Booking accepts (larger)
   - X. Other
   - `[Answer]:` A — manual container-number assignment in the Booking UI (MVP stand-in for the future CMM-allocation contract).

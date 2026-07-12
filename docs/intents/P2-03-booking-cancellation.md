# Intent Statement — P2-03 Booking Cancellation & Journey Close

> **Phase 2.** Answers provisional (recommended defaults) — reconfirm at Phase 2 start.

## Context Pack (read before starting)

1. `docs/enterprise-contracts/async-event-contract-booking-confirmed.md` §"Out of scope" — explicitly flags that **cancellation needs a future `booking.cancelled` event so CMM can close the journey**
2. `docs/program-vision-document.md` §4 Booking profile (cancellations owned by Booking)
3. W1-01, W3-03 outputs (lifecycle + revision semantics), W2-04 (journeys to close)

## Intent

A confirmed booking can be **cancelled**, and the cancellation propagates: a `booking.cancelled` event tells Container Movement to close the journey, and any charges are finalised/reversed appropriately. This completes the booking lifecycle that Phase 1 deliberately left open. **Driver: Booking team.**

## Vertical Slice Definition

One cancellation end-to-end: cancel a confirmed booking in the UI → booking → CANCELLED → **real `booking.cancelled` event** → CMM closes the journey → booking detail shows cancelled + final charge state.

- **Layers cut:** UI → API → domain → **async event** → CMM close → UI.
- **Thinnest viable form:** cancel a confirmed booking with an open journey, no cancellation fee logic.
- **Deferred:** cancellation fees/penalties (Charge), partial cancellation of multi-equipment bookings, cancellation after departure.

## In Scope / Out of Scope

- **In:** cancel command + state transition, new `booking.cancelled` contract + real emission, CMM consumer closing the journey (idempotent), charge finalisation state, cancellation reason + history on the detail.
- **Out:** fee calculation (a Charge follow-up), rolls/splits (separate).

## Actors & Journey

Customer-service cancels a booking; operations sees the container journey close automatically; the record shows who cancelled, when, and why.

## Cross-Module Seams (must be real)

New `booking.cancelled` async event on the real broker (envelope + BACKWARD schema), consumed by CMM to close the journey — deduped, tolerant of a cancel arriving before/after other events.

## Standards Alignment

Envelope per Enterprise §5; keyed on `carrierBookingReference` + `bookingRevision`; consumers upsert/close on `bookingId`.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) cancel a confirmed booking → `booking.cancelled` observed on the topic; (2) CMM closes the corresponding journey (state observable); (3) replaying an older confirmed event does **not** reopen it (ordering/idempotency); (4) detail shows cancelled + reason + final charges; (5) both audits green.

## Dependencies

W1-01, W3-03, W2-04. Independent of other Phase-2 intents.

## Suggested Scope & Sizing

`feature`. ~3 vertical units: (U01) cancel command + state + contract; (U02) real event + CMM journey close; (U03) charge finalisation + history UI + idempotency proof.

## Open Questions

1. Cancellation fee policy for this slice?
   - A. Record the cancellation; fee/penalty logic deferred to a Charge follow-up (recommended — keeps the slice thin)
   - B. Include a flat cancellation fee now
   - X. Other
   - `[Answer]:` A *(provisional)*

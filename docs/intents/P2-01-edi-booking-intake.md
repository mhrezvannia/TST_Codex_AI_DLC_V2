# Intent Statement — P2-01 EDI / INTTRA Booking Intake

> **Phase 2.** Answers below are provisional (recommended defaults) — reconfirm when Phase 2 starts, since Phase-1 learnings may shift them.

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §3 (Integration Landscape — EDI/INTTRA row), §5 `booking.intake.edi` contract
2. `docs/program-vision-document.md` §5 Context Map (EDI/INTTRA → Booking is an **Anti-Corruption Layer**)
3. W3-04 outputs (the canonical complete booking-request field dictionary and mappings), W1-01 outputs (the quote-to-cash flow this feeds), and W3-03 (amendments — intake can amend)
4. `contracts/` (define `contracts/edi/inttra-iftmbf-mapping.md` here)

## Intent

Bookings can arrive **electronically** from EDI networks (UN/EDIFACT IFTMBF via INTTRA) instead of only being hand-keyed: an inbound message is translated by an Anti-Corruption Layer into a canonical booking request, flows through the existing quote-to-cash pipeline, and an acknowledgement is returned. **Driver: Booking team.**

## Vertical Slice Definition

One inbound message end-to-end: a sample IFTMBF message lands → **ACL** parses + maps it to the canonical (DCSA-aligned) booking request → creates a draft booking → runs validate/price → an IFTMBF response/CONTRL acknowledgement is emitted back to the sender.

- **Layers cut:** external ingest → ACL/mapping → Booking domain → API → (existing pipeline) → outbound ack.
- **Thinnest viable form:** one message type (new booking request, IFTMBF), one partner profile, file/queue drop simulating INTTRA (no live AS2/VAN).
- **Deferred:** live INTTRA/AS2 transport, status messaging (IFTSTA), multi-partner onboarding.

## In Scope / Out of Scope

- **In:** ACL parser + canonical mapping, partner/message validation, booking creation from message, acknowledgement generation, error/reject handling for malformed messages.
- **Out:** the network transport layer (simulated), amendments-by-EDI beyond create (fast follow), EDI for movements (that's P2-05).

## Actors & Journey

An EDI partner / customer system submits a booking; operations sees the booking appear pre-populated and correct; a bad message is rejected with a coded reason, not silently dropped.

## Cross-Module Seams (must be real)

`booking.intake.edi` realised through the ACL (Vision §5). Downstream it reuses W1-01's live pricing/confirm seams unchanged. Mapping doc frozen with sign-off.

## Standards Alignment

UN/EDIFACT **IFTMBF** inbound; INTTRA network conventions; the ACL maps *into* the internal DCSA booking model — the messy external format never leaks past the ACL (the defence against "bookings arrive messy").

## Definition of Done (observed, not "tests pass")

On live Compose: (1) drop a sample IFTMBF message → a matching booking appears with correct customer/routing/equipment; (2) drive it through validate/price on the running stack; (3) an acknowledgement message is produced; (4) a malformed message is rejected with a coded reason and no partial booking; (5) both audits green.

## Dependencies

W3-04 (canonical booking request), W1-01 (pipeline), and W3-03 (so EDI amendments have a home). Independent of other Phase-2 intents.

## Suggested Scope & Sizing

`feature`. ~4 vertical units: (U01) ACL parse+map one message→draft; (U02) run through validate/price live; (U03) acknowledgement out; (U04) reject/error path + partner validation.

## Open Questions

1. Intake transport for this slice?
   - A. File/queue drop simulating INTTRA, with the **real** ACL mapping (recommended — proves the mapping, defers transport)
   - B. Live INTTRA/AS2 integration now
   - X. Other
   - `[Answer]:` A *(provisional)*

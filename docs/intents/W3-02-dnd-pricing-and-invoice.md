# Intent Statement — W3-02 D&D Pricing & Invoice Emission

## Intent

The **cash end of Journey 1 closes**: Booking recognises a D&D-bounding movement from CMM's status stream, makes the synchronous D&D pricing request to Charge, holds the result, and **emits invoices (booking-time + D&D) to the external Finance seam**. This is the final missing arc of the Vision's Journey 1. **Driver: Booking team.**

## Context Pack (read before starting)

1. `docs/program-vision-document.md` §3 Journey 1 steps 6–8; §5 `invoice.booking`/`invoice.dnd` contract rows
2. `docs/enterprise-contracts/bilateral-contract-booking-charge-pricing.md` (dnd-request/result payloads)
3. W3-01 outputs (live D&D engine + signed fixtures); W2-04 outputs (DCSA-coded status events)
4. `services/booking-service/` D&D scaffolding (`DndPricingPort`, trigger candidates — build on it)

## Vertical Slice Definition

One booking billed end-to-end: booking confirmed (W1-01) → container moves through DISC → GTOT (W2-04, real events) → Booking's trigger matches the bounding pair (rule-type derived from Charge) → live `pricing.dnd-request` → itemised D&D result stored on the booking → **invoice payloads (booking-time + D&D) emitted to a Finance ACL endpoint** → visible on the booking detail (Charges tab).

- **Thinnest viable form:** demurrage only (DISC→GTOT), one invoice per charge event, Finance = a stub receiver service standing in for the external ERP (the ACL + payload are real; the ERP is not ours).
- **Deferred:** detention/combined triggers (fast follow within the intent if time allows), credit notes/corrections, invoice numbering rules from Finance.

## In Scope / Out of Scope

- **In:** trigger logic (bounding-move recognition per rule types), sync D&D call, result storage, invoice aggregate + emission via ACL, booking detail Charges tab showing booking-time + D&D lines + invoice status.
- **Out:** AR/GL/collections (external by Vision); D&D disputes/waivers.

## Actors & Journey

Finance-facing: charges accrue on the booking automatically as movements arrive; an agent sees the D&D line appear and the invoice emitted — no manual re-keying (the Journey-1 outcome, verbatim).

## Cross-Module Seams (must be real)

`pricing.dnd-request`/`-result` live sync to Charge; `containermovement.status` consumption (live, W2-04 payloads); `invoice.booking`/`invoice.dnd` **outbound ACL** — Booking conforms to the Finance contract shape (define it in `contracts/openapi/finance-invoice.yaml`, dual sign-off with the stub owner).

## Standards Alignment

Move codes DCSA; invoice lines carry charge-codes + ISO 4217; correlation id traverses movement → D&D request → invoice (end-to-end trace per Enterprise §observability).

## Definition of Done (observed, not "tests pass")

On live Compose: (1) drive booking → confirm → DISC → (free time elapses — clock control) → GTOT; (2) observe the trigger fire and the live D&D call; (3) booking detail Charges tab shows the itemised D&D lines; (4) invoice payloads received by the Finance stub with correct contents (both invoice types); (5) duplicate status redelivery does not double-bill (idempotency observed); (6) full-journey correlation id visible across all hops; (7) both audits green.

## Dependencies

W3-01 (engine), W2-04 (DCSA status events), W1-01 (spine).

## Suggested Scope & Sizing

`feature`. ~4 vertical units: (U01) trigger recognition live from status events; (U02) live D&D pricing round-trip stored + rendered; (U03) invoice aggregate + Finance ACL emission; (U04) idempotency/clock/correlation hardening.

## Open Questions

1. How do we control time in the DoD run (free-time elapse)?
   - A. Injectable clock + test-only time-advance endpoint on local profile (recommended)
   - B. Zero-free-time rate seeded for the demo
   - X. Other
   - `[Answer]:` A — injectable clock + a test-only time-advance endpoint on the local profile.

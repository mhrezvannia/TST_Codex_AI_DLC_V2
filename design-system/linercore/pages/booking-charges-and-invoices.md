# Booking Charges & Invoices Page Contract

## Authority and route

W3-02 extends the existing canonical Booking detail route through its Charges
tab. It adds no Finance module, shell navigation item, independent invoice
workbench, or manual accounting workflow.

| Route/surface | Purpose |
|---|---|
| `/booking/[bookingId]` Charges tab | Booking-time and D&D line items, totals, pricing evidence, invoice delivery status |
| Charges-tab evidence disclosure | Correlation, movement boundary, idempotency, source versions, and delivery evidence |

## Information hierarchy

1. Current financial summary: booking reference/revision, currency, booking-time
   total, D&D total, grand total, and overall invoice delivery status.
2. Booking-time charges: existing itemised pricing snapshot and provenance.
3. D&D accrual: readable rule name and DISC→GTOT boundary, occurred times,
   elapsed/free/chargeable days, rate and calculated lines.
4. Invoice delivery: invoice type, immutable reference, amount/currency,
   created/attempted/delivered time, status, and safe retry ownership.
5. Collapsed evidence: correlation id, source agreement/rule/rate versions,
   movement ids, idempotency result, and bounded payload evidence.

Every line shows charge code/meaning, basis, quantity or days, unit rate, amount,
currency, pricing reference, and source version. Totals cannot silently combine
currencies.

## State model

Design awaiting bounding movement, within free time/zero, pricing pending,
priced, invoice pending, emitted, failed/retryable, duplicate redelivery ignored,
denied, partial/degraded, Charge unavailable, Finance unavailable, and stale-data
states. Available booking facts remain visible when one financial section fails.
No state offers disputes, waivers, AR/GL, credit notes, or manual invoice entry.

## Responsive and accessibility contract

- 1024/1440: summary and line tables lead; invoice/evidence status may use a
  compact secondary column without nested cards.
- 768: sections stack; tables use labelled inner overflow.
- 375: line items become semantic records with basis, amount, and status visible;
  evidence remains progressively disclosed.
- Pending/status changes use polite announcements. Failed delivery uses textual
  reason and recovery ownership. Keyboard order follows visual order, and every
  disclosure/control has an accessible name.

## Skill decision record

Adopt explicit system feedback, readable line items, accessible names, keyboard
navigation, and stable skeletons. Reject new palettes/fonts, spinner-only waits,
decorative finance charts, and prose-heavy full-width layouts.

# Frontend Components - U03 Agreement Pricing

## Component Extensions

U03 extends the stable Booking detail route and BFF from U01/U02; Charge remains server-to-server and has no browser endpoint.

```text
app/
  bookings/[bookingId]/page.tsx
  api/bookings/[bookingId]/price/route.ts
components/booking/
  BookingActionRail.tsx
  PricingSummary.tsx
  PricingLineTable.tsx
  ManualPricingPanel.tsx
  PricingStatusNotice.tsx
```

## `BookingActionRail`

- `VALIDATED`: Price is the one primary command; Confirm is unavailable.
- Request in flight: preserve stable dimensions, disable duplicate activation, and show progress without persisting a Booking pending state or issuing another distinct key.
- `PRICED`: Confirm becomes the next primary command; Price is no longer primary.
- `MANUAL_PRICING`: Confirm remains unavailable; expose explicit Retry Pricing only as a deliberate command using the same booking/amendment identity where valid.
- 409 `PRICING_IN_PROGRESS` keeps pending state. 409 conflict displays corrective guidance and never silently changes the request.

## `PricingSummary` and `PricingLineTable`

`PricingSummary` renders `pricingBasis`, `pricingRef`, received time, and a derived USD total. `PricingLineTable` always preserves the itemized source of truth with charge code, category, amount, and currency columns.

Behavior and accessibility:

- Amounts use locale-aware currency formatting from exact decimal strings; client code does not recalculate rates.
- Rows follow server order and use stable charge code/position keys.
- Category is visible as text, not color alone.
- Empty charges in a success payload are treated as a contract error and show unavailable, never `$0.00`.
- Desktop uses a compact table; narrow screens use an unframed definition-list row layout with no horizontal text overlap.
- The D&D applicability section is absent when the persisted list is empty; no hard-coded trigger explanation is shown.

## `ManualPricingPanel`

The panel displays the Booking-owned work item, exact safe reason mapping, correlation ID, and whether Charge was reached. It supports these distinct states:

| Source/reason | User-visible treatment | Available action |
|---|---|---|
| `NO_RATE` | No approved agreement or tariff resolved | Correct commercial inputs or Retry after agreement setup |
| `AMBIGUOUS_ACTIVE_AGREEMENT` | Conflicting agreement authority requires review | Open Charge agreement workflow; Retry later |
| `PRICING_VALIDATION` / commodity | Pricing inputs need correction | Return to relevant Booking fields |
| timeout/503 | Pricing service unavailable | Retry explicitly |
| circuit open | Pricing temporarily paused after repeated failures | Retry only after recovery window |

The panel never shows fallback charges, stale quote lines, raw HTTP errors, stack traces, or internal service locations. Retry preserves the stable detail route and announces the resulting state.

## BFF Price Handler

`POST /api/bookings/[bookingId]/price`:

1. Accepts no client-supplied Charge URL, service identity, pricing amount, or amendment sequence.
2. Derives actor/service identity and correlation server-side and calls Booking's price command only.
3. Maps 200 priced/manual Booking outcomes, 409 in-progress/conflict/changed, 422 validation, 404, and 503 distinctly.
4. Enforces response size and timeout, strips unsafe upstream details, and returns stable code/message/correlation fields.
5. Never calls Charge directly from the browser or duplicates Booking's retry/circuit logic.

## Interaction Flow

1. A persisted `VALIDATED` Booking detail exposes Price.
2. Activation transitions the action rail to stable pending state and announces `Pricing requested`.
3. Success replaces the pending notice with complete itemized pricing and exposes Confirm.
4. Manual outcome focuses `ManualPricingPanel`, keeps route and entered data, and leaves Confirm unavailable.
5. In-progress keeps pending state; conflict or changed Booking requires refresh/correction; unavailable preserves the manual work-item truth without fake data.

## Test Surface

- Action matrix for `VALIDATED` (idle/in-flight), `PRICED`, and `MANUAL_PRICING`.
- Itemized USD rendering, category labels, derived total, long references, and empty-line contract failure.
- Separate no-rate, ambiguity, validation, timeout/503, circuit-open, in-progress, conflict, and changed-booking presentations.
- Duplicate-click prevention, focus movement, live announcements, explicit retry, and no browser-to-Charge request.
- Desktop/tablet/mobile no-overlap checks for long charge codes, reasons, and correlation IDs.

## Source Coverage

Components implement U03 in `unit-of-work.md`, US-W1-003/US-W1-004 from `unit-of-work-story-map.md`, pricing/manual UI acceptance in `requirements.md`, C10/C11 ownership in `components.md`, BFF/client methods in `component-methods.md`, and browser-to-BFF-to-Booking-to-Charge boundaries in `services.md`.

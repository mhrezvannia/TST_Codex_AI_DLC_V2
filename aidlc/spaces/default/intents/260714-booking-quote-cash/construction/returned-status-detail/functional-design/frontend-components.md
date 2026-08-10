# Frontend Components - U05 Returned Status Detail

## Booking Detail Composition

U05 completes the stable `/bookings/{bookingId}` experience using only the Booking BFF/detail API.

```text
app/
  bookings/[bookingId]/page.tsx
  api/bookings/[bookingId]/route.ts
components/booking/
  BookingDetailTabs.tsx
  JourneyStatusPanel.tsx
  MovementFact.tsx
  StatusTimeline.tsx
  TransportAuditDetails.tsx
  RetryStatusButton.tsx
```

## `JourneyStatusPanel`

The panel renders one tagged server state with stable dimensions:

- `NOT_CONFIRMED`: no downstream status claim.
- `PENDING_EVENT`: confirmation is committed and returned status has not arrived; one-second bounded revalidation starts.
- `AVAILABLE`: render canonical movement fact and stop polling.
- `DELAYED`: bounded polling ended; preserve confirmed state and expose explicit Retry.
- `UNAVAILABLE`: local detail request failed; preserve last displayed data when available and expose Retry.

It never contacts CMM directly and never substitutes demo/fallback movement data.

## `MovementFact`

Render container reference, derived status, move code, classifier label, occurred and received times, empty/laden indicator, transshipment, and optional location. Planned/estimated/actual is shown as text and semantic status, not color alone. Location fields are omitted individually when null; an absent location is not displayed as an empty code.

Late-arrival provenance is visible through both occurred and received times. The component receives already typed/string-safe API data and performs presentation formatting only.

## Bounded Revalidation

The focused client controller uses one fixed schedule:

1. Start only for confirmed `PENDING_EVENT` after hydration.
2. Revalidate the local detail BFF every one second, at most 30 attempts.
3. Pause when `document.visibilityState` is hidden and resume without burst catch-up.
4. Abort on unmount/route change and prevent overlapping requests.
5. Stop immediately on `AVAILABLE` or terminal local read error.
6. On first availability, announce `Movement status received` once and move focus only when initiated by the confirm workflow, not during passive refresh.

## `TransportAuditDetails`

A collapsed disclosure shows safe operational provenance: event ID, source, schema version, correlation ID, received/projected time, and Booking outbox status. Topic/partition/offset may appear only for authorized operator views. Raw record, DLT payload, stack trace, broker host, and credentials are never rendered.

## Detail BFF

- Server-side `GET /api/bookings/[bookingId]` calls Booking only, forwards/generated correlation and service identity, and maps 200/404/503 safely.
- Response is non-cacheable while pending and may use short revalidation after availability.
- It preserves tagged journey state and exact canonical field names in the local view model.
- A failed refresh does not erase a previously rendered persisted status.

## Test Surface

- All tagged states and transitions, including pending to available, 30-attempt delayed, hidden-tab pause, abort, and retry.
- Ordering regression fixture: a stale event never changes rendered status after refresh.
- Planned/estimated/actual labels, null location, long codes/IDs, occurred-vs-received times, and transshipment.
- No browser CMM traffic, no fallback records, safe audit disclosure, keyboard access, live announcement, and no-overlap desktop/mobile screenshots.
- Browser-timed live evidence from confirm response to visible status, with p95 <=5 seconds and all errors included.

## Source Coverage

Components implement U05 in `unit-of-work.md`, US-W1-005 from `unit-of-work-story-map.md`, detail/latency acceptance in `requirements.md`, C10/C11 ownership in `components.md`, detail/projection methods in `component-methods.md`, and bounded eventual-consistency behavior in `services.md`.

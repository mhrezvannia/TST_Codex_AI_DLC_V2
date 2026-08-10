# Frontend Components - U04 Confirm to CMM Journey

## Booking Detail Extensions

U04 extends the existing Booking detail route and local BFF; it introduces no CMM browser client.

```text
app/
  bookings/[bookingId]/page.tsx
  api/bookings/[bookingId]/confirm/route.ts
components/booking/
  BookingActionRail.tsx
  ConfirmationStatus.tsx
  JourneyStatusPanel.tsx
```

## `BookingActionRail`

- `PRICED`: Confirm is the one primary command.
- Confirm in flight: stable busy dimensions, duplicate activation prevented, route retained.
- `CONFIRMED`: Confirm is no longer actionable; show the committed revision and pending journey state.
- Any state without a complete quote, including `MANUAL_PRICING` and request-local pricing busy state, keeps Confirm unavailable.

The client sends only its local BFF command. The BFF requires or generates the confirmation idempotency key under server policy and passes actor/correlation identity to Booking.

## `ConfirmationStatus`

Shows Booking-owned confirmation truth separately from downstream delivery:

| Booking/outbox state | Presentation |
|---|---|
| Confirm command pending | `Confirming booking` progress |
| Booking committed, outbox pending/claimed | `Confirmed - opening journey` |
| Booking event published, no return yet | `Confirmed - awaiting movement status` |
| Relay retryable failure | `Confirmed - delivery delayed` with safe retry monitoring state |
| Permanent relay failure | `Confirmed - event needs attention` with correlation/support evidence |

The UI never changes `CONFIRMED` back to failure because broker publication is asynchronous. It does not expose broker host, raw errors, topic offsets, or stack traces.

## `JourneyStatusPanel`

U04 provides the empty/pending shell consumed by U05:

- Before confirmation: no journey section action.
- After local confirmation but before returned status: pending indicator and committed revision.
- Unavailable detail read: preserve stable route and show retry without fabricated status.
- Returned planned status rendering is owned by U05; U04 does not query CMM synchronously.

## Confirm BFF Handler

`POST /api/bookings/[bookingId]/confirm`:

1. Accepts no pricing fields, event ID, revision, CMM URL, or event body from the browser.
2. Derives/validates idempotency, actor, and correlation server-side.
3. Calls Booking's confirm endpoint and maps 200/409/422/503 safely.
4. Returns Booking confirmation and outbox-delivery summary only; it never waits for CMM or invokes the retired CMM compatibility endpoint.
5. Same-key replay returns the same revision/event identity without duplicate UI transitions.

## Interaction and Accessibility

1. Agent reviews the itemized priced Booking and activates Confirm.
2. Busy state announces `Confirming booking` and prevents another activation.
3. Successful local commit announces `Booking confirmed` and moves focus to confirmation status.
4. Journey panel shows asynchronous pending state while the stable `/bookings/{bookingId}` route remains usable.
5. U05 replaces pending with the returned planned movement projection.

Status is represented by text and semantics, not color alone. Long booking IDs, correlation IDs, and delayed-delivery messages wrap without changing toolbar dimensions on desktop or mobile.

## Test Surface

- Confirm enablement only from priced state and no submission from manual/pending/unvalidated states.
- Busy/duplicate-click behavior, same-key replay, stale/invalid conflict, and confirmed/pending journey rendering.
- Assert browser traffic reaches only the Booking BFF; no CMM HTTP request or fallback record exists.
- Separate local confirmation, relay pending, delayed, permanent attention, and detail unavailable states.
- Keyboard focus, live announcements, long identifier wrapping, and no-overlap screenshots across supported viewports.

## Source Coverage

Components implement U04 in `unit-of-work.md`, US-W1-004 in `unit-of-work-story-map.md`, confirmation/pending UI acceptance in `requirements.md`, C10/C11 ownership in `components.md`, confirm/BFF methods in `component-methods.md`, and the Kafka-only asynchronous topology in `services.md`.

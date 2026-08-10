# Frontend Components - U07 Live Release Acceptance

## Production UI Scope

U07 adds no acceptance-only controls or explanatory panels to the product. It verifies the complete Booking UI delivered by U01-U05 through real browser interactions and leaves replay/schema/Compose controls outside the end-user surface.

## Browser Journey Specification

Playwright drives these stable routes through nginx host port 8088:

1. `/bookings` loads real collection states and navigation.
2. `/bookings/new` completes live reference selection and canonical one-leg/one-equipment form using keyboard and pointer paths.
3. `/bookings/{bookingId}` renders persisted draft, validation, itemized quote, confirmation, pending journey, and returned planned movement.
4. The same detail route renders manual-pricing, validation-error, delayed/unavailable, and Retry states without fallback records.
5. Full refresh and Booking/CMM restart preserve the URL and persisted visible state.

Network assertions prove browser calls only local BFF routes, Booking performs real Reference/Charge calls, and no Booking-to-CMM HTTP request occurs.

## Visual and Accessibility Matrix

| View/state | Required checks |
|---|---|
| List/loading/empty/error/data | Stable dimensions, keyboard navigation, readable density. |
| Create/live references | Labels, combobox semantics, focus/errors, long values, unavailable state. |
| Validation blocked/valid | Summary focus/links, no false invalid on outage, primary action progression. |
| Pricing/manual | Itemized lines, safe reasons, no guessed data, Confirm blocked. |
| Confirm/pending/status | Live announcements, bounded polling, classifier/move/location, delayed Retry. |
| Restart/recovery | Last persisted data retained where safe, explicit unavailable, successful retry. |

Run desktop and mobile viewports with bounding-box overlap assertions, screenshot capture, WCAG 2.1 AA contrast, keyboard-only completion, visible focus, and live-region verification. Text must wrap without clipping or resizing fixed controls.

## Timing Instrumentation

The round-trip harness records a monotonic timestamp when the successful Confirm response is received and another when the matching returned status event ID is visibly rendered. It uses unique bookings/containers per measured sample and includes browser/API errors as failed samples. Client wall-clock timestamps are evidence metadata only; elapsed measurement uses monotonic time.

## Failure Presentation Assertions

- Reference unavailable is distinct from invalid fields.
- `NO_RATE`, pricing validation, timeout/503, and circuit-open all show explicit manual state with no quote.
- Confirmed event delay does not revert confirmation.
- Pending after bounded polling becomes delayed with Retry, not fake success/failure.
- Existing returned status remains visible through CMM/Kafka outage and restart.
- Raw infrastructure errors, credentials, internal URLs, DLT payloads, and stack traces never appear.

## Evidence Capture

Each screenshot/network trace/accessibility report is tied to run ID, viewport, route, booking/container/correlation IDs, command step, assertion, and SHA-256 in the manifest. Screenshots with failed assertions remain indexed as failed evidence rather than being replaced silently.

## Source Coverage

Components verify U07 in `unit-of-work.md`, US-W1-007 from `unit-of-work-story-map.md`, UI/accessibility/performance acceptance in `requirements.md`, C10-C12 ownership in `components.md`, real BFF/service interfaces in `component-methods.md`, and localhost/Compose eventual-consistency behavior in `services.md`.

# Frontend Components - U02 Reference Validation

## U01 Component Extensions

U02 extends the stable server pages/BFF and focused client components from U01; it does not recreate a workbench or add a global shell.

```text
app/
  bookings/new/BookingCreateForm.tsx       live reference comboboxes
  bookings/[bookingId]/page.tsx            validation snapshot/state
  api/bookings/[bookingId]/validate/route.ts
  api/reference-options/route.ts            server-only Reference Data search
components/booking/
  ReferenceCombobox.tsx
  ValidationSummary.tsx
  ReferenceVerificationList.tsx
  BookingActionRail.tsx                    Validate or Price, never both primary
```

## `ReferenceCombobox`

Props identify reference set, field path, selected stable value, label, required state, and optional route-coherence context. Client state holds query text, open/closed state, highlighted option, loading/no-match/unavailable status, and abort controller identity.

Behavior:

- Search local BFF only and display `code - label`.
- Debounce text queries and cancel stale requests; stale responses never replace newer options.
- Support keyboard open/search/highlight/select/escape and expose listbox/combobox semantics.
- Distinguish no matching option from provider unavailable.
- Preserve the selected stable code/ID even if option refresh fails; do not silently substitute another record.
- Option selection updates form shape only. The UI continues to label the Booking unvalidated until the command succeeds.

## `ValidationSummary`

For `VALIDATION_BLOCKED`, render one blocking summary ordered by field path. Each item uses stable reason-to-message mapping and links to the corresponding correction field. It shows no raw transport data. Repeated validation replaces the summary instead of stacking duplicates.

For provider unavailable, render an inline recoverable alert with correlation ID and Retry. It does not mark individual fields invalid or change the displayed persisted status.

For valid state, render compact verified indicators beside customer/routing/voyage/equipment and announce `Booking validated` once after the command response.

## `BookingActionRail`

- `DRAFT` or `VALIDATION_BLOCKED`: Validate is the one primary action; Price and Confirm are unavailable.
- Validation request in flight: action has stable busy dimensions, duplicate activation is prevented, and current detail remains visible.
- `VALIDATED`: Price becomes the one primary action; Validate becomes a secondary recheck only when the reference fingerprint is unchanged.
- Provider unavailable: Retry validation is available; no optimistic validated state.

## BFF Integration

### Validate handler

- Accept only POST, derive/forward correlation and service identity, apply timeout, and call Booking's validation endpoint.
- Normalize 200 valid/blocked business outcomes, 409 booking-changed, 404, and 503 provider-unavailable distinctly.
- Never call Reference Data from the browser or duplicate Booking's aggregate decision in TypeScript.

### Reference options handler

- Allow only enumerated sets needed by Booking, bounded search/page size, and ACTIVE records.
- Strip unrelated provider attributes and cache only within safe short server-response semantics; validation never reads this cache.
- Fail closed outside local profile when service identity is absent.

## Interaction Flow

1. Agent creates/reopens the real draft.
2. Detail action calls Validate and keeps the route stable.
3. Blocked result focuses the summary; correction links return to the form/field with values preserved.
4. Valid result updates detail state, marks verified references, enables Price, and announces success.
5. Unavailable result retains the previous business state and offers Retry without fallback options/data.

## Test Surface

- Combobox keyboard semantics, stale-request cancellation, active-only options, no-match vs unavailable, and selected-value preservation.
- Validation action for valid, multiple blocked fields, route mismatch, booking-changed, not-found, and provider-unavailable.
- Action rail state matrix and no Price/Confirm before validated.
- Error-summary focus/field links and live announcements.
- Desktop/tablet/mobile no-overlap with long codes/labels and unavailable messages.

## Source Coverage

Components implement U02 in `unit-of-work.md`, US-W1-002 in `unit-of-work-story-map.md`, UI/failure acceptance in `requirements.md`, C10-C11 ownership in `components.md`, BFF/validation signatures in `component-methods.md`, and browser-to-BFF-to-Booking-to-Reference boundaries in `services.md`.

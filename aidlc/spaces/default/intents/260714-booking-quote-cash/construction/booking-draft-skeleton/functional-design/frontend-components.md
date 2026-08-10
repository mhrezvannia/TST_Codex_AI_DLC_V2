# Frontend Components - U01 Booking Draft Skeleton

## Route and Component Tree

```text
app/
  bookings/
    page.tsx                    BookingListPage (server)
    loading.tsx                 ListSkeleton
    error.tsx                   BookingListError (client recovery boundary)
    new/
      page.tsx                  NewBookingPage (server)
      BookingCreateForm.tsx     focused client form
    [bookingId]/
      page.tsx                  BookingDetailPage (server)
      loading.tsx               DetailSkeleton
      not-found.tsx             BookingNotFound
  api/bookings/
    route.ts                    list/create BFF
    [bookingId]/route.ts        detail BFF
components/booking/
  BookingTable.tsx
  BookingMobileList.tsx
  BookingFilters.tsx
  BookingHeader.tsx
  RoutingSummary.tsx
  EquipmentSummary.tsx
  LifecyclePlaceholder.tsx
lib/booking/
  server-client.ts              server-only fetch/identity/correlation/timeout
  contracts.ts                  canonical UI/API types
  errors.ts                     normalized error union
  query.ts                      URL filter parsing
```

U01 deletes/replaces the monolithic `BookingWorkbench` and any fallback demo arrays. Existing `@erp/ui` primitives are reused; no global W2-01 shell is added.

## Server-Owned Responsibilities

### `BookingListPage`

- Parse `q`, `status`, and `page` from the URL using bounded defaults.
- Call the server-only BFF/client and render real rows, empty state, or unavailable state distinctly.
- Provide an icon-only plus action with tooltip/accessible name `New booking` linking to `/bookings/new`.
- Preserve query parameters in detail/back navigation.

### `NewBookingPage`

- Load live reference option DTOs through server-owned endpoints when available; an unavailable dependency renders a retryable page state rather than demo options.
- Render the client form with empty/default-explicit initial values and no backend configuration.

### `BookingDetailPage`

- Fetch by route `bookingId` and call framework not-found behavior for 404.
- Render header, canonical route, equipment, revision/status, and reserved unframed sections for validation/pricing/journey slices.
- Keep known booking header/data visible when later extension requests fail; U01 itself has one detail fetch.

### BFF handlers and `server-client`

- Read environment-only Booking base URL and local service identity.
- Require/forward idempotency and correlation IDs, set bounded timeouts, disable unsafe caching for command/detail reads, and normalize errors into safe typed JSON.
- Never expose upstream hostnames, stack traces, credentials, or raw response bodies.

## Client Component State

### `BookingCreateForm`

State is limited to field values, touched/error state, current request token, submission state, and live announcement. It does not own persisted Booking data.

Field groups:

- Customer: customer combobox.
- Routing: load UN/LOCODE, discharge UN/LOCODE, voyage comboboxes; U01 renders one leg.
- Equipment: equipment type combobox, fixed visible quantity 1, ISO 6346 equipment ID input.
- Shipment terms: visible read-only USD, FCL, dry, non-reefer, non-DG values.

On submit:

1. Validate local required/cardinality/format shape.
2. If invalid, focus summary and link to fields.
3. Reuse the current idempotency token for retry of unchanged values; reset it when business payload changes after a completed/failed conflict.
4. POST to local BFF only.
5. On 201/replay success, announce `Booking created` and navigate to detail.
6. On normalized field/global error, retain values and focus the correct surface.

### `BookingFilters`

Search/status/page write URL parameters through router navigation; the server page remains data owner. Debouncing may improve ergonomics but cannot hide submitted filter state from browser history.

## Props and View Models

- `BookingListItemView`: ID, booking number, customer code/label, load/discharge labels/codes, voyage, equipment type/ID, revision, status, updated time, detail URL.
- `BookingDetailView`: canonical route/equipment arrays, shipment terms, lifecycle/pricing/journey extension models, audit summary IDs only when expanded later.
- `ReferenceOption`: stable code, label, active flag; inactive options are not selectable for new U01 input even though U02 remains authoritative validation.
- `BookingFormValues`: exact canonical business fields; no `originLocationId`, `destinationLocationId`, `equipmentType`, `containerId`, or generic `attributes` aliases.
- `BookingUiError`: `validation`, `conflict`, `notFound`, `unavailable`, or `unexpected`, with safe correlation ID and field paths where applicable.

## Interaction and Accessibility

- All controls have visible labels and error/described-by associations; error summary receives programmatic focus after failed submission.
- Comboboxes support keyboard search/selection and display code plus label.
- Booking numbers are actual links; table selection does not depend on row click.
- Status always combines text and color. Loading skeleton dimensions are stable and cannot resize the layout.
- Desktop uses the approved table/two-column create/detail layout; tablet prioritizes columns; mobile uses semantic stacked rows and a reserved sticky action area.
- Success/errors use polite/assertive live regions as appropriate. Focus moves only for navigation or blocking validation, not background data refresh.
- UI contains no transport tutorial text, Kafka names, fake business values, nested cards, decorative gradients/orbs, or oversized marketing headings.

## Test Surface

- Server/BFF tests: URL filter parsing, header propagation, timeout/error normalization, 404, no fallback.
- Form tests: required fields, ISO format feedback, value retention, idempotency token reuse/change, success navigation/focus announcement, conflict/unavailable handling.
- List/detail tests: real links, empty vs unavailable vs not-found, canonical field rendering, responsive semantic variants.
- Browser proof: create, refresh detail, back-to-filtered-list, keyboard-only form, mobile sticky actions/no overlap.

## Source Coverage

The frontend tree implements U01 in `unit-of-work.md`, US-W1-001 in `unit-of-work-story-map.md`, route/accessibility acceptance in `requirements.md`, C10-C11 ownership in `components.md`, BFF/controller boundaries in `component-methods.md`, and browser-to-Booking-only communication in `services.md`.

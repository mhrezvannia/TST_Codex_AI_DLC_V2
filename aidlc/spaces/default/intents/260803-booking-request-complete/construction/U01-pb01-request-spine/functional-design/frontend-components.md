# Frontend Components - U01 PB-01 Request Spine

## UI Authority and Scope

U01 extends the Booking-owned `/booking` route subtree inside the one authenticated LinerCore shell. It reuses executable `@erp/ui`, `--erp-*` tokens, shared Lucide mappings, light/dark themes and established Booking create/detail patterns. It does not edit `packages/ui`, create a local primitive/theme, import another app, or introduce a second Booking implementation.

This artifact consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus the binding Refined Mockups (`mockups.md`, `interaction-spec.md`, `design-system-mapping.md`, `accessibility-checklist.md`). UI/UX Pro Max guidance retained here is limited to data-dense operational grouping, persistent labels, visible focus, linked errors, stable feedback, keyboard operation, reduced motion and responsive stacking. Marketing/hero/sales framing, replacement fonts/palette, decorative effects, dark-default styling and spinner-led blank loading remain rejected.

U01 implements the request-spine fields and recovery path needed by US-01. The shared form remains structurally compatible with the approved five semantic groups so U02/U03 can extend it without creating another form.

## Route and Rendering Boundaries

| Route | Rendering boundary | U01 responsibility |
| --- | --- | --- |
| `/booking/new` | Server page inside shell | Authenticate, establish page/breadcrumb context, load permitted initial option state and render the shared form in create mode |
| `/booking/{bookingId}?tab=overview` | Server detail page | Authorize read, load current projection, render exact request-spine evidence and one-time success status when supplied through safe navigation state |
| `/api/booking/bookings/drafts` | Thin shell route | Forward one typed create to Booking BFF; no domain logic |
| `/api/booking/operations/{operationId}` | Thin shell route | Forward read-only status lookup; never invoke create |
| `/api/booking/operations/{operationId}/retry` | Thin shell route | Forward only an explicit grant/version-bound same-identity retry |
| `/api/booking/reference-options` | Thin shell route | Forward bounded active customer/location/equipment option queries with create policy |
| `/api/booking/voyage-options` | Thin shell route | Forward bounded route/date-compatible voyage query |
| `/bookings...` and legacy create API | Compatibility surface | No new U01 behavior; U08 owns convergence |

Server reads use current operational truth (`no-store` where established). Client state is limited to form input, committed option evidence, dirty/pending state, the stable operation UUID, linked errors and deterministic focus targets.

## Component Hierarchy

```text
ShellBookingNewPage (server)
└── PageHeader / Breadcrumbs (shared shell framing)
    └── BookingRequestForm (Booking client composition)
        ├── BookingAndPartiesSection
        │   └── existing booking-customer compatibility field only
        ├── CargoSection
        │   └── fixed FCL-dry summary; U02 owns full cargo entry
        ├── RouteAndScheduleSection
        │   ├── ReferenceFieldState (POL)
        │   ├── ReferenceFieldState (POD)
        │   ├── RequestedDepartureField
        │   ├── ReferenceFieldState (voyage)
        │   └── CarrierScheduleEvidence
        ├── EquipmentRequestSection
        │   ├── ReferenceFieldState (equipment type)
        │   ├── EquipmentQuantityField
        │   └── PhysicalAssignmentNotice
        └── BookingReviewAndSave
            ├── RequestSpineReview
            ├── SaveStatusRegion
            ├── OperationStatusRefresh
            └── DirtyCancelControl / shared Dialog

ShellBookingDetailPage (server)
└── RecordHeader / RouteTabs
    └── Overview
        ├── RequestSpineSummary
        ├── CarrierScheduleEvidence
        ├── EquipmentRequestSummary
        ├── BookingNavigationNotice (one-time client flash)
        └── TechnicalDetails (collapsed, safe)
```

Text fallback: the server page supplies shell context and initial truth; one Booking-owned client form composes shared fields and feedback; the same evidence components render on canonical Overview after save.

## Component Contracts

### `BookingRequestForm`

| Aspect | Contract |
| --- | --- |
| Responsibility | Own transient U01 form state, stable create identity, advisory shape validation, save interaction and focus recovery; never determine provider authority |
| Props | `mode: "create"`; `permissions`; initial governed option/status data; fixed scope facts; optional validated `returnTo` |
| Local state | `fields`, committed reference/voyage objects, `dirty`, `operationId`, `submitState`, field/form errors, subset option states |
| Submit states | `idle`, `validationBlocked`, `pending`, `outcomeUnknown`, `notAcceptedRetryable`, `rejected`, `succeeded`, `denied`, `fatalSafe` |
| Invariant | At most one in-flight create; payload edit before submit rotates identity, but an in-flight/uncertain operation retains its identity |
| Shared building blocks | `Field`, `Input`, `Combobox`, `Button`, `Stack`, `Inline`, `Card`, `StatusStrip`, `Skeleton`, `FailureState` |

The form itself has no whole-form `aria-live`. Dedicated status regions announce only relevant changes.

The existing booking-customer field is canonicalized for the new endpoint as required `bookingCustomerPartyId`. It commits an active `PARTY_CUSTOMER` option from the live reference route. The unchanged legacy endpoint may continue to map this value to `customerId`; the new W3-04 DTO does not expose that alias. U02 later adds the remaining party roles and full party semantics.

### `RouteAndScheduleSection`

| Prop/state | Type | Purpose |
| --- | --- | --- |
| `portOfLoading` | committed location option or null | Canonical POL selection |
| `portOfDischarge` | committed location option or null | Canonical POD selection |
| `requestedDepartureDate` | ISO local-date string | Operator-owned POL-local preference |
| `selectedVoyage` | governed voyage option | Mandatory route-compatible identity/source, nullable provider version/derived facts |
| `optionState` | per-subset loading/available/unavailable | Truthful dependent-query state |
| `errors` | stable field-path map | Links server/client messages to controls |

POL/POD/date changes invalidate only dependent voyage selection/hints. They do not clear unrelated form state. A committed voyage fills read-only evidence; it never overwrites requested departure.

### `ReferenceFieldState`

This Booking composition wraps shared `Field` and `Combobox` without forking either. It accepts option kind/role, committed ID/version, query state, governed options and stable error/help IDs. States used by U01 are loading, available, no-match, unavailable and invalid selection. The full stale/inactive schedule matrix is U03 work.

Loading uses dimension-reserving `Skeleton` plus `#reference-status`. No-match uses the existing visible `emptyLabel`; unmatched free text is never committed. The list remains within the Field/page gutter, wraps long labels, scrolls vertically at its existing 240px cap, and relies on the approved page block-end space rather than an invented collision/flip primitive.

### `CarrierScheduleEvidence`

| Prop | Type | Rendering rule |
| --- | --- | --- |
| `requestedDepartureDate` | local date | Always labeled as requested preference |
| `voyageId`, `voyageVersion`, `source` | governed identity/provenance | Read-only; show unavailable facts truthfully |
| `carrierVoyageNumber` | optional string | Provider-derived only |
| `estimatedDepartureAt`, `estimatedArrivalAt` | optional instants | Machine-readable datetime with visible timezone |
| `cargoCutoffAt`, `documentationDeadlineAt` | optional instants | Machine-readable datetime with visible timezone |
| `completeness` | thin U01 available/incomplete state | Missing facts named without guessing; U03 later enriches classification |

The component uses `DefinitionList`, `StatusStrip` or `PartialDataNotice` according to available evidence. A difference between requested date and ETD is displayed neutrally; no unapproved warning tolerance is applied.

### `EquipmentRequestSection`

- `equipmentTypeCode` uses a committed canonical option.
- `quantity` is an integer input with `inputMode="numeric"`, server/client bounds `1..9999`, and PB-01 demo value `3`.
- There is no initial `equipmentId` input. `PhysicalAssignmentNotice` states that physical assignment is pending/later and that no ID will be fabricated.
- Fixed USD, FCL dry, non-reefer and non-DG facts are displayed as scope evidence rather than editable controls.

### `BookingReviewAndSave`

| Responsibility | Behavior |
| --- | --- |
| Review | Summarize route, requested departure, provider-derived schedule evidence, equipment type, quantity and null physical assignment |
| Save | Submit once with current stable operation UUID and disable duplicate triggers while pending |
| Unknown outcome | Render/focus `#save-status`; retain form and UUID; expose explicit Refresh status only |
| Proven non-acceptance | Expose one same-identity Retry only when the server returns `retryEligible=true` |
| Success/replay | Navigate to `/booking/{bookingId}?tab=overview`; announce once and focus record `h1` |
| Safe failure | Preserve input and show stable code/correlation without raw exception/provider payload |

### `OperationStatusRefresh`

This component is visible only for an accessible nonterminal operation. It performs `GET /api/booking/operations/{operationId}`, never POST. It handles `IN_PROGRESS`, `SUCCEEDED`, `REJECTED`, `OUTCOME_UNKNOWN`, `NOT_ACCEPTED` and `EXPIRED` using the server-provided recovery. It cannot create a new UUID, resubmit a command or infer retry eligibility.

A 2.5-second client/BFF boundary sets local `outcomeUnknown` only. It does not POST an operation-state update. An explicit same-identity Retry is rendered only after status returns `NOT_ACCEPTED`, `retryEligible=true`, `expectedClaimVersion` and `retryGrant`. That control calls dedicated `POST /api/booking/operations/{operationId}/retry` with the original canonical request plus the version/grant. An ordinary delayed draft POST has no grant and cannot reclaim the claim.

### `DirtyCancelControl`

- A clean form Cancel navigates to validated `returnTo` or `/booking`.
- A dirty form Cancel opens the shared `Dialog`; it does not navigate immediately.
- The Dialog is labeled by its `h2`, focuses the shared dialog container on open, traps focus, and offers **Keep editing** and **Discard and leave**.
- Keep editing, safe Escape, or close restores focus to the invoking Cancel control. Discard navigates to validated `returnTo` or `/booking` and clears only local unsaved state.
- Internal route departures use the same dirty guard. Browser/tab close may use the native `beforeunload` prompt without custom copy; no nested or local modal implementation is introduced.

### `BookingNavigationNotice`

Before successful `router.push('/booking/{bookingId}?tab=overview')`, the client writes a same-tab, non-sensitive `sessionStorage` flash keyed by booking ID with operation ID, notice kind (`created` or `saved`) and issue time. The destination component reads the exact booking key once, validates its short configured freshness and result identity, removes it before rendering/announcing, then focuses `h1#booking-record-title`. Direct reopen and refresh find no key and do not repeat the message. A `pageshow` handler suppresses a restored bfcache message after the key has been consumed. The flash contains no customer, route, cargo or provider data and is cleared on invalid/expired/session-boundary results.

### `RequestSpineSummary` on Overview

Renders exact persisted ID/reference/revision/status plus route, requested date, selected-voyage provenance/available schedule, equipment type, quantity and `Physical assignment pending`. The transient saved/created announcement is rendered once after successful navigation; later direct reopen shows the stable record without repeating it.

## Form and View Model

| UI field | Canonical payload field | Control | U01 validation/focus |
| --- | --- | --- | --- |
| Booking customer | `bookingCustomerPartyId` | Shared `Combobox` | Required active `PARTY_CUSTOMER`; new endpoint does not use `customerId` alias |
| Port of loading | `routing[0].portOfLoadingUnLocode` | Shared `Combobox` | Required, valid committed option; focus control from linked summary |
| Port of discharge | `routing[0].portOfDischargeUnLocode` | Shared `Combobox` | Required, valid committed option, distinct from POL |
| Requested departure | `requestedDepartureDate` | Shared `Input type="date"` | Required ISO local date |
| Voyage | `selectedVoyage.voyageId`, `.voyageVersion` | Shared `Combobox` plus `CarrierScheduleEvidence` | Required selected route-compatible candidate; derived evidence is displayed but re-resolved by Booking, not submitted as authority |
| Equipment type | `equipment[0].equipmentTypeCode` | Shared `Combobox` | Required committed active option |
| Quantity | `equipment[0].quantity` | Shared `Input` | Integer `1..9999`; PB-01 uses `3` |
| Physical equipment | `equipment[0].equipmentId` | No input; status text | Always null on initial U01 create |

Existing customer capture is retained and canonicalized as `bookingCustomerPartyId`, but U01 does not implement the remaining U02 party-role dictionary. No cargo-description `TextArea` substitute is introduced in U01; that shared W2-02 dependency belongs to U02 breadth.

## Interaction Flow

1. Server page authenticates and renders stable LinerCore page structure and initial Skeleton/option states.
2. Agent commits the active booking-customer, POL and POD canonical options and requested departure.
3. The form queries the bounded voyage seam and preserves unrelated inputs during loading or failure.
4. Agent commits a route-compatible voyage; available derived evidence is displayed read-only.
5. Agent commits equipment type and quantity `3`; the form explicitly shows no physical assignment.
6. Submit validates shape. Errors focus `#booking-errors`; no command is sent.
7. Valid submit sends one command to the canonical drafts route with the stable UUID and disables duplicate triggers.
8. A deterministic success navigates to canonical Overview and focuses the record heading.
9. A boundary-unknown response focuses `#save-status` and offers Refresh status. Refresh that discovers success follows step 8 without re-creating the booking.
10. Cancel from a dirty form opens the shared discard Dialog; keeping edits restores focus to Cancel, while confirmed discard returns to validated list context.

## API Integration and Safe Mapping

| Browser call | Headers/context | Client result mapping |
| --- | --- | --- |
| `GET /api/booking/reference-options?set={one-set}&query={q}&limit={n}` | Same-origin session/correlation, create policy, one of `PARTY_CUSTOMER`, `LOCATION`, `EQUIPMENT_TYPE`; bounded active-only search | `{items:[{id,code,displayName,version,status}]}`; no cursor in U01, empty items means no match, provider failure preserves committed/unrelated input |
| `GET /api/booking/voyage-options` | Same-origin session, correlation, `cache: no-store`; POL/POD/date query | Governed candidates or subset failure; never commit free text |
| `POST /api/booking/bookings/drafts` | `content-type`, stable `Idempotency-Key`, correlation; cookie/session through BFF | 2xx canonical result; 4xx stable field/policy result; uncertain boundary becomes outcome unknown |
| `GET /api/booking/operations/{operationId}` | Same-origin session/correlation; no command body | Server-authoritative operation state/recovery |
| `POST /api/booking/operations/{operationId}/retry` | Same-origin session/correlation; body contains expected claim version, signed retry grant and original canonical request | Re-authorize/re-fingerprint and attempt one fenced CAS; stale/reused/invalid grant returns status/error without create |
| `GET /api/booking/bookings/{bookingId}` via server read | Authorized read; `no-store` | Current privacy-shaped Overview projection |

The client never maps a generic timeout directly to safe retry. `OUTCOME_UNKNOWN` and `NOT_ACCEPTED` are distinct server/edge dispositions. Error mapping preserves stable field paths, code, recovery and correlation while suppressing raw exceptions and protected payloads.

Reference-option calls are owned by the create form: the server page may prefetch one bounded active result set, and focused client search/refresh uses the same search-only route. U01 has no cursor contract; the operator narrows the query when the bounded result does not contain a match. The BFF and Booking facade authorize `create` before provider work. Only `status=ACTIVE` options can be newly committed; ID/code/version are retained, display name is presentation only, and unavailable/no-match states use `#reference-status` without converting typed text into authority.

### Exact create request and response

The canonical draft POST body is:

```json
{
  "bookingCustomerPartyId": "party-id",
  "routing": [{"legSequence": 1, "portOfLoadingUnLocode": "USNYC", "portOfDischargeUnLocode": "NLRTM"}],
  "requestedDepartureDate": "2026-08-20",
  "selectedVoyage": {
    "voyageId": "voyage-id",
    "voyageVersion": null
  },
  "equipment": [{"equipmentTypeCode": "45G1", "quantity": 3, "equipmentId": null}],
  "currency": "USD",
  "cargoMode": "FCL_DRY",
  "reefer": false,
  "dangerousGoods": false
}
```

The create operation UUID is sent in `Idempotency-Key`, not duplicated in the body. Routing/equipment arrays preserve order; U01 sends exactly one entry in each. Voyage identity is required and unavailable provider version is an explicit null. Carrier number/source/schedule values shown from the option response are not trusted command fields; Booking re-resolves them. The canonical success body contains `bookingId`, `bookingReference`, `revision`, `status`, `request` with route/date/equipment plus authoritative `selectedVoyageSnapshot` (`voyageId`, nullable version, source, carrier number and four nullable schedule instants), and `operation` with `operationId`, `state`, `recovery`, and `correlationId`.

The new endpoint uses no legacy aliases. Only the unchanged compatibility adapter maps `customerId` to `bookingCustomerPartyId`, `loadUnLocode`/`dischargeUnLocode` to the canonical routing fields, and `id`/`bookingNumber` to the canonical response names. The form and fingerprint both use the canonical representation documented in `business-logic-model.md`.

## Focus, Status and Accessibility Contract

| Trigger/state | Stable target | Announcement/focus rule |
| --- | --- | --- |
| Client/server validation blocked | `#booking-errors` | Focus summary heading; every item links to its control |
| Reference loading/failure or explicit refresh | `#reference-status` | Polite status; passive failure does not move focus; invoked Retry result may focus status |
| Schedule evidence resolution | `#schedule-status` | Concise polite result; normal async completion does not steal focus |
| Save pending | `#save-status` | Polite saving announcement; button busy/disabled |
| Save outcome unknown/not accepted/rejected | `#save-status` | Programmatic focus after invoked action; exact recovery label |
| Success or replay | `h1#booking-record-title` | Focus after navigation; created/saved announcement once |
| Denied/not found | `h1#booking-page-status` | Safe failure focus; no protected facts |

All fields have persistent labels and active hint/error `aria-describedby` IDs. Status is never color-only. Native elements are preferred; combobox and dialog behavior comes from shared primitives. Focus rings use `--erp-focus-ring`, remain unclipped in forced colors, and motion respects reduced-motion preferences.

## Responsive Contract

| Width/evidence mode | U01 behavior |
| --- | --- |
| 375/390 px | One column, 16px gutter, at least 44px targets, in-flow full-width actions, no page-level horizontal scroll |
| 768 px | One column; two-up fields only when each remains at least 260px |
| 1024 px | Form/review grid only if form remains at least 640px; otherwise stack |
| 1440 px | Approximately 760px form plus 280-340px review rail inside the LinerCore content maximum |
| 200% zoom | Reflow without clipped labels, focus, status, evidence codes or actions |
| Light/dark/forced colors | Shared tokens only; status retains text/non-color meaning and visible focus |

The page reserves at least 256px below the final governed field so the existing Combobox list can be scrolled into view. Long option labels wrap, and lists scroll vertically within the shared primitive contract.

## Client State Invariants

1. Only committed canonical options enter the payload.
2. Changing POL/POD/date invalidates the dependent voyage selection but preserves unrelated state.
3. Requested departure and derived ETD are separate properties and labels.
4. There is one stable operation UUID for an in-flight or uncertain payload.
5. Duplicate submit paths are disabled while pending.
6. Refresh status is always GET and never calls submit.
7. The client never sets retry eligibility or invents a new identity after uncertainty.
8. Initial `equipmentId` is not editable and remains null.
9. Success uses canonical Overview and stable heading focus.
10. No local primitive, hardcoded palette, shell or page implementation is added.

## Verification Matrix

Construction evidence must cover: keyboard-only entry and submission; linked field errors; duplicate click/Enter/touch producing one command effect; 2.5-second outcome-unknown preservation and same-identity Refresh; exact success/replay navigation; protected denied/not-found states; live voyage evidence; quantity `3` and null ID; Skeleton and status behavior; reduced motion; light/dark/forced-color focus; 375, 390, 768, 1024 and 1440 px; 200% zoom; no horizontal overflow; safe correlation; and the canonical route/API chain on the running Compose stack. Screenshots without executable behavior are not PASS.

## Upstream Traceability

- `unit-of-work.md`: U01 shell-to-database vertical slice and live UI recovery Definition of Done.
- `unit-of-work-story-map.md`: US-01 primary plus UI/security/evidence contributions from US-03, US-07, US-09, US-10 and US-11.
- `requirements.md`: FR-005, FR-008 through FR-010, FR-024 through FR-030 and NFR-001 through NFR-010.
- `components.md`: Booking request/detail pages, form/action compositions, shell forwarder and BFF boundaries.
- `component-methods.md`: route contracts, form-controller behavior, draft create/status/detail/voyage methods and focus mapping.
- `services.md`: server/client split, same-origin security boundary, local performance boundary and deterministic recovery.

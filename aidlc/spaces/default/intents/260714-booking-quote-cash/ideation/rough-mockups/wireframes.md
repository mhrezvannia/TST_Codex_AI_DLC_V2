# Rough Wireframes - W1-01 Booking Quote-to-Cash

## Source And Visual Direction

These wireframes realize `ideation/intent-capture/intent-statement.md`, the Booking-local boundary in `ideation/scope-definition/scope-document.md`, and PU-01 through PU-06 in `ideation/scope-definition/intent-backlog.md`.

Per the user's direction, W1 inherits the visual language documented for W2-02 in `docs/intents/W2-02-design-system-foundation.md` and `design-inputs/claude-ui-export/Booking Directions.dc.html`, especially Direction B's quiet operational-console treatment:

- neutral work surfaces with a restrained navy anchor and semantic teal, amber, and red states;
- IBM Plex Sans for interface text and IBM Plex Mono for booking references, UN/LOCODEs, voyage codes, equipment codes, and amounts;
- compact panels and controls with radii no larger than 8px;
- a clear lifecycle strip and a persistent pricing summary on wide detail views;
- dense, scannable ERP information rather than marketing composition.

W1 changes that source direction where the real thin journey requires it. The global module rail, enterprise shell, fake capacity bar, multi-equipment quantities, D&D copy, and cross-module navigation are omitted. Styling is expressed through existing `@erp/ui` tokens/primitives; the wireframes do not authorize local hex values or a new Booking component library.

## Information Architecture

```text
[Booking list /bookings]
    |
    +----> [Create /bookings/new]
    |           |
    |           +----> [Detail /bookings/{id}]
    |
    +----> [Detail /bookings/{id}]
                    |
                    +----> [Validate]
                    +----> [Price]
                    +----> [Confirm]
                    +----> [Refresh movement status]
```

The Booking app root resolves to the list/work queue. Browser back returns from create/detail to the preserved list state. No W1 screen depends on a global shell or authenticated cross-module navigation.

## Screen 1 - Booking List And Work Queue

Desktop, populated state:

```text
+--------------------------------------------------------------------------------------+
| Booking                                                                              |
| Work queue                                      [Search bookings....]  [New booking] |
+--------------------------------------------------------------------------------------+
| [All 12] [Draft 3] [Validated 2] [Priced 2] [Confirmed 5]      [Status v] [Reset]    |
+--------------------------------------------------------------------------------------+
| Booking ref    Customer           Route          Equipment   Status       Updated    |
| BKG-204418     Pacific Rim        CNSHA-NLRTM    40HC x 1    CONFIRMED    10:42      |
| BKG-204417     North Star         SGSIN-DEHAM    40HC x 1    PRICED       10:31      |
| BKG-204416     Atlas Retail       CNSHA-NLRTM    40HC x 1    DRAFT        09:54      |
+--------------------------------------------------------------------------------------+
| Showing 1-12 of 12                                      [Previous]  Page 1  [Next]   |
+--------------------------------------------------------------------------------------+
```

Interaction notes:

- `New booking` is the one primary page command and navigates to `/bookings/new`.
- Search filters by carrier booking reference or customer display name; status uses a menu/select and `Reset` appears only when a filter is active.
- Each row contains a real link on the booking reference; the entire row may be clickable only when keyboard and screen-reader semantics remain equivalent.
- Status is text plus semantic badge; route and equipment use canonical codes.
- The list never falls back to invented data when the service fails.

State variants:

| State | Treatment | Recovery |
|---|---|---|
| Loading | Header and filters remain stable; table rows render content-shaped skeletons | Automatic |
| Empty first use | `No bookings yet` with one `New booking` action | Create |
| Empty filter | `No bookings match these filters` | Reset filters |
| Error | Inline alert above table: `Bookings could not be loaded` | Retry icon button with tooltip `Retry` |
| Partial/long | Long customer text truncates with full accessible value; compact pagination remains stable | Open detail |

Accessibility: one `h1`; `main` contains search/filter controls and a captioned table; first keyboard entry is the skip link then search; focus proceeds through filters, primary action, column headers, row links, and pagination.

## Screen 2 - Create Booking

Desktop, default state:

```text
+--------------------------------------------------------------------------------------+
| [< Back to bookings]    New booking                                                  |
|                         One direct routing leg and one dry FCL equipment line        |
+--------------------------------------------------------------------------------------+
| Customer and commercial                | Routing                                     |
| Customer           [Search/select....] | Load location       [UN/LOCODE select....]  |
| Commodity          [Search/select....] | Discharge location  [UN/LOCODE select....]  |
| Currency           [USD v]             | Vessel / voyage      [Voyage select.......] |
|                                        | Requested date       [Date.................]|
+----------------------------------------+---------------------------------------------+
| Equipment                                                                            |
| Type               [40HC v]            Quantity [1]       Equipment ID [Optional....]|
+--------------------------------------------------------------------------------------+
| Reference validation appears inline below each field after blur.                     |
|                                                                  [Cancel] [Create]   |
+--------------------------------------------------------------------------------------+
```

Interaction notes:

- Reference fields use searchable comboboxes backed by live canonical Reference Data; users select labels/codes rather than type opaque IDs.
- Quantity is fixed at one for this intent; use a disabled numeric field or non-editable value with an accessible explanation, not a hidden assumption.
- `equipmentId` is optional at initial confirmation and validates ISO 6346 only when supplied.
- `Create` remains disabled until local required fields are present; server/reference failures display inline text and a form-level summary.
- Successful creation navigates to the stable detail route. Cancel/back returns to the list without mutation.

State variants:

| State | Treatment | Recovery |
|---|---|---|
| Loading references | Individual combobox skeleton/loading indicator; rest of form remains usable | Automatic/retry field |
| Empty reference result | `No matching active reference` | Clear query or retry |
| Validation error | Field text explains the canonical value required; summary links to fields | Correct and resubmit |
| Service error | Form data stays intact; alert says the booking was not created | Retry |
| Busy submit | Create button shows progress and prevents duplicate submit | Wait; failure restores action |

Accessibility: one `h1`; `main` contains two labelled `fieldset` groups plus equipment; keyboard entry starts at Back then customer; labels are always visible, errors use `aria-describedby`, and the form summary receives focus after failed submit.

## Screen 3 - Booking Detail And Lifecycle

Desktop, priced and awaiting confirmation:

```text
+--------------------------------------------------------------------------------------+
| [< Bookings]   BKG-204418  Rev 1   [PRICED]                         [Refresh status] |
| Pacific Rim Trading Co.          CNSHA ---------------------> NLRTM                  |
| Last updated 10:42                                                               ... |
+--------------------------------------------------------------------------------------+
| 1 Request [done]    2 Validate [done]    3 Price [done]    4 Confirm [ready]         |
+---------------------------------------------------------+----------------------------+
| ROUTING                                                 | QUOTE                      |
| CNSHA Shanghai, CN  ---------------->  NLRTM Rotterdam  | USD 4,764.00               |
| MV Northern Mariner / 2614W                             | Quote PRT-2026-NEU         |
| Requested 28 Jun                                        | Pricing basis: Agreement   |
|                                                         |                            |
| EQUIPMENT                                               | [Re-price] [Confirm]       |
| 1 x 40HC Dry             Equipment ID: Not assigned     |                            |
|                                                         +----------------------------+
| MOVEMENT JOURNEY                                                                     |
| Not started - movement journey begins after confirmation.                            |
+--------------------------------------------------------------------------------------+
```

Confirmed while waiting for CMM:

```text
+--------------------------------------------------------------------------------------+
| MOVEMENT JOURNEY                                      Last checked 10:43   [Refresh] |
| [Pending] Confirmation sent. Waiting for the container journey to be created.        |
| This page checks for movement updates while it remains open.                         |
+--------------------------------------------------------------------------------------+
```

Confirmed with returned status:

```text
+--------------------------------------------------------------------------------------+
| MOVEMENT JOURNEY                                      Last updated 10:44   [Refresh] |
| [Journey active]   Move: LOAD   Classifier: ACT   Event time: 28 Jun 09:12           |
| CNSHA Shanghai, CN ------------------------------------------------> NLRTM Rotterdam |
| Source: Container Movement Management             Received by Booking: 10:44         |
+--------------------------------------------------------------------------------------+
```

Interaction and lifecycle notes:

- The lifecycle strip is an ordered list with completed, current, available, blocked, and failed states; it is not a generic progress animation.
- Only the next valid command is primary. Validate, Price, and Confirm are never simultaneously emphasized.
- Confirmation includes a concise review dialog because it creates an important commercial/operational transition. The dialog names the booking, route, equipment, and quote, traps focus, closes with Escape before submission, and returns focus to Confirm.
- After confirmation the request completes independently of CMM. The movement section switches to Pending, polls while pending, exposes last-checked time and a refresh icon button, and announces the eventual status update politely.
- Transport details such as Kafka offsets and schema IDs stay out of the operator view; correlation/event IDs may appear under a collapsed Audit details section for support use.
- Quote is a persistent right rail at wide widths, an unframed section below lifecycle content on tablet, and a collapsed summary with Expand control on mobile.

State variants:

| State | Treatment | Recovery |
|---|---|---|
| Detail loading | Stable page header, lifecycle, content, and quote skeletons | Automatic |
| Not found | `Booking not found` with Back to bookings | Return |
| Lifecycle failure | Inline alert next to failed step, server message in domain language | Retry valid command |
| Movement pending | Neutral pending strip, last checked, polling and manual refresh | Wait/refresh |
| Movement refresh error | Preserve last known status; text says updates are temporarily unavailable | Retry |
| Duplicate/stale event | No visible duplicate; last known valid status and timestamp remain stable | No operator action |
| Long/missing values | Codes do not wrap unpredictably; optional facts display `Not assigned` | None |

Accessibility: one `h1` containing the booking reference; `main` has lifecycle, commercial detail, quote `aside`, and movement sections with `h2`; keyboard entry starts at Back then Refresh and lifecycle command; dynamic status uses `aria-live="polite"` without stealing focus.

## Responsive Adaptation

Tablet and mobile preserve task order rather than shrinking the desktop layout:

```text
[Booking header]
       |
       v
[Lifecycle ordered list]
       |
       v
[Primary valid action]
       |
       v
[Routing]
       |
       v
[Equipment]
       |
       v
[Quote summary / expand]
       |
       v
[Movement status]
```

- At tablet widths, the pricing rail moves below the route/equipment region and lifecycle steps may wrap into two rows without changing order.
- At mobile widths, list rows become labelled summaries; create fields are one column; detail sections stack; primary actions remain at least 44px high.
- The page never requires horizontal scrolling. A locally scrollable table is a last resort only when its compact row alternative cannot preserve meaning.
- Test 320px, 768px, 1024px, and a wide desktop viewport, plus 200% browser zoom.

## Component Intent

| UI need | Existing / expected `@erp/ui` primitive | W1 composition |
|---|---|---|
| Commands | `Button`, icon button/tooltip | One primary lifecycle action; Refresh uses icon plus tooltip |
| Reference input | `Combobox`, `Select`, `Field` | Canonical label/code option rows and inline errors |
| Data queue | `Table`, `Badge`, `Skeleton`, `EmptyState` | Filterable Booking list with responsive row summary |
| Lifecycle | `StatusBadge`, ordered-list pattern | Request, Validate, Price, Confirm state strip |
| Commercial detail | `Panel`/unframed sections, definition lists | Route, equipment, quote, movement without nested cards |
| Confirmation | `Dialog` | Review facts before confirm |
| Feedback | `Toast`, inline alert, live region | Mutation result and asynchronous movement update |

Any missing primitive is specified during Refined Mockups/Application Design. W1 may compose existing primitives locally, but package-wide token/primitives work remains W2-02 ownership.

## Scope Contradiction Check

The visual inheritance request does not conflict with W1 scope because it reuses presentation cues and available `@erp/ui` capabilities. W1 explicitly does not claim W2-01 shell/auth completion or W2-02 package-wide migration/lint completion. The screens show only contract-backed one-leg, one-equipment, quantity-one, USD behavior and the real asynchronous movement loop.

## Review

Verdict: READY

### Findings

- Business alignment and W1 scope are disciplined: the artifacts keep the booking-desk quote-to-cash journey primary, limit behavior to one leg, one dry FCL line, quantity one, and USD, and defer shell/auth, cross-module navigation, D&D, amendments, cancellation, and package-wide design-system work.
- List, create, and stable detail routes are complete enough for downstream design and testing. Their commands, navigation, lifecycle transitions, preserved state, and responsive adaptations are explicit.
- Loading, first-use empty, filtered empty, validation, service, not-found, lifecycle failure, pending, refresh-error, duplicate/stale-event, long-value, and missing-value treatments are covered with recovery behavior and no fabricated fallback data.
- W2-02 inheritance is presentation-only: the document adopts visual cues and existing `@erp/ui` primitives while assigning package tokens, primitives, migration, and lint work to W2-02.
- Accessibility annotations meet the stage contract per screen and add testable keyboard order, landmarks/headings, visible labels and errors, dialog focus behavior, live-region behavior, 200% zoom, and 320px reflow expectations.
- Contract ownership language is unambiguous: Reference Data owns canonical validation, Charge owns pricing, Booking owns confirmation and its read projection, and CMM owns movement facts delivered asynchronously; the UI does not expose transport diagnostics or imply synchronous CMM confirmation.

### Validation Evidence

- `rough-mockups-questions.md` answers select list/create/detail, the lifecycle happy path, operational hierarchy, responsive support, WCAG 2.1 AA, and pending-plus-refresh movement feedback; both artifacts implement those choices without contradiction.
- `user-flow.md` traces every visible step to PU-01 through PU-06 and defines observable system responses and recovery paths that QA can turn into route, state-transition, retry, idempotency, accessibility, and viewport tests.
- The supplied completion evidence reports six successful required-sections/upstream-coverage sensor firings; this review found no unresolved product-readiness gap beyond those checks.

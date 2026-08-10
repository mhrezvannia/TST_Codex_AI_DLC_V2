# LinerCore Booking Operational Record Design

Status: Proposed for review

Route: `/bookings/{bookingId}`

Audited route:
`/bookings/ecebf4a8-bbbd-4468-980b-0e9dfdf0e73a`

Scope: UI/UX Pro Max design task only. No production code, runtime
configuration, API contract, automated test, or AI-DLC workflow was changed.

## Executive Decisions

1. Make the booking detail the central operational record, with one compact
   record header and four route-backed views: Overview, Charges, Journey, and
   Activity.
2. Show exactly one primary next action for the current lifecycle state. Do not
   show Validate, Price, and Confirm as three simultaneous primary buttons.
3. Treat `Validating`, `Pricing`, and `Confirming` as transient command states,
   not persisted booking statuses.
4. Put the current blocker immediately beside the primary action and repeat its
   actionable detail in Overview.
5. Keep list context in the allowlisted `returnTo` value and preserve it across
   tab changes, retries, conflicts, and command outcomes.
6. Use URL-backed tab navigation so Charges, Journey, and Activity can be
   linked, refreshed, and restored through browser Back. Do not load every view
   into one large client-side tab island.
7. Render commercial lines as a semantic table and calculate no authoritative
   totals in the browser. Subtotal, total, agreement, and rate-version evidence
   must come from a pricing snapshot contract.
8. Show Journey `PENDING_EVENT` honestly when the Booking projection has no
   movement status. Do not infer movement from confirmation time or route.
9. Resolve customer, voyage, location, charge, agreement, actor, and equipment
   references to business labels. Keep internal IDs secondary.
10. Put correlation IDs, request hashes, dedupe keys, schema versions, and
    diagnostics in one collapsed Technical details disclosure with copy
    affordances.
11. Confirmation and reconfirmation require a focused business-impact dialog.
    Validation and pricing do not need confirmation dialogs.
12. A stale revision conflict never silently retries a state-changing command.
    It preserves the active tab and return context, then asks the user to load
    and review the latest revision.

## Evidence And Current-State Audit

### Current route and application structure

- The public route is owned by the standalone Booking Next.js app.
- Without an authenticated Booking actor, the live route returns a
  `Booking unavailable` page with `A signed-in Booking actor is required`.
- The route is a Server Component and already accepts `created` and `returnTo`
  search parameters.
- `safeBookingReturnTo` accepts only `/bookings` and `/bookings?...`.
- The current detail is one long page with Back, heading, four fact areas,
  reference validation, pricing, manual-pricing state, journey state, and
  lifecycle.
- The current page uses a Booking-only dark header rather than the approved
  shared LinerCore shell.
- Customer, voyage, event, charge, and actor values are displayed as raw IDs or
  technical enum values.
- Pricing iterates a raw `quotedAmounts` map. Keys such as
  `line.1.chargeCode`, `requestHash`, and `lineItemCount` can appear as primary
  business facts.
- Pricing correlation ID is currently shown directly below commercial data.
- Manual-pricing correlation and request values are also primary content.
- Lifecycle shows raw event names and time only. Actor, resulting status, and
  revision are present in the service response but omitted by the frontend
  TypeScript type and UI.
- The current journey component polls the Booking read model once per second
  for up to 30 attempts after confirmation. It does not use the existing
  Container Movement journey-by-booking endpoint.
- The current responsive CSS stacks facts below 720px but provides no stable
  record views, compact mobile header, route timeline, charge-table
  transformation, or intentional mobile activity layout.

### Current command behavior

The existing page supports:

- `POST /api/bookings/{id}/validate`
- `POST /api/bookings/{id}/price`
- `POST /api/bookings/{id}/confirm`

Current UI behavior:

- Validate, Price, and Confirm are rendered together.
- Disabled actions remain visible even when they are not the next step.
- Every activation generates a new idempotency key.
- Busy states prevent repeated activation only for the current in-memory
  request.
- The action UI has separate error panels, each repeating Retry.
- There is no confirmation dialog that states the downstream impact of
  confirming a priced booking.
- The client does not send an expected revision or ETag with a command.
- A blocked reference links to `/bookings/new?correct=...`, which would create
  a new draft rather than correct the current record.

The persisted Booking statuses are:

- `DRAFT`
- `VALIDATION_BLOCKED`
- `VALIDATED`
- `PRICING_PENDING`
- `MANUAL_PRICING`
- `PRICED`
- `CONFIRMED`
- `AMENDED`
- `RECONFIRMED`
- `EXCEPTION`

`Validating`, `Pricing`, and `Confirming` are UI command states. `Validation
Failed` must be clarified as either a business validation block or a technical
failure to complete validation.

### Live booking evidence

The audited booking exists:

| Fact | Live value |
| --- | --- |
| Booking ID | `ecebf4a8-bbbd-4468-980b-0e9dfdf0e73a` |
| Booking number | `BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3` |
| Revision | 1 |
| Status | Confirmed |
| Customer ID | `party-customer-local-carrier` |
| Route | `USNYC` to `NLRTM` |
| Voyage ID | `voyage-local-002` |
| Voyage business code | `LC002E` |
| Equipment | `LCRU1000055`, `22G1`, quantity 1 |
| Cargo | USD, FCL dry, non-reefer, non-dangerous goods |
| Reference validation | Valid |
| Pricing basis | Agreement |
| Pricing request ID | `pricing-33c8b1659369b625` |
| Pricing quote ID | `83987950-67da-4f69-9b30-462f7f8f9ca6` |
| Movement statuses in Booking read | None |
| Lifecycle events | Draft created, validated, priced, confirmed |

The requested customer `Northstar Retail` is not the live customer. The current
customer reference resolves to `Local Demo Carrier`. As agreed for page 11,
Northstar Retail requires approved seed data.

The requested voyage label `VOY-LOCAL-002` is not the canonical value returned
by the reference option. The current carrier voyage number is `LC002E`; the
internal ID is `voyage-local-002`. The UI should display `LC002E` unless the
domain owner approves another business identifier and adds it to the contract.

### Live charge evidence

The booking snapshot contains three lines:

| Category | Current charge ID | Amount |
| --- | --- | ---: |
| Freight | `charge-code-ofr` | USD 1,450.00 |
| Surcharge | `charge-code-baf` | USD 185.00 |
| Local | `charge-code-thc` | USD 275.00 |

The arithmetic sum is USD 1,910.00. The current Booking snapshot does not
provide an authoritative subtotal or total field, so the implementation must
not present a browser-calculated amount as the contractual total.

The live Charge Agreement service finds an approved matching agreement:

- Agreement number: `AGR-DEMO-NAEU-001`
- Agreement version: 4
- Validity: 2026-07-01 through 2026-12-31
- Rate categories: Freight, Surcharge, Local
- Each live matching rate is approved at rate version 1.
- The live rate basis is `CONTAINER`.

The Booking pricing snapshot does not retain agreement number, agreement
version, rate-version IDs, or complete basis evidence. Its line basis values
are currently blank. The Charges design therefore requires snapshot enrichment
or an immutable pricing-detail read contract.

### Live journey evidence and inconsistency

The Booking detail response has no `movementStatuses`, so the current Booking
page correctly presents its local projection as pending.

The Container Movement service independently returns an `IN_TRANSIT` journey
for the same Booking ID and container, with:

- Actual departure from the USNYC reference location.
- Estimated arrival at the NLRTM reference location.
- Journey update time of 2026-08-03T08:00:00Z.

This is a live projection inconsistency. The requested design baseline is
`PENDING_EVENT`, and the UI must not quietly combine two unsynchronized sources.
Before implementation, product and architecture must approve one canonical
Journey read strategy:

1. Use the Booking-owned movement projection and repair event consumption; or
2. Add an authorized Booking BFF composition of the Container Movement
   journey endpoint with explicit source and freshness semantics.

Until that decision is implemented and demo data is aligned, the honest UI
state is:

`Journey projection pending. The booking is confirmed, but no movement event
has been projected into this record yet.`

### Shared UI evidence

Useful existing `@erp/ui` primitives include `Button`, `Dialog`, `Tabs`,
`StatusBadge`, `Table`, `Skeleton`, `StatusStrip`, `EmptyState`, and layout
primitives.

Gaps:

- Existing `Tabs` is a client-only in-memory ARIA widget. It does not support
  route-backed state, browser history, server-rendered per-view data, or mobile
  overflow behavior.
- `StatusBadge` lacks explicit mappings for `VALIDATION_BLOCKED` and
  `MANUAL_PRICING`.
- There is no shared RecordHeader, DefinitionList, RouteTimeline,
  ActivityTimeline, CopyButton, TechnicalDetails, or ActionMenu.

### UI/UX Pro Max interpretation

Applicable skill guidance includes visible focus, semantic controls,
announced async changes, stable loading dimensions, duplicate-submission
prevention, clear recovery actions, and responsive behavior without gesture
conflicts.

Generic enterprise landing-page guidance, trust badges, purple/orange palette,
hero content, animated metrics, and marketing calls to action are rejected.
This page uses the approved LinerCore operational ERP system.

## 1. Roles, Tasks, And Decision Hierarchy

### Role assumptions

| Role | Primary questions | Typical action visibility |
| --- | --- | --- |
| Booking agent | Is the booking complete and what must I do next? | Validate, correct, view charges |
| Customer-service operator | What can I tell the customer and what is blocked? | Read, correct when authorized |
| Pricing user | Which agreement and rates produced the amount? | Request or inspect pricing; open manual case |
| Pricing approver | What is the commercial basis and approved authority? | Follow authorized pricing workflow |
| Equipment controller | Which container is assigned and what is its journey state? | Read Journey; operational action only if supported |
| Supervisor | Is the booking safe to confirm and where is it delayed? | Confirm when authorized; resolve exceptions |
| Auditor | Who performed each transition and with what evidence? | Read Activity and Technical details |

Users see only actions they are authorized to perform. Do not show a disabled
or locked primary command as a teaser. A user with read-only access still sees
the business next step as text, followed by `You do not have permission to
perform this action` only when that explanation is useful and policy permits it.

### Decision hierarchy

The first viewport answers:

1. Which booking is this?
2. Who is the customer?
3. What is its current status and revision?
4. Is anything blocking progress?
5. What is the one next business action?
6. What route and equipment does the decision affect?

The stable views then answer:

- Overview: Is the booking operationally complete and valid?
- Charges: What commercial authority and amounts apply?
- Journey: What movement evidence exists and how fresh is it?
- Activity: Who changed the booking, when, and to which state?

### Information ownership

| Information | Canonical owner |
| --- | --- |
| Booking state, revision, route, equipment, lifecycle | Booking service |
| Customer and canonical reference labels | Reference Data service |
| Agreement, rate authority, charge lines, total | Charge Agreement service captured into immutable booking pricing evidence |
| Container journey and movement events | Approved Journey projection strategy |
| Session and action authorization | Identity and Booking policy boundary |
| Return-to-list context | Booking UI safe-return helper |

The frontend may format and group data. It must not infer commercial totals,
agreement identity, journey movement, business authorization, or a successful
state transition.

## Information Architecture And Tab Model

### Route-backed views

Use:

- `/bookings/{id}?tab=overview`
- `/bookings/{id}?tab=charges`
- `/bookings/{id}?tab=journey`
- `/bookings/{id}?tab=activity`

Overview is the default when `tab` is absent. Preserve a validated `returnTo`
value alongside the tab parameter. Unknown tabs fall back to Overview without
an error.

These are navigation views styled as tabs, not one client-side ARIA tab widget.
Use a labelled `nav` containing links with `aria-current="page"`. This gives:

- Deep linking.
- Browser Back/Forward.
- Server Component data loading per view.
- Progressive enhancement.
- Standard link keyboard behavior.
- No need to send all Charges, Journey, and Activity content as client JS.

At 390px all four English labels fit in the expected width. If localization
causes overflow, use native horizontal scrolling on the tab list. Do not use
horizontal swipe gestures to change view content.

### Tab availability

Keep all four views stable for an authorized reader:

- Charges remains present before pricing and explains the next prerequisite.
- Journey remains present before confirmation and explains when journey
  tracking begins.
- Activity remains present even with one event.

Do not remove or reorder tabs when the booking changes state. Stable location
builds operational memory.

## 2. Desktop And Mobile Wireframes

All wireframes use the shared Shell. The abbreviated left column represents the
approved module navigation, not the current Booking-only header.

### Desktop common header, 1440px

```text
+----------------------------------------------------------------------------+
| LinerCore | Search                           Help  Notifications  User      |
+-------------+--------------------------------------------------------------+
| Home        | Bookings / BKG-8c6bf440...                                    |
| Bookings *  | [Back to bookings]                                             |
| Rates       |                                                               |
| Reference   | BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3      [Confirmed]     |
| Equipment   | Northstar Retail                                  Revision 1  |
| Admin       |                                                               |
|             | Next: Check journey status    Projection pending  [Check now] |
|             |                                                [More actions] |
|             |                                                               |
|             | Overview     Charges     Journey     Activity                  |
|             | ============================================================= |
```

The booking number may wrap to two lines. It never competes with a giant page
title. Status and revision remain visible. At large widths, the action area is
right aligned; at narrower widths it forms a second header row.

### Desktop Overview

```text
| Overview     Charges     Journey     Activity                              |
|============================================================================|
| Blocker                                                                    |
| Journey projection pending. Confirmation is complete, but this record has |
| not received a movement projection.                         [View Journey]  |
|                                                                            |
| Route                                                                      |
|  [USNYC]------------------- LC002E -------------------------[NLRTM]          |
|  New York, US             LinerCore Atlas                 Rotterdam, NL    |
|  Load location            Voyage                          Discharge location|
|                                                                            |
| Customer                  Equipment                    Cargo                |
| Northstar Retail          LCRU1000055                  FCL dry              |
| NORTHSTAR                 22G1 / quantity 1            USD                  |
|                                                        Reefer: No           |
|                                                        Dangerous goods: No  |
|----------------------------------------------------------------------------|
| Reference validation                                      [Valid]          |
| Checked 26 Jul 2026, 20:15 local time                                       |
| Customer, route, voyage, and equipment type are active. [Show 5 checks]    |
```

Route is an unframed timeline. Facts use a definition grid separated by rules,
not nested cards.

### Mobile Overview, 390px

```text
+--------------------------------------+
| LinerCore              [Search][Menu] |
+--------------------------------------+
| Bookings / Booking                    |
| [Back to bookings]                    |
|                                      |
| BKG-8c6bf440-bd67-4883-8b8f-         |
| 623b6ba362b3                          |
| Northstar Retail                      |
| [Confirmed]  Revision 1               |
|                                      |
| Projection pending                    |
| [Check journey status] [More]         |
|                                      |
| Overview Charges Journey Activity     |
| ==================================== |
| Blocker                              |
| Journey projection pending.          |
| [View Journey]                       |
|                                      |
| Route                                |
| o USNYC - New York, US               |
| | Voyage LC002E                      |
| | LinerCore Atlas                    |
| o NLRTM - Rotterdam, NL              |
|                                      |
| Customer                             |
| Northstar Retail                     |
|                                      |
| Equipment                            |
| LCRU1000055                          |
| 22G1 / quantity 1                    |
|                                      |
| Cargo                                |
| USD / FCL dry                        |
| Reefer: No                           |
| Dangerous goods: No                  |
|                                      |
| Reference validation  [Valid]        |
| Checked 26 Jul 2026, 20:15           |
| [Show 5 checks]                      |
+--------------------------------------+
```

### Desktop Charges

```text
| Overview     Charges     Journey     Activity                              |
|============================================================================|
| Charges                                                    [Quoted]        |
| Agreement pricing captured 26 Jul 2026, 20:15 local time                   |
|                                                                            |
| Agreement               Pricing basis       Currency        Quote          |
| AGR-DEMO-NAEU-001       Agreement           USD             83987950... [C]|
| Version 4                                                                  |
|----------------------------------------------------------------------------|
| Category    Charge                         Basis      Qty         Amount    |
| Freight     OFR  Ocean freight             Container    1   USD 1,450.00   |
| Surcharge   BAF  Bunker adjustment factor  Container    1     USD 185.00   |
| Local       THC  Terminal handling charge  Container    1     USD 275.00   |
|----------------------------------------------------------------------------|
| Rate versions: 1 for each captured line                                    |
|                                                   Subtotal  USD 1,910.00   |
|                                                   Total     USD 1,910.00   |
|                                                                            |
| [View agreement]              [Technical details v]                        |
```

`[C]` represents a Lucide Copy icon button with tooltip and accessible name,
not a text button.

Agreement and total appear only when supplied by immutable pricing evidence.
The wireframe shows the approved target contract.

### Mobile Charges, 390px

```text
| Overview Charges Journey Activity      |
| ===================================== |
| Charges                       [Quoted] |
| Agreement pricing                      |
| Captured 26 Jul 2026, 20:15            |
|                                       |
| Agreement                             |
| AGR-DEMO-NAEU-001 / version 4         |
| Pricing basis  Agreement              |
| Currency       USD                    |
| Quote          83987950-67da... [Copy]|
|---------------------------------------|
| Freight                               |
| OFR - Ocean freight                   |
| Container x 1                         |
|                         USD 1,450.00   |
|---------------------------------------|
| Surcharge                             |
| BAF - Bunker adjustment factor        |
| Container x 1                         |
|                           USD 185.00   |
|---------------------------------------|
| Local                                 |
| THC - Terminal handling charge        |
| Container x 1                         |
|                           USD 275.00   |
|---------------------------------------|
| Subtotal                USD 1,910.00  |
| Total                   USD 1,910.00  |
|                                       |
| [View agreement]                      |
| [Technical details v]                 |
```

Mobile transforms each table row into a structured unframed charge record using
the same semantic source data. It does not create decorative cards and does not
require horizontal table scrolling.

### Desktop Journey, requested pending state

```text
| Overview     Charges     Journey     Activity                              |
|============================================================================|
| Container journey                                      [Pending event]     |
| Container LCRU1000055 / Equipment type 22G1                                |
|                                                                            |
| Journey projection pending                                                 |
| The booking is confirmed, but no movement event has been projected into   |
| this record yet. No current location is available.                         |
|                                                                            |
| Confirmation recorded    26 Jul 2026, 20:15 local time                     |
| Last checked             Just now                                          |
| Current event            Not available                                     |
| Next expected event      Waiting for journey projection                    |
| Current location         Not available                                     |
|                                                                            |
| [Check status]                           [Technical details v]              |
```

Do not draw an empty route with invented completed/upcoming events in this
state.

### Desktop Journey, available-data variant

```text
| Container journey                                           [In transit]   |
| LCRU1000055 | Updated 3 Aug 2026, 11:30 local time | Checked just now      |
|                                                                            |
| Current event          Next expected event          Current location       |
| Actual departure       Estimated arrival            At sea / not reported  |
| USNYC                  NLRTM, 3 Aug 2026                                    |
|----------------------------------------------------------------------------|
| Movement timeline                                                          |
| [Completed]  Actual departure  USNYC  25 Jul 2026, 13:45                   |
| [Expected ]  Estimated arrival NLRTM  3 Aug 2026, 11:30                    |
|                                                                            |
| Data source: Container Movement projection             [Technical details] |
```

An estimated event is never presented as completed movement evidence.

### Mobile Journey, 390px

```text
| Overview Charges Journey Activity      |
| ===================================== |
| Container journey      [Pending event] |
| LCRU1000055 / 22G1                    |
|                                       |
| Journey projection pending            |
| The booking is confirmed, but no       |
| movement event has been projected.     |
| No current location is available.      |
|                                       |
| Confirmation                          |
| 26 Jul 2026, 20:15                    |
| Last checked                          |
| Just now                              |
| Current event                         |
| Not available                         |
| Next expected event                   |
| Waiting for journey projection        |
|                                       |
| [Check status]                        |
| [Technical details v]                 |
```

### Desktop Activity

```text
| Overview     Charges     Journey     Activity                              |
|============================================================================|
| Activity                                             [Newest first v]      |
| 4 business events                                                           |
|                                                                            |
| 26 Jul 2026, 20:15  Booking confirmed                         Confirmed    |
|                     Mohammad Rezvannia / local.booking.user                 |
|                     Revision 1                                             |
|                     [Technical details v]                                  |
|----------------------------------------------------------------------------|
| 26 Jul 2026, 20:15  Pricing stored                            Priced       |
|                     Mohammad Rezvannia / local.booking.user                 |
|                     Revision 1                                             |
|                     [View charges] [Technical details v]                   |
|----------------------------------------------------------------------------|
| 26 Jul 2026, 20:15  References validated                      Validated    |
|                     Mohammad Rezvannia / local.booking.user                 |
|                     Revision 1                                             |
|----------------------------------------------------------------------------|
| 26 Jul 2026, 20:14  Booking draft created                     Draft        |
|                     Mohammad Rezvannia / local.booking.user                 |
|                     Revision 1                                             |
```

Use resolved actor display name when the Identity contract provides it. Show
username or subject only as secondary text.

### Mobile Activity, 390px

```text
| Overview Charges Journey Activity      |
| ===================================== |
| Activity                              |
| 4 business events  [Newest first v]   |
|                                       |
| Booking confirmed       [Confirmed]   |
| 26 Jul 2026, 20:15                    |
| Mohammad Rezvannia                    |
| Revision 1                            |
| [Technical details v]                 |
|---------------------------------------|
| Pricing stored             [Priced]   |
| 26 Jul 2026, 20:15                    |
| Mohammad Rezvannia                    |
| Revision 1                            |
| [View charges]                        |
|---------------------------------------|
| References validated      [Validated] |
| 26 Jul 2026, 20:15                    |
| Mohammad Rezvannia                    |
| Revision 1                            |
|---------------------------------------|
| Booking draft created         [Draft] |
| 26 Jul 2026, 20:14                    |
| Mohammad Rezvannia                    |
| Revision 1                            |
```

## 3. High-Fidelity Specification

### Approved tokens

Use the shared LinerCore tokens:

| Purpose | Value |
| --- | --- |
| Page background | `#f4f7fb` |
| Primary surface | `#ffffff` |
| Secondary surface | `#eef3f9` |
| Border | `#d7e2ef` |
| Strong border | `#c2d0e0` |
| Primary text | `#102235` |
| Muted text | `#5a6b7d` |
| Maritime blue | `#11427a` |
| Maritime blue hover | `#0d3663` |
| Success foreground/background | `#136b45` / `#e7f4ee` |
| Warning foreground/background | `#8a5200` / `#fbf0dc` |
| Danger foreground/background | `#b42318` / `#fbe9e7` |
| Information foreground/background | `#2a68b0` / `#e7f0fb` |
| Small radius | `6px` |
| Surface radius | `8px` |
| Focus | 3px visible blue outline with 2px white separation |

Do not use the current green eyebrow, yellow focus ring, raw enum colors, or
dark Booking-only header.

### Typography

- Font: approved Inter stack.
- Booking number: 24px/32px at desktop and 20px/28px at mobile, weight 700.
- Customer in header: 15px/22px, weight 600.
- View heading: 20px/28px, weight 700.
- Section heading: 16px/24px, weight 700.
- Body and controls: 14px/20px.
- Secondary and support text: 13px/18px.
- Definition terms and charge headers: 12px/18px, weight 650.
- Money, revisions, quantities, IDs, and timestamps use tabular numerals.
- Letter spacing is 0.
- Long identifiers use `overflow-wrap: anywhere`.

### Record header

The record header is a full-width unframed page band below breadcrumbs.

Desktop structure:

- Back link on its own quiet row.
- Booking number as `h1`.
- Resolved customer directly beneath.
- Status badge and revision aligned with identity.
- Next-action area aligned right when space permits.
- Blocker text between `Next:` label and the command.
- Overflow menu after the primary action.

Mobile structure:

- Back link.
- Booking number wraps naturally.
- Customer.
- Status and revision on one wrapping row.
- Blocker and action below.
- Overflow uses a Lucide Ellipsis icon button with tooltip `More booking
  actions`.

Do not truncate the booking number in the `h1`. If a shorter identifier is
needed in breadcrumbs, use `Booking` or a safely truncated value with the full
accessible name.

### Status presentation

Every persisted status combines:

- Sentence-case text.
- Dot or compact shape.
- Semantic color.

Recommended mapping:

| Domain status | Display | Tone |
| --- | --- | --- |
| `DRAFT` | Draft | Neutral |
| `VALIDATION_BLOCKED` | Validation blocked | Warning |
| `VALIDATED` | Validated | Information |
| `PRICING_PENDING` | Pricing pending | Information with progress semantics |
| `MANUAL_PRICING` | Manual pricing | Warning |
| `PRICED` | Priced | Information |
| `CONFIRMED` | Confirmed | Success |
| `AMENDED` | Amended | Warning |
| `RECONFIRMED` | Reconfirmed | Success |
| `EXCEPTION` | Exception | Danger |

Transient commands use an inline progress status and busy action. They do not
replace the persisted badge until the server response confirms a new state.

### Next-action area

Use this pattern:

```text
Next: Confirm booking
Commits revision 1 and publishes it to downstream operations.
[Confirm booking]
```

When blocked:

```text
Blocked: 2 references need correction
[Correct booking]
```

When waiting:

```text
Waiting: Pricing request is still in progress
[Refresh pricing status]
```

The action explanation is no more than two lines. Deeper blocker details live
in Overview.

### Overflow actions

Candidate commands, shown only when real and authorized:

- Copy booking number.
- Copy booking link.
- Open printable summary, only if implemented.
- Amend booking, only for supported confirmed states.
- Reconfirm, only for amended state.
- Open Technical details.

Do not put the current primary next action in the overflow menu. Do not show
future actions disabled.

### View navigation

- Height: 44px desktop, 48px mobile.
- Active view: 2px maritime-blue bottom border, weight 700, `aria-current`.
- Inactive view: primary text, restrained hover surface.
- Border under the whole navigation band.
- No pill-shaped segmented control.
- Keep view navigation below the record header during scroll only if sticky
  behavior does not obscure focused content. Recommended first slice: normal
  document flow.

### Overview route timeline

Desktop:

- Horizontal at 768px and above when each endpoint has at least 220px.
- Load and discharge nodes use code, resolved place, and function label.
- Voyage sits on the connecting leg with carrier voyage number and vessel.
- Multiple legs stack as separate rows with visible leg sequence.

Mobile:

- Vertical timeline with load above discharge.
- Voyage is associated with the connecting line.
- No map is required.
- Completed/expected styling is not used here because this is a booked route,
  not movement evidence.

### Overview fact layout

Use a semantic definition list with responsive grid:

- Customer.
- Equipment.
- Cargo and commercial setup.
- Additional references only when business useful.

Customer:

- Northstar Retail.
- Customer code as secondary.
- Internal party ID only in Technical details.

Equipment:

- Equipment reference.
- Type code plus resolved type name.
- Quantity.

Cargo:

- FCL dry.
- Currency.
- Reefer: No.
- Dangerous goods: No.
- Commodity when supplied.

Do not display booleans as raw `true` or `false`. Do not abbreviate Dangerous
goods to `DG` without an expanded accessible label.

### Reference validation

Overview shows:

- Overall outcome.
- Checked time.
- Checked booking revision.
- Concise result such as `5 references active`.
- Blocked count and next correction.
- `Show 5 checks` disclosure.

Expanded checks use a compact table:

| Field | Requested | Resolved record | Version | Result |
| --- | --- | --- | ---: | --- |

Correlation ID and fingerprint do not appear in this table. They belong in
Technical details.

For a business validation block, use:

Heading: `Reference correction required`

Message: `{count} booking references are inactive, missing, or no longer match
this booking.`

Every item names the business field and reason. `Correct booking` requires a
real edit-current-booking contract; it must not link to New booking.

### Charges summary

Show:

- Snapshot status.
- Pricing basis.
- Currency.
- Pricing time.
- Agreement number and agreement version.
- Quote ID.
- Pricing request ID only in Technical details unless operations use it as a
  business tracking reference.

`View agreement` appears only when the user has authorized access and a real
agreement route exists.

### Charge table

Desktop columns:

1. Category.
2. Charge code and resolved name.
3. Basis.
4. Quantity.
5. Rate version.
6. Amount.

Rules:

- Right-align quantity and money.
- Use two decimal places for USD in primary display.
- Keep source precision in technical/export data.
- Repeat the currency on every line if mixed currency is possible.
- If the snapshot guarantees one currency, a Currency summary plus currency in
  amounts is still preferred for clarity.
- Use business labels `Freight`, `Surcharge`, and `Local`.
- Do not display internal IDs such as `charge-code-ofr` as the primary charge
  name.

Totals:

- Show Subtotal and Total supplied by the pricing snapshot.
- If taxes, adjustments, or discounts exist later, place them between.
- Never infer agreement totals from current rate records after the fact; the
  booking must retain the commercial snapshot used at pricing time.
- If totals are absent, show `Total unavailable in pricing snapshot` and do not
  calculate an authoritative value client-side.

### Partial pricing

When lines exist but agreement, basis, rate version, or total is missing:

Heading: `Pricing details are incomplete`

Message: `The quoted charge lines are available, but some commercial evidence
was not captured in this booking snapshot.`

Show known values with `Not supplied` for absent fields and a warning status.
Do not substitute current agreement/rate values unless the backend marks them
as the immutable source used for this quote.

### Manual pricing

Charges remains the active view and shows:

- Status: Manual pricing.
- Business reason.
- Requested time.
- Responsible team or assignee when available.
- Manual case ID when it is a business-tracking identifier.
- `Open manual pricing case` only when a real authorized route exists.
- `Retry pricing` only for a retryable technical outcome and only when policy
  allows it.

Do not show an empty charge table. Do not promise approval or completion time.
Correlation ID stays in Technical details.

### Journey summary

Available journey:

- Container.
- Journey status.
- Current actual event.
- Next expected event.
- Current known location.
- Event time.
- Projection update time.
- Retrieval time.
- Source.

The current actual event and next expected event are separate. Never use an
estimated arrival as proof that the container arrived.

Pending projection:

- Status text `Pending event`.
- Confirmation timestamp.
- Last checked time.
- No current event.
- No current location.
- Explanation of the asynchronous projection.
- `Check status`.

Do not show a spinner for the full 30-second bounded window. Use a calm pending
state and briefly show progress only while an explicit check is running.

### Journey freshness

Do not infer stale data from the age of the latest business event. A container
may legitimately have no new event for days.

Distinguish:

- Event time: when the movement occurred or is expected.
- Projection update time: when the journey read changed.
- Last checked: when LinerCore successfully retrieved it.
- Projection lag: only when a contract supplies it.

Mark the view stale only when:

- A refresh fails and cached data is being shown; or
- The source reports projection lag beyond an approved threshold.

Recommended cached-data copy:

`Journey service is unavailable. Showing data retrieved at {time}.`

### Journey timeline

Merge expected and actual movement evidence only through an approved domain
mapper. Each row includes:

- State marker: Completed, Current, Expected, Exception.
- Business event label.
- Location code and resolved name.
- Event classifier: Actual, Estimated, or Planned.
- Event time.

Technical event IDs, dedupe keys, correlation IDs, and source schema versions
are available only inside Technical details.

### Activity

Default ordering: Newest first. Provide a compact `Newest first / Oldest first`
menu because auditors may need origin-to-current chronology.

Each business event shows:

- Human label.
- Resulting status.
- Actor display name.
- Username as secondary when useful.
- Booking revision.
- Localized timestamp plus exact machine-readable `datetime`.
- Context link such as View charges when meaningful.

Raw event type, subject ID, correlation ID, and technical evidence appear in
that event's Technical details disclosure.

Event label mapping:

| Raw event | Business label |
| --- | --- |
| `BOOKING_DRAFT_CREATED` | Booking draft created |
| `BOOKING_VALIDATED` | References validated |
| `BOOKING_VALIDATION_BLOCKED` | Reference validation blocked |
| `BOOKING_PRICING_REQUESTED` | Pricing requested |
| `BOOKING_PRICING_STORED` | Pricing stored |
| `BOOKING_MANUAL_PRICING_REQUIRED` | Manual pricing required |
| `BOOKING_CONFIRMED` | Booking confirmed |
| `BOOKING_AMENDED` | Booking amended |
| `BOOKING_RECONFIRMED` | Booking reconfirmed |
| `BOOKING_EXCEPTION_RECORDED` | Booking exception recorded |

Unknown events use a safe humanized label and retain the raw type in Technical
details.

### Technical details

Use a shared disclosure per view or per event where scope matters. Closed by
default.

Candidate values:

- Booking ID.
- Customer/party ID.
- Voyage ID.
- Reference fingerprint.
- Validation correlation ID.
- Pricing request ID.
- Pricing quote UUID when not a primary business identifier.
- Pricing request hash.
- Pricing correlation ID.
- Journey ID.
- Movement event IDs.
- Dedupe keys.
- Movement correlation IDs.
- Data schema version.
- Activity event raw type.

Every long value:

- Uses a monospace style at 13px.
- Wraps anywhere or uses a middle truncation that preserves beginning and end.
- Has a Lucide Copy icon button.
- Announces `{label} copied`.
- Never appears only in a tooltip.

Secrets, tokens, cookies, service credentials, and raw session claims are never
displayed.

## 4. Primary Action Rules

### Persisted and transient state matrix

| State | Header next-step text | Primary action | Business impact and rules |
| --- | --- | --- | --- |
| Draft | References have not been verified | `Validate references` | Checks customer, route, voyage, and equipment references. No confirmation dialog. |
| Validating | Reference validation is running | `Validating...` disabled | Prevent duplicates. Keep persisted badge Draft until response. |
| Validation blocked | Booking references require correction | `Correct booking` | Requires a real edit-current-record flow. Do not link to New booking. |
| Validation could not complete | Reference service did not complete the check | `Retry validation` | Use only for technical/unavailable outcomes, not inactive references. |
| Validated | Booking is ready for commercial pricing | `Request pricing` | Requests an immutable commercial result for the current revision. No dialog. |
| Pricing | Pricing is being requested | `Pricing...` disabled | Reuse the same request identity while outcome is uncertain. |
| Pricing pending | Pricing request has not completed | `Refresh pricing status` | Do not submit another commercial request. |
| Manual pricing | Automated pricing needs operator review | `Open manual pricing case` | Only when a real authorized case route exists. Otherwise show responsible team and no dead action. |
| Priced | Booking can be committed using the displayed charges | `Confirm booking` | Opens business-impact dialog and binds to current revision and pricing snapshot. |
| Confirming | Confirmation is being committed | `Confirming...` disabled | Prevent repeat action and retain idempotency identity on uncertain retry. |
| Confirmed, pending event | Booking is committed; journey projection is pending | `Check journey status` | Navigates to Journey and performs a non-mutating refresh. |
| Confirmed, journey available | Booking is committed and journey tracking is active | `View journey` | Navigates to Journey; no mutating command. |
| Exception | An operational exception blocks normal progress | `Resolve exception` | Only when an exception-resolution workflow exists and the user is authorized. |
| Legacy incomplete | Route and equipment identity require correction | `Correct booking` | Requires a dedicated correction flow that preserves this record. |
| Amended | Changed booking must be reconfirmed | `Reconfirm booking` | Same impact confirmation as Confirm, bound to amended revision. |
| Reconfirmed | Amended booking is committed | `View journey` | Navigates to Journey. |

### Confirmation dialog

Heading: `Confirm this booking?`

Body:

`Confirming revision 1 commits the displayed USD 1,910.00 pricing result and
publishes the booking to downstream operations, including container journey
processing.`

Summary:

- Booking number.
- Customer.
- Route.
- Equipment.
- Pricing total.
- Revision.

Actions:

- Secondary: `Cancel`
- Primary: `Confirm booking`

Do not require a checkbox or typed booking number. Confirmation is not
destructive, but it is commercially and operationally consequential.

Initial focus is Cancel. After Cancel, restore focus to the header Confirm
booking button. After activation, close the dialog, show Confirming in the
header, and announce progress.

If the authoritative total is unavailable, the dialog says:

`The pricing snapshot is incomplete. Confirmation is unavailable until the
commercial total and authority are present.`

Do not allow confirmation based on a client-calculated total.

### Reconfirmation dialog

Heading: `Reconfirm this amended booking?`

Body identifies:

- Current revision.
- Material changes since last confirmation.
- Current pricing authority.
- Downstream publication impact.

Reconfirmation is unavailable until the backend supplies a comparison summary
or the product owner approves the minimum evidence.

### Idempotency and duplicate prevention

- Bind command identity to booking ID, expected revision, operation, and
  normalized command payload.
- Freeze the command identity when the action starts.
- Disable keyboard, click, touch, and programmatic duplicate submission.
- Reuse the same idempotency key after timeout or command-in-progress.
- Never generate a new key merely because the first response was lost.
- Generate a new key only for a new command against a newly reviewed revision.
- A successful replay returns the existing result and must not duplicate
  Activity events or downstream publication.

Validation currently generates an idempotency key even though the backend
validation command does not use the key as a persisted operation. The future
contract should either support it consistently or avoid implying idempotency
that is not enforced.

### Authorization behavior

- Hide unauthorized commands.
- Keep the current business state and blocker readable when the user has read
  access.
- If permission changes after opening a dialog, close it and use the approved
  access-denied pattern.
- Do not retry a denied command.

## 5. Status, Blocker, Loading, Conflict, And Recovery Matrix

| State | Presentation | Recovery | Context preservation | Focus/announcement |
| --- | --- | --- | --- | --- |
| Initial route loading | Stable shell, record-header skeleton, tab band, active-view skeleton | None | URL retained | Polite `Loading booking` |
| View loading | Keep real record header; skeleton only active view | Automatic | Active tab and returnTo retained | Polite `{view} is loading` |
| Booking unavailable | Compact page error after shell | `Retry` and Back to bookings | returnTo retained | Focus error heading |
| Not found | `Booking not found` with searched ID in support details | Back to bookings | returnTo retained | Focus h1 |
| Partial customer/reference labels | Show canonical codes, `Name unavailable` secondary warning | Retry reference labels | Active tab retained | Polite partial-data notice |
| Draft | Neutral status and Validate action | Validate | Active tab retained | No auto focus |
| Validating | Busy header action; stable Draft badge | Wait; bounded same action retry if supported | Active tab and scroll retained | Announce start and result |
| Validation blocked | Warning blocker near action and in Overview | Correct current booking | Active tab retained | Focus blocker summary after result |
| Validation service unavailable | Error strip; existing booking remains readable | Retry validation | All views remain accessible | Focus error strip |
| Validated | Information status and Request pricing | Request pricing | Active tab retained | Success announcement |
| Pricing | Busy header action | Wait | Active tab retained | Announce `Pricing requested` |
| Pricing pending | Information waiting state | Refresh status | Charges selected when useful | No duplicate request |
| Partial pricing | Known lines plus incomplete-evidence warning | Retry/rebuild only through approved workflow | Charges retained | Focus warning on entry |
| Manual pricing | Warning state, reason, case details | Open case if route exists | Charges retained | Announce state transition |
| Priced | Charges available; Confirm action | Review Charges; Confirm | Current tab retained | Success announcement |
| Confirming | Dialog closes; busy header action | Wait; same-key check after uncertainty | Active tab retained | Announce progress |
| Confirmed | Success status | View/Check Journey | Active tab retained | Announce confirmation |
| Journey pending event | Honest pending state | Check status | Journey tab retained | Polite result |
| Journey unavailable, no cache | Journey-only unavailable state | Retry | Header and other tabs remain usable | Focus Journey error |
| Journey unavailable, cached | Warning plus cached journey and retrieved-at time | Retry | Cached content retained | Announce stale source |
| Journey partial | Show available container/status; mark absent event/location | Retry details | Journey retained | Polite partial notice |
| Exception | Danger blocker with reason | Resolve only if workflow exists | Active tab retained | Focus exception heading |
| Legacy incomplete | Correction-required blocker | Correct current record | Active tab retained | Focus blocker heading |
| Command technical failure | Inline action error near header | Safe retry rules by outcome | Active tab, view scroll, returnTo retained | Focus action error |
| Async success | Status, revision, activity, and next action update together | Continue | Active tab retained | Polite success then focus updated status |
| Stale revision | Conflict strip below header | Load latest revision | Active tab and returnTo retained | Focus conflict heading |
| Permission changed | Approved access-denied boundary | Return/request access if supported | Safe destination retained | Focus denial heading |
| Session expired | Canonical signed-out boundary | Sign in again | Safe destination only | Protected data removed |

### Unavailable versus not found

Unavailable:

Heading: `Booking unavailable`

Message: `LinerCore could not load this booking. Your list context is still
available.`

Actions: `Retry`, `Back to bookings`

Not found:

Heading: `Booking not found`

Message: `This booking may have been removed, replaced, or may not be visible
within your business scope.`

Action: `Back to bookings`

Do not reveal whether an out-of-scope booking exists.

### Stale revision conflict

Trigger:

- State-changing command expected revision differs from current revision.
- Validation result was computed against an older fingerprint.
- Pricing or confirmation authority changed before commit.

Presentation:

Heading: `This booking changed`

Message:

`You were viewing revision 1. Revision 2 is now available. Load the latest
revision and review its status, charges, and changes before continuing.`

Actions:

- Primary: `Load revision 2`
- Secondary: `Stay on revision 1`

Rules:

- Do not automatically retry confirmation or reconfirmation.
- Keep the current tab and safe return context.
- If the user stays, make all state-changing actions unavailable.
- After loading latest, return to the same tab and focus a concise
  `Revision 2 loaded` status.
- Activity highlights the event that created the newer revision.
- Do not discard the old view until the user chooses Load, unless security
  requires it.

The current command APIs lack an explicit expected revision/ETag contract. Add
one before claiming full conflict protection.

### Command failure classification

| Failure | Retry rule |
| --- | --- |
| Validation provider unavailable | Safe explicit retry |
| Inactive/missing reference | No retry until correction |
| Pricing in progress | Refresh status; do not create another request |
| Pricing transient outage before accepted request | Retry under same approved request identity |
| Pricing denied/no agreement | Route to Manual pricing; no blind retry |
| Confirmation outcome unknown | Check/retry with same idempotency key |
| Idempotency conflict | Load latest state; do not generate a silent replacement key |
| Authorization denied | No retry |
| Stale revision | Load and review latest |

## 6. `@erp/ui` Component Mapping

| Design element | Existing component | Recommendation |
| --- | --- | --- |
| Shared application shell | Approved Shell composition | Reuse pages 03-09 foundation |
| Breadcrumbs | Planned shared Breadcrumbs | Add current-record semantics |
| Record identity and action area | None | Add `RecordHeader` |
| Status | `StatusBadge` | Add blocked/manual mappings and sentence labels |
| View navigation | `Tabs` insufficient | Add `RouteTabs` navigation component |
| Next-action command | `Button` | Add stable busy and impact-text composition |
| Overflow | None | Add accessible `ActionMenu` |
| Blocker/failure/conflict | `StatusStrip` | Add heading, actions, focus target |
| Facts | None | Add `DefinitionList` with responsive columns |
| Route | None | Add domain-neutral `RouteTimeline` only if reusable |
| Validation checks | `Table` | Add compact responsive table/list behavior |
| Charges | `Table` | Add numeric alignment and mobile row transformation |
| Journey/activity | None | Add `Timeline` primitives with explicit state labels |
| Loading | `Skeleton` | Add record-header, fact, table, and timeline patterns |
| Empty/unavailable | `EmptyState`, `StatusStrip` | Use by semantics |
| Confirmation | `Dialog` | Compose `BookingConfirmationDialog` |
| Copy affordance | None | Add `CopyButton` with tooltip and live feedback |
| Support values | None | Add `TechnicalDetails` disclosure and `IdentifierValue` |
| Success feedback | `Toasts` or inline status | Prefer inline for lifecycle changes |

### Components that remain Booking-specific

- `BookingRecordHeader` action-state mapping.
- `BookingOverview`.
- `BookingChargeLines`.
- `BookingJourneyView`.
- `BookingActivityView`.
- `BookingConfirmationDialog`.
- `ReferenceValidationSummary`.
- `BookingBlockerSummary`.

The generic component should not know that Priced leads to Confirmed or that a
confirmed booking creates journey processing.

### RouteTabs versus existing Tabs

Do not force the existing in-memory `Tabs` component onto this page. The record
views:

- Have URL identity.
- May fetch from different services.
- Must support refresh and sharing.
- Benefit from Server Components.

`RouteTabs` should render navigation links. Existing `Tabs` remains suitable
for small, already-loaded client-side panels.

### Server and client boundaries

Server Component responsibilities:

- Authorization and business scope.
- Booking read and canonical display composition.
- Active tab parsing.
- Safe return context.
- Initial Charges, Journey, or Activity data for the active view.
- Not-found and unavailable distinction.

Focused client islands:

- State-changing commands and idempotency state.
- Confirmation dialog.
- Overflow menu.
- Copy feedback.
- Explicit Journey refresh.
- Async announcements.

Do not make the entire detail page a client component.

### Read-model recommendation

Create a page-oriented Booking detail view model rather than parsing raw maps
in JSX:

- `header`
- `nextAction`
- `blockers`
- `overview`
- `charges`
- `journey`
- `activity`
- `technicalDetails`
- `capabilities`

This may be assembled by the Booking BFF, but domain services remain owners of
their facts. Do not duplicate pricing or movement domain rules in React.

### Preserve existing automation contracts

Preserve:

- `booking-validate`
- `booking-price`
- `booking-confirm`
- `journey-status-retry`

When only one primary action renders, its state-specific existing test ID stays
on the actual button. Add stable IDs for:

- `booking-record-header`
- `booking-primary-action`
- `booking-conflict`
- `booking-tab-overview`
- `booking-tab-charges`
- `booking-tab-journey`
- `booking-tab-activity`
- `booking-confirm-dialog`
- `booking-technical-details`

Test IDs do not replace semantic role/name assertions.

## 7. Keyboard, Focus, And Screen-Reader Behavior

### Page order

1. Skip link.
2. Top bar.
3. Authorized module navigation.
4. Breadcrumbs.
5. Back to bookings.
6. Record heading.
7. Primary next action.
8. Overflow action.
9. Route-backed view links.
10. Active view content.
11. View-specific technical disclosures.

The DOM order matches visual order.

### Route-backed views

- Standard Tab moves through each link.
- Enter activates the view.
- Arrow keys are not required because these are navigation links, not an ARIA
  tab widget.
- `aria-current="page"` identifies the active view.
- After activation through client navigation, focus the active view `h2` with
  `tabIndex="-1"` and announce `{view} view loaded`.
- Browser Back restores the prior view and meaningful scroll position.
- View changes preserve the record header and avoid full-page layout shift.

### Header action

- The primary action is a real button or link according to behavior.
- Progress label remains stable in width.
- Busy state uses `disabled` where repeat activation is invalid and
  `aria-busy` on the command region.
- The status update uses a polite live region.
- Failure focuses the command error heading.
- Success updates persisted badge only after server confirmation.

### Confirmation dialog

- Trigger opens the dialog and moves focus to Cancel.
- Focus remains trapped.
- Escape equals Cancel while no request is running.
- During Confirming, dialog content cannot be dismissed if that would hide an
  uncertain outcome; recommended behavior is to close before request and show
  header progress.
- Cancel restores focus to Confirm booking.
- Error restores focus to the dialog error summary when the command was
  definitively rejected.

### Overflow menu

- Trigger accessible name: `More booking actions`.
- `ArrowDown` opens and focuses first item.
- Arrow keys move through items.
- Escape closes and restores focus.
- Clicking outside closes without changing current action state.
- Hidden unauthorized actions are absent from the menu.

### Tables and mobile transformations

- Desktop Charges and validation checks use proper `table`, `thead`, `tbody`,
  `th`, and scoped headers.
- On mobile, if markup transforms visually, each charge still exposes its
  category, code, basis, quantity, rate version, and amount in a coherent
  accessible group.
- Do not use CSS `display: block` in a way that destroys useful table
  semantics. A separate server-rendered mobile list is acceptable only if one
  representation is hidden from both visual and accessibility trees.

### Timelines

- Use ordered lists.
- Every item has an event heading and machine-readable `time`.
- Completed, Expected, Current, and Exception are present as text.
- Connector lines are decorative.
- Activity ordering control has a persistent accessible label.

### Copy behavior

- Each icon button names the exact value: `Copy quote ID`.
- Tooltip appears on hover and keyboard focus.
- Copy success announces `Quote ID copied`.
- Copy failure announces `Quote ID could not be copied` and leaves the text
  selectable.

### Technical disclosures

- Native `details`/`summary` is preferred when styling and focus behavior meet
  requirements.
- Summary text names scope: `Technical details for pricing`.
- Opening does not move focus.
- Deep links to technical evidence may open the disclosure and focus the value.
- Long values wrap and remain selectable.

### Async announcements

Polite:

- `Validating references`
- `Booking validated`
- `Pricing requested`
- `Pricing remains in progress`
- `Booking confirmed`
- `Checking journey status`
- `Journey projection is still pending`
- `Journey status updated`
- `{label} copied`

Assertive:

- State-changing command definitively failed.
- Revision conflict.
- Session or permission change that removes the action.

Do not announce every polling attempt or repeat unchanged pending text.

### Responsive accessibility

- At 390px no action, blocker, status, view label, money amount, or journey
  qualifier is truncated into ambiguity.
- Touch targets are at least 44px.
- At 200% zoom, all content reflows without two-dimensional scrolling.
- View navigation may scroll horizontally only when localization requires it.
- Visible focus is not hidden by the top bar or viewport edge.
- Reduced motion removes spinner rotation in favor of a static progress icon
  plus text where necessary.

## Responsive Specification

| Width | Header | Views | Content |
| --- | --- | --- | --- |
| 1440px | Identity left, action right | Full-width route tabs | 3-column facts, horizontal route, desktop charge table |
| 1024px | Two header rows when needed | All four visible | 2-3 column facts, horizontal route if stable |
| 768px | Stacked identity/action | All four visible | 2-column facts, charge table may transform |
| 390px | One compact column | Four labels fit; scroll only for localization | One-column facts, vertical route, charge records, vertical timelines |

Stable dimensions:

- Shell top bar: 56px desktop.
- Record header vertical padding: 20px desktop, 16px mobile.
- Primary control: 40px desktop, 44px mobile.
- View navigation: 44px desktop, 48px mobile.
- Desktop charge row: minimum 44px.
- Activity row: minimum 68px desktop, content-driven mobile.
- Copy icon button: 36px desktop, 44px mobile.

No fixed height is applied to blocker messages, event rows, long identifiers,
or translated actions.

## 8. Playwright And Visual-Regression Acceptance

### Confirmed demo record

1. Sign in as an authorized Booking user.
2. Open the audited route with a filtered `returnTo` context.
3. Assert the shared Shell and breadcrumb.
4. Assert booking number, resolved customer, Confirmed status, and revision 1.
5. Assert one primary next action, not Validate, Price, and Confirm together.
6. Assert route USNYC to NLRTM, carrier voyage number, equipment, and cargo.
7. Assert Back returns to the original supported queue context.

### View navigation

- Open each route-backed view directly.
- Activate each view with keyboard.
- Assert URL, `aria-current`, view heading focus, and Back/Forward behavior.
- Refresh on Charges, Journey, and Activity.
- Open an unknown tab and assert safe Overview fallback.
- Preserve `returnTo` across every view.
- Verify 390px navigation does not page-scroll horizontally.

### Overview

- Assert route timeline labels and semantic order.
- Assert customer and reference IDs resolve to business labels.
- Expand validation checks.
- Test valid, blocked, unavailable, stale-revision, and legacy-incomplete
  variants.
- Assert correlation and fingerprint are absent until Technical details opens.

### Charges

- Assert three categories: Freight, Surcharge, Local.
- Assert each line includes charge name, basis, quantity, rate version,
  currency, and amount when the enriched snapshot supports them.
- Assert agreement number/version, pricing basis, quote, pricing time,
  subtotal, and total.
- Assert authoritative total comes from response data, not client arithmetic.
- Test partial pricing with missing total and agreement.
- Test no pricing, pricing pending, manual pricing, mixed-currency rejection or
  presentation, and unavailable pricing detail.
- Assert request hash and correlation ID are collapsed.
- Test Copy quote ID success and failure.

### Journey

- For the approved demo baseline, assert `Pending event`.
- Assert no current location or movement event is invented.
- Assert the explanation names confirmed-event projection.
- Click Check status and verify one bounded refresh plus one announcement.
- Test available Journey with actual departure and estimated arrival clearly
  distinguished.
- Test unavailable with no cache and unavailable with cached data.
- Test partial location and partial event.
- Assert event age alone does not label the projection stale.
- Assert technical event IDs and dedupe keys are collapsed.

### Activity

- Assert four business events with human labels.
- Assert actor, status, revision, and timestamp.
- Switch newest/oldest ordering.
- Expand per-event technical details.
- Test unknown event type safely.
- Test partial activity response without hiding known events.

### Lifecycle actions

Cover:

- Draft to Validating to Validated.
- Validation blocked.
- Validation provider unavailable and Retry.
- Validated to Pricing.
- Pricing pending.
- Manual pricing.
- Priced to Confirming to Confirmed.
- Exception.
- Legacy incomplete.
- Amended to Reconfirming to Reconfirmed.

For each:

- Exactly one authorized primary next action.
- Correct impact text.
- No inaccessible teaser command.
- Stable busy dimensions.
- One request under double click, repeated Enter, and touch/click overlap.
- Correct async announcement.
- Updated status, revision, blocker, Activity, and next action after success.

### Confirmation

- Open dialog and assert booking, customer, route, equipment, total, revision,
  and downstream impact.
- Verify initial focus, focus trap, Escape, Cancel restoration, and Confirm.
- Double activate and assert one command.
- Delay response and verify same idempotency identity on safe check/retry.
- Return success and assert one confirmation event.
- Return incomplete pricing and assert confirmation remains unavailable.
- Change permission while dialog is open.

### Revision conflict

- Open revision 1 on Charges.
- Simulate revision 2 before Confirm.
- Assert no automatic retry.
- Assert conflict copy, Load revision 2, and Stay on revision 1.
- Stay and assert state-changing actions are unavailable.
- Load latest and assert Charges remains active, returnTo is retained, focus
  moves to `Revision 2 loaded`, and Activity identifies the change.

### Failure and security

- Booking service unavailable.
- Not found without resource-existence leakage.
- Session expiry removes protected content.
- Read-only user sees no state-changing commands.
- Permission change follows approved access-denied behavior.
- Unsafe returnTo becomes `/bookings`.
- Technical details contain no secrets, tokens, cookies, or raw session claims.

### Accessibility

- Keyboard-only path through header, views, active content, disclosure, and
  actions.
- Automated accessibility checks in every view and principal error state.
- Visible focus and no obscured focus.
- Correct landmarks, headings, lists, tables, times, and names.
- No status or timeline meaning conveyed by color alone.
- Live-region output is not duplicated by polling or refresh.
- 200% and 400% zoom checks.
- Reduced-motion check.

### Visual baselines

Capture:

- 390x844: Overview, Charges, Journey pending, Activity, confirmation dialog,
  and revision conflict.
- 768x1024: all four views and partial pricing.
- 1024x768: record header with each lifecycle action family.
- 1440x900: all four principal views, manual pricing, journey available, and
  exception.

Visual assertions:

- No horizontal page overflow.
- Booking number wraps without colliding with status/action.
- Primary action and blocker remain visible.
- View labels do not overlap or truncate meaning.
- Charge amounts align.
- Long IDs wrap or truncate with accessible copy affordance.
- No nested cards or decorative dashboard composition.
- Loading states preserve final dimensions.
- Technical values do not dominate Charges or Activity.

## Implementation Dependencies

These are design dependencies, not work performed by this task:

1. Resolve and seed Northstar Retail if it remains the approved Phase 1
   customer.
2. Approve `LC002E` or define the authoritative source of
   `VOY-LOCAL-002`.
3. Enrich the immutable pricing snapshot with agreement number/version, charge
   display labels, basis, rate versions, subtotal, and total.
4. Define whether `pricingQuoteId` is a quote ID, agreement ID, or another
   pricing reference. The current live value overlaps the matching agreement
   lookup.
5. Approve and implement one canonical Journey read strategy, then reconcile
   the current Booking-pending versus Container-Movement-IN_TRANSIT mismatch.
6. Add an expected revision or ETag to state-changing command contracts.
7. Add an edit-current-booking correction route. Do not reuse New booking.
8. Add a manual-pricing case route before displaying `Open manual pricing
   case`.
9. Resolve lifecycle actor display names through an approved Identity contract.
10. Expand the Booking frontend type to include actor, status, revision,
    exceptions, and other fields already present in the response.
11. Add shared RouteTabs, RecordHeader, DefinitionList, timelines, CopyButton,
    and TechnicalDetails components.
12. Add focused detail-page and cross-service Playwright coverage.

## Recommended Implementation Slice Within Pages 10-13

Do not implement page 12 until page 13 is designed and pages 10-13 are approved
as one Booking workflow.

After approval:

1. Shared Shell, RouteTabs, RecordHeader, status, copy, disclosure, table, and
   timeline foundations.
2. Page-oriented Booking detail read model and canonical reference labels.
3. Pricing snapshot enrichment and Charges.
4. Expected-revision command contract and one-next-action header.
5. Confirmation and conflict interactions.
6. Canonical Journey composition and pending/available recovery.
7. Activity enrichment and technical evidence.
8. Cross-page queue-create-detail Playwright and visual gate.

## Approval Checklist

- Approve four stable route-backed views.
- Approve one primary next action per lifecycle state.
- Approve transient command states remaining separate from persisted statuses.
- Approve business-impact confirmation and reconfirmation dialogs.
- Approve `Validation blocked` for business reference failures and
  `Validation could not complete` for technical failures.
- Approve no browser-calculated authoritative pricing total.
- Approve the target USD 1,910.00 commercial display after snapshot enrichment.
- Approve agreement `AGR-DEMO-NAEU-001`, agreement version 4, and captured rate
  version 1 evidence for the demo.
- Approve honest `Pending event` presentation until the Journey projection
  strategy is reconciled.
- Approve URL-backed tab and return-context behavior.
- Approve revision-conflict behavior and expected-revision contract work.
- Approve Technical details placement and copy behavior.
- Approve deferring implementation until page 13 is reviewed.

No production files were modified.

# LinerCore New Booking Design

Status: Proposed for review

Route: `/bookings/new`

Scope: UI/UX Pro Max design task only. No production code, runtime
configuration, API contract, or automated test was changed.

## Executive Decisions

1. Keep booking creation on one efficient page. Do not introduce a stepper or
   wizard for the current seven editable values.
2. Use four semantic sections: Customer, Route and voyage, Equipment and
   cargo, and Review and create.
3. Use searchable, canonical comboboxes for customer, locations, voyage,
   equipment type, and commodity. Do not accept an unselected typed value for
   any canonical reference.
4. Treat the selected voyage as the source of truth for its Phase 1 load and
   discharge locations. Voyage-populated locations are read-only until the
   voyage is cleared.
5. Keep the existing create request shape, Draft result, route, and test IDs.
   Extend contracts only where required for commodity options, stale-reference
   validation, and voyage-route compatibility.
6. Keep `USD`, `FCL dry`, `Non-reefer`, and `Non-dangerous goods` as read-only
   booking terms. Do not render disabled form controls for values the user
   cannot change.
7. Bind one idempotency key to one normalized submission payload. Reuse that
   key for an uncertain or in-progress retry; issue a new key only after a
   material edit creates a different payload.
8. Use `Create draft` as the sole primary action. Use an in-flow action row on
   mobile so the software keyboard and sticky UI never hide fields.
9. Preserve entered values on every recoverable failure and put keyboard focus
   on the linked error summary when correction is required.
10. The prompt's demo customer and voyage labels do not currently match live
    reference data. Seed or contract work must resolve that mismatch before
    visual acceptance.

## Evidence And Current-State Audit

### Repository behavior

- The public route is owned by the standalone Booking Next.js app and renders
  `BookingCreateForm` inside a narrow 760px page.
- The live route responds with the form even without a session. Its client-side
  reference requests then return `401`. The approved Auth and Shell boundary
  should resolve authorization before showing an editable business form.
- The page currently uses a Booking-only dark header with `Bookings` and
  `New booking`, not the approved shared LinerCore shell.
- Customer, load location, discharge location, voyage, and equipment type use
  native inputs with `datalist`. A typed value that does not match a canonical
  option can still be submitted.
- All four reference sets load in parallel after hydration. One failed request
  turns the entire reference state into `Reference choices unavailable`; there
  is no loading state, partial recovery, or retry command.
- Voyage selection populates blank load and discharge values from option
  attributes. It does not update already entered values and does not explain
  which values came from the voyage.
- Customer and routing are combined in one fieldset. Equipment and cargo are a
  second fieldset. Fixed terms appear as a four-column definition list.
- The form has a linked error summary and field errors. This is a sound
  accessibility contract and must be retained.
- The current client validator checks required values, UN/LOCODE shape,
  different load/discharge values, and the broad ISO 6346 character shape.
- The Booking domain performs the real ISO 6346 check-digit validation. The
  client currently allows a correctly shaped but invalid identifier to reach
  the server.
- The service requires exactly one routing leg and one equipment assignment.
  It supports only USD, FCL dry, non-reefer, non-dangerous-goods drafts.
- Creating a draft is authorization protected and idempotent. Reusing a key
  with the same payload returns the existing booking. Reusing it for a changed
  payload returns `IDEMPOTENCY_CONFLICT`. A still-running request returns
  `COMMAND_IN_PROGRESS`.
- The current success route is `/bookings/{id}?created=1`.
- No focused frontend test for the standalone `BookingCreateForm` was found.
  Existing service tests cover idempotency and canonical request mapping.

### Current API capability

`GET /api/reference-options` supports a `set` and optional `search` query. The
Booking application exposes these sets:

| Reference set | Current use | Available |
| --- | --- | --- |
| `PARTY_CUSTOMER` | Customer | Yes |
| `LOCATION` | Load and discharge location | Yes |
| `VESSEL_VOYAGE` | Vessel and voyage records | Yes |
| `EQUIPMENT_TYPE` | ISO equipment type | Yes |
| Commodity reference | Commodity | No |

The response contains `id`, `code`, `displayName`, `version`, and `attributes`.
Only active options are returned. Voyage attributes currently include
`recordType`, `originLocationId`, `destinationLocationId`, and
`carrierVoyageNumber`.

The create service validates domain shape but does not atomically confirm that
each selected reference is still active or that the voyage serves the submitted
route. Full canonical reference validation currently occurs after draft
creation when the booking validation command runs.

### Live reference evidence

The live Booking service currently returns:

- Customer: `LOCAL-CARRIER - Local Demo Carrier`
- Locations: `USNYC - New York, US` and `NLRTM - Rotterdam, NL`
- Voyage ID: `voyage-local-002`
- Carrier voyage number: `LC002E`
- Voyage display name: `LinerCore Atlas LC002E`
- Voyage route: `USNYC` to `NLRTM`
- Equipment type: `22G1 - 20 Foot General Purpose`

The requested design data differs in two places:

- `Northstar Retail` is not an active customer option.
- `VOY-LOCAL-002` is not a returned voyage code. The live canonical carrier
  voyage number is `LC002E`; `voyage-local-002` is its internal ID.

The interface must not manufacture either value. Demo seed data must add
Northstar Retail if it is the approved scenario. For voyage display, prefer the
canonical carrier voyage number `LC002E` and keep the internal ID hidden. If
`VOY-LOCAL-002` is an approved business code, the reference contract must state
which field owns it.

### UI/UX Pro Max interpretation

The skill guidance supports persistent labels, validation on blur, a linked
error summary, accessible async feedback, complete keyboard behavior, and
mobile-friendly input behavior. Generic landing-page, badge-heavy, amber CTA,
and decorative trust-layout suggestions are not applicable. This page uses the
approved LinerCore operational ERP tokens and shell.

## 1. Users, Tasks, And Information Hierarchy

### Primary users

- Booking agents creating repeated FCL dry booking drafts.
- Customer-service operators entering or correcting booking requests received
  through assisted channels.

### Primary task

Create one complete, canonical, recoverable booking Draft with the lowest
possible chance of selecting the wrong customer, route, voyage, equipment type,
or equipment reference.

### Queue-to-form context

The expected entry is `New booking` from `/bookings`. The form may receive a
safe same-origin return context representing the filtered queue. That context
controls only `Cancel` and the later Back destination; it must not alter form
data or appear as a raw URL.

### Information priority

1. Form title, Draft outcome, and unsaved status.
2. Customer.
3. Load location, discharge location, and compatible voyage.
4. Equipment type, equipment reference, and commodity.
5. Fixed booking terms.
6. Completeness and validation summary.
7. Cancel and Create draft.
8. Technical failure details, available only through the shared support
   disclosure.

### One-page workflow

1. The authorized user opens `New booking`.
2. Server-rendered shell and page structure appear with stable reference-option
   skeletons.
3. The user selects a customer.
4. The user selects load and discharge locations, then chooses a compatible
   voyage.
5. Alternatively, the user may select a voyage before both locations. Its
   canonical origin and destination populate the route.
6. While a voyage owns the route, both location values show `Set from voyage
   LC002E` and cannot be independently changed.
7. `Change route` clears the voyage first, then makes both location comboboxes
   editable. This prevents an invisible incompatible state.
8. The user selects equipment type, enters an equipment reference, and selects
   a commodity.
9. The Review and create section confirms the canonical selections and fixed
   terms.
10. `Create draft` validates locally, rechecks reference freshness through the
    supported server contract, and submits one frozen payload.
11. Success redirects to the new booking detail with a polite
    `Draft created` announcement.

### Section structure

Use real `fieldset` and `legend` semantics for the first three groups. Review
and create is a titled section because it contains facts and commands rather
than a set of editable controls.

Do not put each section in a card. Separate sections with a 1px border and
consistent vertical rhythm. The desktop review summary is a genuinely framed,
sticky tool and may use one bordered surface.

## 2. Desktop And Mobile Wireframes

### Desktop, 1440px

```text
+--------------------------------------------------------------------------+
| Skip to content                                                          |
| LinerCore | Search                       Help  Notifications  User        |
+--------------+-----------------------------------------------------------+
| Home         | Bookings / New booking                                   |
| Bookings  *  |                                                           |
| Rates        | New booking                                  Draft        |
| Reference    | Create a booking draft using current reference data.      |
| Equipment    |                                                           |
| Admin        | +--------------------------------+ +---------------------+ |
|              | | 1  Customer                    | | Booking summary     | |
|              | | Customer *                     | | Customer            | |
|              | | [ Search code or name       v] | | Not selected        | |
|              | +--------------------------------+ |                     | |
|              | | 2  Route and voyage            | | Route               | |
|              | | Load location *  Discharge *   | | Not selected        | |
|              | | [USNYC - New..] [NLRTM - ...]  | |                     | |
|              | | Voyage *                       | | Voyage              | |
|              | | [LC002E - Atlas - route     v] | | Not selected        | |
|              | | Set from voyage LC002E         | |                     | |
|              | +--------------------------------+ | Equipment           | |
|              | | 3  Equipment and cargo         | | Not selected        | |
|              | | Equipment type *  Reference *  | |                     | |
|              | | [22G1 - 20 ft]   [LCRU1000055] | | Terms               | |
|              | | Commodity *                    | | USD / FCL dry       | |
|              | | [ Search code or name       v] | | Non-reefer / Non-DG | |
|              | +--------------------------------+ |                     | |
|              | | 4  Review and create           | | 0 issues            | |
|              | | USD | FCL dry | No reefer | No DG| +---------------------+ |
|              | |                 [Cancel] [Create draft]                 | |
|              | +---------------------------------------------------------+ |
+--------------+-----------------------------------------------------------+
```

The main content uses a 12-column grid inside a maximum 1180px content width:
eight columns for the form and four for the summary. The summary top aligns
with section 1 and remains sticky below the 56px top bar.

### Desktop validation failure

```text
New booking                                                    Draft

+ Error: Booking not created ---------------------------------------------+
| Correct 3 fields and try again.                                          |
| - Select a customer                                                      |
| - Choose a voyage that serves USNYC to NLRTM                             |
| - The equipment check digit is not valid                                 |
+--------------------------------------------------------------------------+

1  Customer
Customer * [ Search code or name ]  Select a customer

2  Route and voyage
Load [USNYC]  Discharge [NLRTM]
Voyage * [LC009W ...]  Error: This voyage does not serve the selected route
```

Focus lands on the error-summary heading. Each list item is a link to the
associated control. The summary remains above section 1 and does not replace
field-level errors.

### Reference loading

```text
1  Customer
Customer *
[ stable 40px control skeleton                          ]

2  Route and voyage
[ stable control skeleton ] [ stable control skeleton   ]
[ stable 40px control skeleton                          ]

Reference data is loading. Editable dependent controls are not yet available.
```

The shell, heading, section legends, fixed terms, and actions keep their final
positions. `Create draft` is disabled with the explanation exposed through
associated status text, not through a tooltip alone.

### Mobile, 390px

```text
+--------------------------------------+
| LinerCore        [Search] [Menu]      |
+--------------------------------------+
| Bookings / New booking               |
|                                      |
| New booking                    Draft |
| Create a booking draft.              |
|                                      |
| 1  Customer                          |
| Customer *                           |
| [ Search code or name             v] |
|                                      |
| 2  Route and voyage                  |
| Load location *                      |
| [ USNYC - New York                v] |
| Discharge location *                 |
| [ NLRTM - Rotterdam               v] |
| Voyage *                             |
| [ LC002E - LinerCore Atlas        v] |
| Set from voyage LC002E               |
| [Change route]                       |
|                                      |
| 3  Equipment and cargo               |
| Equipment type *                     |
| [ 22G1 - 20 Foot General Purpose  v] |
| Equipment reference *                |
| [ LCRU1000055                       ] |
| Commodity *                          |
| [ Search code or name             v] |
|                                      |
| 4  Review and create                 |
| Customer  Northstar Retail           |
| Route     USNYC to NLRTM             |
| Voyage    LC002E                     |
| Equipment LCRU1000055 / 22G1         |
| Terms     USD / FCL dry / No / No    |
|                                      |
| [Cancel]              [Create draft] |
+--------------------------------------+
```

Mobile actions remain in document flow. They do not float above the software
keyboard. The primary action is full label text, at least 44px high, and may
take the full row below Cancel at 320-359px or with long localization.

### Mobile combobox

```text
Customer *
[ northstar                          x]
+--------------------------------------+
| NORTHSTAR                           |
| Northstar Retail                    |
| Customer                            |
+--------------------------------------+
| NORTHSTAR-EU                        |
| Northstar Retail Europe             |
| Customer                            |
+--------------------------------------+
3 results
```

The popup fits the viewport, does not produce page-level horizontal overflow,
and limits its height so the active input remains visible above the keyboard.

### Mobile unsaved-change dialog

```text
+--------------------------------------+
| Discard this booking draft?          |
| Your entries have not been created.  |
|                                      |
| [Keep editing]       [Discard draft] |
+--------------------------------------+
```

`Keep editing` is initial focus and the primary safe action. `Discard draft` is
destructive and uses the danger treatment.

## 3. High-Fidelity Form And Review Specification

### Approved tokens

Use the shared LinerCore tokens from the approved Auth and Shell design:

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

Do not use the current yellow focus ring, green eyebrow, dark Booking-only
header, or green borders on fixed booking terms.

### Typography

- Font: approved Inter stack.
- Page title: 28px/36px, weight 700.
- Section legend: 18px/26px, weight 700.
- Field label: 14px/20px, weight 650.
- Body and control text: 14px/20px.
- Help and validation text: 13px/18px.
- Review term: 12px/18px, weight 650.
- Review value: 14px/20px, weight 600.
- Codes, equipment references, timestamps, and quantities use tabular numerals.
- Letter spacing is 0. Do not use viewport-scaled type.

### Dimensions and spacing

- Desktop top bar: 56px.
- Desktop navigation rail: approved 224px width.
- Content maximum width: 1180px.
- Form column: minmax(0, 760px).
- Summary column: minmax(260px, 340px).
- Page horizontal gutter: 24px at 768-1439px, 32px at 1440px, 16px at 390px.
- Section padding: 24px 0 desktop, 20px 0 mobile.
- Field row gap: 16px desktop, 14px mobile.
- Label-to-control gap: 6px.
- Help/error gap: 6px.
- Control height: 40px desktop and 44px mobile.
- Text input maximum content width: 100%.
- Action gap: 10px.
- Error summary: 16px padding and a 4px danger left edge.

### Page header

Breadcrumb: `Bookings / New booking`

Title: `New booking`

Status: neutral `Draft` badge, indicating the outcome that will be created. It
must not imply that a record already exists.

Supporting text: `Create a booking draft using current customer, route, and
equipment reference data.`

Do not use an eyebrow reading `Create`.

### Canonical combobox behavior

Each canonical control shows code and display name as separate visual lines or
clearly separated inline values:

```text
USNYC
New York, US
```

Selection behavior:

- Only an option commit updates the canonical form value.
- Typed query text is not itself a valid selected value.
- Clearing query text does not silently clear an existing selection until the
  user invokes Clear or commits another option.
- Search matches code and display name case-insensitively.
- Customer, location, and commodity searches begin after two characters or
  immediately when the user opens a short approved recent list.
- Voyage search may match carrier voyage number, vessel name, and route.
- Server-backed search is debounced by 250-350ms and cancels superseded
  requests.
- Loading, no-match, unavailable, and retry states appear inside the popup
  without changing control height.
- Every option carries its immutable canonical ID and returned version in form
  state. The display code is never submitted in place of an ID where the
  current API expects an ID.
- Inactive options are not offered. A previously selected option that becomes
  inactive remains visible as an error value until replaced.

### Route and voyage source rules

The Phase 1 form supports one routing leg.

1. If the user selects both locations first, voyage search shows compatible
   options first. With the current API, this filtering is client-side from
   voyage origin/destination attributes; an authoritative server check is still
   required on submit.
2. If the user selects a voyage first, load and discharge locations populate
   from that voyage.
3. Once a voyage is selected, route fields show a read-only value surface and
   the source line `Set from voyage LC002E`.
4. `Change route` clears the voyage and returns focus to Load location. It does
   not silently retain a possibly incompatible voyage.
5. Selecting a new voyage replaces both derived locations after the user
   confirms only when that replacement would overwrite previously user-entered
   route values.
6. If route changes because a reference record was refreshed, announce the
   changed values and require review before create.

Do not provide a checkbox to override compatibility. A policy exception, if it
ever exists, is a separate authorized workflow.

### Equipment behavior

Display label: `Equipment reference`

API/domain mapping: existing `equipmentId`

Help: `ISO 6346 container number, including check digit.`

Behavior:

- Accept letters and digits, normalize letters to uppercase on blur, and remove
  harmless surrounding whitespace.
- Do not silently alter internal characters or compute a replacement check
  digit.
- Validate category identifier, serial digits, and check digit.
- Show a segmented visual preview only if it remains a single accessible input;
  do not split the value into multiple focus stops.
- The current Phase 1 quantity is always 1 and is stated in Review. Do not show
  an editable quantity control.
- Duplicate-equipment validation is defined for the shared equipment-line
  model, but cannot occur in the one-assignment Phase 1 UI. It becomes active
  when multiple assignments are supported. The service remains responsible for
  preventing duplicate equipment across a future multi-line payload.

### Fixed booking terms

Render these as a compact definition list in Review and create:

| Label | Value |
| --- | --- |
| Currency | USD |
| Cargo mode | FCL dry |
| Reefer | No |
| Dangerous goods | No |
| Equipment quantity | 1 |

Use `Dangerous goods`, not the abbreviation `DG`, in the primary content. A
short `Non-DG` label may appear only in constrained secondary summary text when
the expanded term is available to assistive technology.

### Review summary

The summary updates after a committed selection or validated input blur. It
contains:

- Customer display name and code.
- Route as `USNYC to NLRTM` with location names.
- Carrier voyage number and vessel display name.
- Equipment reference and type.
- Commodity code and display name.
- Fixed terms.
- Completion result such as `2 required fields remaining`, `Ready to create`,
  or `3 issues to correct`.

The desktop summary is sticky but never taller than the available viewport. If
content exceeds it, the whole page scrolls; do not create a small nested
scrolling region.

The summary is repeated inline in Review and create at widths below 1024px.
Avoid a hidden off-screen sticky duplicate.

### Actions

`Create draft`:

- Primary maritime-blue button.
- Enabled only when reference options needed by the form are available and all
  required values have a committed selection or valid input.
- Client validation still runs on activation because enabled state is not an
  authorization or correctness guarantee.
- On submit, label becomes `Creating draft...` with a small progress indicator.
- Width remains stable between idle and busy labels.
- Is disabled during the frozen request.

`Cancel`:

- Quiet secondary button, not a plain link styled as a button.
- Returns to the safe queue context when pristine.
- Opens the unsaved-change dialog after the first material edit.
- Does not preserve secret or non-allowlisted URL values.

Do not include `Save for later`; creating the Draft is already the save action.

### Success

After `201 Created`, navigate to `/bookings/{id}?created=1` and preserve the
safe queue return context when supported. The detail page shows:

Heading: `Draft created`

Message: `Booking {bookingNumber} was created as a Draft.`

Focus: detail page `h1`, with a polite announcement after navigation.

If navigation fails after the create response, replace the action area with:

`Draft created. Continue to {bookingNumber}.`

The booking-detail link must use the ID from the successful response. Do not
submit again.

## 4. Field Inventory, Help, And Validation

| Section | UI label | Control | Submitted value | Required | Help or source |
| --- | --- | --- | --- | --- | --- |
| Customer | Customer | Async combobox | `customerId` | Yes | Search customer code or name |
| Route | Load location | Async combobox/read-only derived value | `routing[0].loadUnLocode` | Yes | UN/LOCODE and place name |
| Route | Discharge location | Async combobox/read-only derived value | `routing[0].dischargeUnLocode` | Yes | UN/LOCODE and place name |
| Route | Voyage | Async combobox | `routing[0].voyageId` | Yes | Carrier voyage number, vessel, route |
| Equipment | Equipment type | Async combobox | `equipment[0].equipmentTypeCode` | Yes | ISO equipment type code and name |
| Equipment | Equipment reference | Text input | `equipment[0].equipmentId` | Yes | ISO 6346 including check digit |
| Cargo | Commodity | Async combobox | `attributes.commodityCode` | Yes | Canonical commodity code and name |
| Review | Currency | Read-only fact | `USD` | Fixed | Phase 1 term |
| Review | Cargo mode | Read-only fact | `FCL_DRY` | Fixed | Phase 1 term |
| Review | Reefer | Read-only fact | `false` | Fixed | Phase 1 term |
| Review | Dangerous goods | Read-only fact | `false` | Fixed | Phase 1 term |
| Review | Equipment quantity | Read-only fact | `1` | Fixed | Phase 1 constraint |

### Exact validation messages

| Condition | Field message | Error-summary link text |
| --- | --- | --- |
| Customer empty | `Select a customer.` | `Select a customer` |
| Customer typed but not selected | `Choose a customer from the results.` | `Choose a listed customer` |
| Customer inactive | `{name} is no longer active. Choose another customer.` | `Choose an active customer` |
| Load empty | `Select a load location.` | `Select a load location` |
| Load malformed fallback | `Enter a five-character UN/LOCODE.` | `Correct the load UN/LOCODE` |
| Discharge empty | `Select a discharge location.` | `Select a discharge location` |
| Same locations | `Discharge location must differ from load location.` | `Choose a different discharge location` |
| Voyage empty | `Select a voyage.` | `Select a voyage` |
| Voyage mismatch | `{voyage} does not serve {load} to {discharge}. Choose a compatible voyage or change the route.` | `Choose a compatible voyage` |
| Equipment type empty | `Select an equipment type.` | `Select an equipment type` |
| Equipment type incompatible | `{type} is not available for this booking route or cargo.` | `Choose a compatible equipment type` |
| Equipment reference empty | `Enter an equipment reference.` | `Enter an equipment reference` |
| Equipment shape invalid | `Enter 11 characters in ISO 6346 format, for example LCRU1000055.` | `Correct the equipment reference` |
| Equipment check digit invalid | `The check digit does not match this equipment reference.` | `Correct the equipment check digit` |
| Duplicate equipment | `{reference} is already included in this booking.` | `Remove the duplicate equipment reference` |
| Commodity empty | `Select a commodity.` | `Select a commodity` |
| Canonical option stale | `This reference changed after selection. Review and select it again.` | `Review the changed reference` |
| General validation | `Correct {count} fields and try again.` | Not a field link |

Messages end with punctuation at the field. Summary links use concise command
language without repeating punctuation.

### Validation timing

- Required-state errors appear on submit, not while the untouched page loads.
- Format and check-digit errors appear on blur after a non-empty value.
- A field error clears only when the new value satisfies that field's local
  rule or a new canonical option is committed.
- Cross-field route-voyage compatibility runs after the second route value or
  voyage is committed.
- Server validation always wins. Server field paths continue to map to existing
  form IDs and test IDs.
- Do not announce every keystroke. Announce committed selection, derived route
  changes, and submission outcomes.

### Reference version behavior

Keep the returned reference ID and version with each committed selection.
Immediately before create, the server must verify:

- The reference still exists.
- It is active.
- The selected version remains acceptable.
- The voyage is compatible with the selected route.
- The equipment type is allowed for the current MVP.

If strict version equality is not the business rule, a display-name-only update
may be accepted after refreshing the label. Any semantic change requires
reselection.

The current create API does not provide this atomic check. Implementation must
either add a safe preflight contract or strengthen create validation while
preserving the request and response shape.

## 5. Keyboard, Focus, And Announcements

### Focus order

1. Skip link.
2. Shared top-bar controls.
3. Authorized module navigation.
4. Breadcrumb links.
5. Customer.
6. Load location.
7. Discharge location.
8. Voyage.
9. `Change route`, only when visible.
10. Equipment type.
11. Equipment reference.
12. Commodity.
13. Cancel.
14. Create draft.

The visual and DOM order must match. The sticky summary is informational and
does not enter the focus order unless it contains an issue link.

### Combobox keyboard contract

- `Tab`: enters and leaves the combobox as one control.
- `ArrowDown`: opens the list and moves to the next option.
- `ArrowUp`: moves to the previous option.
- `Home` and `End`: move to first and last loaded option while open.
- `Enter`: commits the active option.
- `Escape`: closes the list and restores the previously committed value.
- Printable keys: update search query.
- `Alt+ArrowDown`: opens without clearing the committed value.
- Clear icon button: accessible name `Clear {field label}`.

Use `aria-activedescendant`, stable option IDs, `aria-expanded`,
`aria-controls`, and `aria-autocomplete="list"`. The input receives the
persistent visible label through `htmlFor`/`id`; `aria-label` is not a
substitute.

Announce result counts after search settles, such as `3 customer results`.
Announce `No matching customers` once, not on every key.

The current shared `Combobox` needs an accessibility and async-state extension:
it lacks `aria-activedescendant`, disabled/loading/error support, an external
input ID, helper/error description wiring, and structured secondary option
content. Extend it centrally rather than creating a Booking-only combobox.

### Validation focus

- On failed submit, focus the error-summary heading with `tabIndex="-1"`.
- Activating a summary link focuses the actual input or combobox input.
- If a derived read-only location is invalid, the summary links to Voyage or
  `Change route`, whichever can resolve the error.
- On server form rejection, retain all values and follow the same summary
  behavior.
- On reference reload, keep focus on the Retry button until loading completes,
  then announce availability without stealing focus.

### Dialog focus

- Unsaved-change dialog initial focus: `Keep editing`.
- `Escape`: closes and restores focus to Cancel or the navigation control that
  triggered it.
- `Discard draft`: returns to the safe queue and does not restore focus on the
  departing page.
- Background content is inert while the dialog is open.

### Live regions

Use one visually hidden polite region for:

- Reference options loaded.
- Search result count.
- Voyage populated load and discharge locations.
- Field reference refreshed.
- `Creating draft`.
- `Draft is still being created. Checking again.`
- Successful create before navigation.

Use an assertive error summary announcement only after submission fails. Do not
combine `role="alert"` with several independently live field errors.

### Mobile input behavior

- Equipment reference uses `autocapitalize="characters"`, spellcheck off, and
  an input mode that still permits letters and digits.
- Search comboboxes use normal text input and support platform autofill only
  where it cannot insert a non-canonical value.
- Scroll the first invalid control into the safe viewport only after the user
  activates its summary link. Do not jump the page on every blur.
- Add safe-area padding to the end of the form.

## 6. State And Recovery Matrix

| State | Presentation | Available action | Data retention | Focus/announcement |
| --- | --- | --- | --- | --- |
| Initial loading | Stable control skeletons in each canonical field | Cancel | None yet | Polite `Reference data is loading` |
| Ready, empty | Normal form and incomplete summary | Cancel; Create disabled | Current values | No automatic focus change |
| Partial reference failure | Affected controls show unavailable state; unaffected selections remain | `Retry reference data` | All entries | Focus stays on Retry; announce result |
| All references unavailable | Compact warning above section 1; canonical controls unavailable | Retry; Cancel | Non-reference entries retained | Polite failure announcement |
| No search matches | In-popup empty result | Change query; Clear | Existing committed value retained | Polite `No matching...` |
| Invalid route-voyage | Inline error on Voyage and linked summary after submit | Change voyage; Change route | All entries | Focus summary after submit |
| Duplicate equipment | Inline equipment-reference error | Correct reference | All entries | Focus summary after submit |
| Stale/inactive reference | Value remains visible with warning/danger state | Reselect; Reload options | Other entries retained | Announce changed reference |
| Local validation failure | Linked summary plus field errors | Correct fields | All entries | Focus summary |
| Server field rejection | Same error pattern using canonical field mapping | Correct fields; Retry | All entries | Focus summary |
| Authorization changed | Form replaced by approved access-denied boundary | Return; Request access if supported | No protected draft persisted in browser storage | Focus denial heading |
| Session expired | Form replaced by canonical signed-out/expiry boundary | Sign in again | Do not expose values after expiry | Focus expiry heading |
| Submitting | Frozen controls, stable busy button, polite status | No duplicate submit | Frozen payload in memory | Announce `Creating draft` |
| Command in progress | Inline information state; controlled same-key retry | Automatic bounded check; Retry | Frozen payload and key | Announce checking |
| Network timeout, outcome unknown | Warning that creation may have completed | `Check again` using same key; Cancel only after resolution warning | Frozen payload and key | Focus status heading |
| Idempotency conflict | Form-level conflict message; no silent new submission | Review values; create new request after edit | All values retained | Focus summary |
| Recoverable service failure | Form-level error and Retry | Retry same payload/key when outcome uncertain | All values retained | Focus error summary |
| Definitive business rejection | Field/form errors | Correct and submit new payload | All values retained | Focus error summary |
| Success | Redirect or stable Continue link | Continue to booking | Submission state retained until navigation | Polite success |
| Unsaved cancel/navigation | Confirmation dialog | Keep editing; Discard draft | Retained if kept | Dialog focus rules |

### Reference-option failure detail

Failures are tracked per set. A customer-options failure must not erase already
loaded locations. A voyage failure disables only voyage-dependent completion.
The page-level message states:

`Some reference data could not be loaded. Your entries are still here.`

Affected field text states:

`Voyage choices are unavailable. Retry.`

Do not show a generic red page error while the user can still safely continue
working in unaffected fields.

### Server rejection detail

Map existing canonical server paths:

- `customerId` to Customer.
- `routing[0].loadUnLocode` to Load location.
- `routing[0].dischargeUnLocode` to Discharge location.
- `routing[0].voyageId` to Voyage.
- `equipment[0].equipmentTypeCode` to Equipment type.
- `equipment[0].equipmentId` to Equipment reference.
- `attributes.commodityCode` or the approved replacement to Commodity.

Unknown fields appear once as a form error. Correlation ID belongs in the
collapsed shared Technical details disclosure.

### Idempotency state model

1. The editable form has a normalized payload fingerprint.
2. Before the first submit for that fingerprint, generate an idempotency key.
3. Freeze the normalized payload, fingerprint, and key when submission begins.
4. Ignore Enter, click, touch, and programmatic duplicate submits while busy.
5. A successful response completes the request and disables all further create
   submissions.
6. A timeout or `COMMAND_IN_PROGRESS` retains the same payload and key. A
   bounded retry repeats the same POST, which the current service can safely
   resolve to the existing booking after completion.
7. A field edit after a definitive failure creates a new fingerprint and key.
8. Never reuse a key with a changed payload. This would correctly trigger the
   current `IDEMPOTENCY_CONFLICT`.
9. Do not store idempotency keys in URLs, logs visible to the user, or long-term
   browser storage.

Automatic in-progress retries use short bounded backoff, for example 500ms,
1000ms, and 2000ms. After that, expose `Check again`. Do not claim failure when
the outcome remains unknown.

### Unsaved-change model

The form becomes dirty after a committed canonical selection or a non-empty
equipment-reference edit. Query typing without a committed selection does not
make the business form dirty unless it replaced a committed value.

Protect:

- Cancel.
- Breadcrumb navigation.
- Module navigation.
- Browser back.
- Refresh or close through the browser's native before-unload protection.

Do not protect:

- Initial untouched form.
- Successful redirect.
- Session-expiry security redirect.
- Authorization-denial redirect.

Do not persist sensitive draft values to local storage. If draft restoration is
later required, it needs a server-side, user-bound Draft contract.

## 7. Shared Component Mapping

| Design element | `@erp/ui` mapping | Required work |
| --- | --- | --- |
| Shared shell | Approved Shell composition | Reuse page 03-09 implementation |
| Breadcrumbs | Shared `Breadcrumbs` | Add/confirm semantic current item |
| Page header | `PageHeader` plus `StatusBadge` | Neutral Draft mapping |
| Section layout | Semantic `fieldset`, `legend`, `SectionDivider` | Avoid Card composition |
| Field wrapper | `Field` | Support help + error IDs together |
| Canonical selector | `Combobox` | Extend for async, IDs, errors, active descendant, structured options |
| Equipment reference | `Input` | Expose uppercase/input-mode props |
| Fixed terms | Shared `DefinitionList` | Compact responsive variant |
| Review tool | `RecordSummary` or form-specific composition | Framed tool, not generic nested Card |
| Error summary | Shared `ErrorSummary` | Preserve link-to-field behavior |
| Information/warning | `StatusStrip` | Add action slot and live-region control |
| Actions | `Button` | Primary, secondary, danger, stable busy width |
| Unsaved dialog | `Dialog` | Focus trap, inert background, restore focus |
| Loading | `Skeleton` | Fixed control and summary shapes |
| Technical details | Approved support disclosure | Never show primary correlation text |

### Recommended shared additions

`AsyncReferenceCombobox` may compose the shared `Combobox` with:

- Reference set and search adapter.
- Loading/error/empty states.
- Structured code/name option.
- Canonical ID and version retention.
- Cancellation and debounce.
- Stale-selection presentation.

It belongs in `@erp/ui` only if it remains domain-neutral. The Booking-specific
mapping from voyage attributes to route values stays in Booking composition.

`BookingDraftSummary`, `VoyageRouteFields`, and
`EquipmentReferenceField` remain Booking components because they carry domain
semantics.

### Server and client boundaries

Server Component responsibilities:

- Authorization boundary.
- Shared shell and breadcrumbs.
- Initial approved reference data when practical.
- Safe queue return context.
- Environment and user context.

Focused client island responsibilities:

- Async reference search.
- Canonical selections and derived route behavior.
- Local validation and error summary.
- Dirty state and unsaved-change dialog.
- Idempotent submission state.
- Async announcements.

Do not duplicate session, authorization, safe-return, or service-header logic
inside the client form.

### Preserve existing automation contracts

Preserve these existing IDs unless a test migration is explicitly approved:

- `booking-customerId`
- `booking-loadUnLocode`
- `booking-dischargeUnLocode`
- `booking-voyageId`
- `booking-equipmentTypeCode`
- `booking-equipmentId`
- `booking-commodityCode`
- `booking-submit`
- `booking-errors`

The combobox input, not a decorative wrapper, owns each current field test ID.

## Responsive Behavior

| Width | Layout | Summary | Actions | Navigation |
| --- | --- | --- | --- | --- |
| 1440px | 8/4 form-summary grid | Sticky framed tool | Right aligned in Review | Persistent rail |
| 1024px | 7/5 or 8/4 grid, minimum 280px summary | Sticky if viewport height permits | Right aligned | Collapsible approved rail |
| 768px | One content column | Inline Review section | Right aligned or stacked for localization | Compact rail/drawer |
| 390px | One column, 16px gutter | Inline only | In flow; wrap without truncation | Modal navigation drawer |

Additional rules:

- Two-column field rows require at least 640px of content width.
- At 768px, load/discharge may remain two columns only when each control has at
  least 260px. Otherwise stack.
- No page-level horizontal scroll.
- Long customer and commodity names wrap in option rows and the summary.
- Codes do not truncate when they carry meaning.
- Combobox popups use available viewport width and height.
- At 200% zoom, content reflows without loss of fields, help, errors, status, or
  actions.
- At 320px, action buttons stack and use full width.

## 8. Playwright And Visual-Regression Acceptance

### Principal create journey

1. Sign in as an authorized Booking user.
2. Open `/bookings` with a non-default supported filter context.
3. Activate `New booking`.
4. Confirm breadcrumb, Draft outcome, and shared authorized shell.
5. Search for and select Northstar Retail after the approved seed exists.
6. Select voyage `LC002E` or the final approved carrier voyage number.
7. Assert that `USNYC` and `NLRTM` populate and show voyage source text.
8. Assert that route controls cannot drift while the voyage remains selected.
9. Select equipment type `22G1`.
10. Enter `LCRU1000055`.
11. Select the approved FCL dry commodity.
12. Assert the summary shows customer, route, voyage, equipment, USD, FCL dry,
    non-reefer, non-dangerous goods, and quantity 1.
13. Activate `Create draft`.
14. Assert one POST carries one idempotency key and the existing request shape.
15. Assert the button remains stable and prevents duplicate interaction.
16. Assert redirect to the created booking detail and `Draft created`.
17. Use Back to bookings and verify the original supported queue context.

### Duplicate-submit prevention

- Double-click Create draft and assert one network request.
- Press Enter repeatedly while the button is busy and assert one request.
- Dispatch click and submit events in the same task and assert one request.
- Delay the first response, return `COMMAND_IN_PROGRESS`, and assert retries
  use the same key and byte-equivalent normalized payload.
- Return a successful replay and assert one booking detail navigation.
- Change a field after a definitive rejection and assert the next request uses
  a new key.
- Assert a changed payload is never sent with the old key.

### Validation

- Submit empty and assert one linked error summary plus all required field
  messages.
- Follow each summary link and assert focus reaches the associated input.
- Enter the same load and discharge location.
- Select a voyage incompatible with the route.
- Enter a correctly shaped equipment reference with an invalid check digit.
- Test lowercase equipment input and approved normalization.
- Test stale customer, location, voyage, equipment type, and commodity.
- Return canonical server field paths and assert each maps to the correct
  control.
- Return an unknown server field and assert a safe form-level error.

### Reference options

- Verify server-backed code and display-name search.
- Verify rapid query changes cancel or ignore stale responses.
- Verify no matching results.
- Fail one reference set and assert other loaded sets remain usable.
- Retry and assert current entries remain.
- Remove an active selected value before submit and assert reselection is
  required.
- Change only a reference display name and verify the approved version policy.
- Assert internal reference IDs are not presented as business labels.

### Route source

- Select voyage first and verify route population.
- Select route first and verify compatible voyage ordering.
- Activate Change route and assert Voyage clears before locations become
  editable.
- Select another voyage that would replace user-entered route values and assert
  explicit confirmation.
- Verify the screen-reader announcement names both populated locations.

### Unsaved changes

- Cancel pristine form and return directly.
- Cancel dirty form and keep editing.
- Cancel dirty form and discard.
- Use breadcrumb, module navigation, browser back, refresh, and close.
- Assert successful creation does not show the discard dialog.
- Assert security redirects do not leave protected form values visible.

### Accessibility

- Complete the form with keyboard only.
- Verify combobox active option and `aria-activedescendant`.
- Verify persistent visible labels and help/error descriptions.
- Verify error-summary focus and links.
- Verify live announcements without duplicate speech.
- Verify dialog trap, Escape, and focus restoration.
- Verify visible focus on every interactive control.
- Run automated accessibility checks in default, loading, error, dialog, and
  submitting states.
- Test reduced motion, 200% zoom, and high-contrast preferences.

### Responsive and visual baselines

Capture at:

- 390x844: empty, populated, validation errors, combobox open, and discard
  dialog.
- 768x1024: populated and partial reference failure.
- 1024x768: populated with sticky summary.
- 1440x900: populated principal state and server rejection.

Visual assertions:

- No horizontal overflow.
- No hidden label, error, source, status, or primary action.
- No overlap between popup, software-keyboard safe area, and active input.
- Stable control and button dimensions during loading/submitting.
- Summary does not obscure form content.
- Long customer, voyage, commodity, and error text wraps safely.
- Status meaning is not color-only.

### Security and authorization

- Signed-out request follows the canonical sign-in flow before editable form
  presentation.
- A user lacking Booking create permission does not see `New booking` in
  navigation or queue commands.
- A valid protected deep link that becomes denied uses the approved
  access-denied route.
- Unsafe return context is neutralized to `/bookings`.
- Raw session data, service headers, idempotency keys, and correlation IDs do
  not appear in primary content.
- Protected form values do not remain visible after expiry or sign-out.

## Implementation Dependencies

These are design dependencies, not changes made by this task:

1. Add or approve a commodity reference-option set and canonical commodity
   contract. Until then, commodity cannot meet the canonical-combobox
   requirement.
2. Add an authoritative create-time or preflight check for reference activity,
   reference version policy, and voyage-route compatibility.
3. Decide whether the UI business voyage code is the carrier voyage number
   `LC002E` or a new approved `VOY-LOCAL-002` value.
4. Add Northstar Retail to active demo customer data if it remains the approved
   Phase 1 scenario.
5. Extend `@erp/ui` Combobox accessibility and async behavior.
6. Implement the approved shared Shell around the standalone Booking app.
7. Move the create authorization boundary before editable page presentation.
8. Add focused component and Playwright coverage for the standalone form.

## Recommended Implementation Slice Within Pages 10-13

Do not implement page 11 independently before pages 10-13 are approved, per the
agreed review sequence.

When implementation is approved, use this order:

1. Shared Shell, Field, ErrorSummary, and AsyncReferenceCombobox foundations.
2. Reference and create-time validation contracts, including commodity.
3. Page 10 queue entry and safe return context.
4. Page 11 form composition and idempotent submission state.
5. Page 12 detail-page created-state handoff.
6. Cross-page Playwright journey and responsive visual gate.

## Approval Checklist

- Approve one-page grouped form instead of a wizard.
- Approve voyage-owned route values for the one-leg Phase 1 workflow.
- Approve `Equipment reference` as the UI label while preserving
  `equipmentId` in the API.
- Approve canonical commodity selection and its required contract work.
- Approve `LC002E` as the current standards-aligned voyage display value, or
  identify the authoritative source of `VOY-LOCAL-002`.
- Approve adding Northstar Retail to the demo reference data.
- Approve same-key retries for uncertain and in-progress create outcomes.
- Approve the unsaved-change behavior and no local-storage persistence.
- Approve extending the shared Combobox rather than building a page-local
  selector.
- Approve deferring implementation until pages 10, 11, 12, and 13 are reviewed.

No production files were modified.

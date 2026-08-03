# LinerCore Booking Operations Queue Design

Status: Proposed for review

Route: `/bookings`

Scope: UI/UX Pro Max design task only. No production code or runtime
configuration was changed.

## Executive Decisions

1. Keep `/bookings` as the canonical public workspace route. Keep `/booking`
   and its descendants as compatibility redirects.
2. Present the queue inside the approved shared LinerCore application shell,
   while keeping Booking route and domain ownership in the Booking app.
3. Use a semantic desktop table and an unframed mobile record list. Do not force
   a wide table into 390px or turn each mobile record into a decorative card.
4. Preserve the current `search`, `status`, and `page` query behavior. Add
   richer filters only after their server contracts exist.
5. Do not add saved views, row checkboxes, or bulk actions in the first slice.
   They have no confirmed persistence or batch-action contract.
6. Use `Manual pricing` and `Validation blocked` as amber attention states.
   Reserve red for failed or exceptional conditions.
7. Resolve customer identifiers to business display names. Retain the source
   identifier as secondary detail only when useful.
8. Never show correlation identifiers in the primary queue. Put them in a
   support disclosure on failure states.

## Evidence And Current-State Audit

### Repository and live behavior

- Nginx routes `/bookings` directly to the standalone Booking Next.js app.
- `/booking` permanently redirects to `/bookings`.
- The live `/bookings` response currently renders `LinerCore Booking`, a
  two-link Booking header, search and status controls, and an unavailable state:
  `A signed-in Booking actor is required`.
- The current page is a Server Component and requests 25 rows.
- Supported list API parameters are `search`, `status`, `page`, and `size`.
- The API returns `items`, `returned`, `page`, and `size`. It does not return an
  exact total.
- The service does not currently support voyage/date, exception, owner, sort,
  direction, or saved-view parameters.
- The desktop table contains Booking, Customer, Route, Equipment, and Status.
- At 720px the current CSS hides Customer and Equipment but leaves a compressed
  table rather than a deliberate mobile record layout.
- The current Booking app header is separate from both the approved Auth/Shell
  design and the older `PlatformShell`.
- The older shared `PlatformShell` includes a decorative journey ribbon,
  gradient logo mark, unavailable-module rail entries, and inline styles. It
  must not be adopted as-is.
- The current `@erp/ui` contains useful primitives including `Button`, `Field`,
  `Input`, `Select`, `StatusBadge`, `Table`, `EmptyState`, `Skeleton`, and
  `StatusStrip`.
- `StatusBadge` lacks explicit mappings for `MANUAL_PRICING` and
  `VALIDATION_BLOCKED`.

### Live data evidence

The local Booking database contains six bookings:

| Status | Count |
| --- | ---: |
| Confirmed | 2 |
| Priced | 1 |
| Validation blocked | 1 |
| Validated | 1 |
| Draft | 1 |

The confirmed reference booking exists:

- Booking number: `BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3`
- Route: `USNYC` to `NLRTM`
- Voyage: `voyage-local-002`
- Equipment: `LCRU1000055`, type `22G1`, quantity 1
- Status: Confirmed

Current data differences that implementation must resolve:

- The stored customer is `party-customer-local-carrier`, whose current display
  name is `Local Demo Carrier`, not `Northstar Retail`.
- There is no current Manual Pricing booking in the local database.
- The design fixture should use `Northstar Retail` and one Manual Pricing row
  only after the demo seed and service response make those values real.

### Contracts to preserve

- `bookingReturnTo` preserves `search`, `status`, and nonzero `page`.
- Booking detail accepts only same-origin `/bookings` return destinations.
- Existing compatibility handling recognizes `page`, `pageSize`, `sort`,
  `direction`, `status`, and `q`.
- Existing Shell test identifiers should remain available when the live route
  adopts the shared shell composition:
  `shell-new-booking`, `shell-booking-list`, `shell-booking-empty`, and
  `shell-booking-error`.
- Authorization remains server enforced. Hiding a filter or command is not an
  authorization control.

## 1. Users, Tasks, And Queue Priorities

### Primary users

- Booking agents create, validate, price, confirm, amend, and reopen bookings.
- Customer-service operators locate customer records, answer status questions,
  and resolve data or pricing exceptions.
- Supervisors scan workload and exceptions but may have broader scope.

### Priority order

1. Identify records needing intervention.
2. Find a booking by booking number, customer, route, voyage, or equipment.
3. Understand current status and the next required action without opening every
   row.
4. Open the correct booking while preserving queue context.
5. Reopen recent work after returning from detail.
6. Create a new booking when authorized.

### Scanning model

- Booking number is the primary row anchor.
- Status and attention reason are visible without interaction.
- Customer and route are the next strongest identifiers.
- Voyage, departure, equipment, owner, and updated time support comparison.
- Technical IDs and diagnostics are secondary or hidden.

### Authorization visibility

- Show `New booking` only when the user has create permission.
- Return only records within server-enforced business scope.
- Do not show inaccessible rows as locked or disabled.
- If the returned list is intentionally scope-limited, show a quiet scope label
  such as `North America to Europe` only when the server supplies that scope.
- A 403 response uses the approved in-workspace access-denied composition.

## 2. Information Hierarchy And Filter Model

### Page hierarchy

1. Shared skip link, role-aware navigation, and compact top bar.
2. Breadcrumbs: `Home / Bookings`.
3. Page header: `Bookings`, result summary, and `New booking`.
4. Primary filter row.
5. Active-filter chips and `Clear all`.
6. Stale or degraded data banner when applicable.
7. Queue table or mobile record list.
8. Pagination and page-size control.
9. Collapsed support details only on failures.

### Filter contract

| UI control | Query key | Initial slice | Contract note |
| --- | --- | --- | --- |
| Search | `search` | Yes | Existing route and service behavior |
| Status | `status` | Yes | Existing exact enum filter |
| Page | `page` | Yes | Existing zero-based service parameter |
| Rows per page | `size` | Yes, after page accepts it | API already supports 1 to 100 |
| Voyage | `voyage` | Dependency | Add server query support |
| Departure from/to | `departureFrom`, `departureTo` | Dependency | Define timezone and inclusive boundaries |
| Attention type | `attention` | Dependency | Define validation, pricing, and journey categories |
| Owner | `owner` | Dependency | Add assignment model and canonical user IDs |
| Sort | `sort`, `direction` | Dependency | Add allowlisted server sorting |
| Saved view | N/A | Deferred | Requires persistence and ownership rules |

Legacy `q` and `pageSize` may remain accepted by the compatibility adapter, but
the canonical `/bookings` UI should emit `search` and `size`. The adapter should
map aliases without losing existing deep links.

### Search behavior

- Persistent label: `Search bookings`.
- Hint: `Booking number, customer, route, voyage, or equipment`.
- Apply on Enter or the adjacent `Search` button.
- Do not search on every keystroke in Phase 1.
- Trim leading and trailing whitespace.
- Preserve the typed query in the URL.
- Reset `page` to `0` when any filter changes.
- Search coverage beyond booking number and customer ID is a backend
  dependency; do not imply fields are searchable before they are indexed.

### Status filter

Use canonical business labels while sending enum values:

| Value | Display label | Tone |
| --- | --- | --- |
| `DRAFT` | Draft | Neutral |
| `VALIDATION_BLOCKED` | Validation blocked | Warning |
| `VALIDATED` | Validated | Information |
| `PRICING_PENDING` | Pricing pending | Warning |
| `PRICED` | Priced | Information |
| `MANUAL_PRICING` | Manual pricing | Warning |
| `CONFIRMED` | Confirmed | Success |
| `AMENDED` | Amended | Warning |
| `RECONFIRMED` | Reconfirmed | Success |
| `EXCEPTION` | Exception | Danger |

Do not group Manual Pricing under Exception. It is a controlled operational
path, not necessarily a system failure.

### Filter presentation

- Desktop at 1440px: search, status, voyage, departure, attention, owner, then
  `Apply filters`.
- Until contracts exist, render only search and status. Do not show disabled
  future filters.
- At 768px: search and status remain visible; additional supported filters move
  into a `More filters` disclosure.
- At 390px: show search plus a `Filters` button. Open a modal drawer with
  supported filters, `Apply filters`, and `Clear all`.
- Active chips are links or buttons named as removal actions, for example
  `Remove status filter: Manual pricing`.
- Do not use chips as the only place to communicate active filtering.

### Results summary and pagination

- With the current response, say `6 bookings shown`, not `6 bookings`, because
  the exact total is unknown.
- Once the API returns `total`, use `6 bookings` and `Showing 1-6`.
- Page size options: 25, 50, and 100.
- Pagination uses `Previous` and `Next` plus `Page N`.
- Disable Previous on page 0.
- With no total, enable Next only when `returned === size`.
- Preserve all filters and sorting in pagination links.
- Returning from detail restores the complete queue URL and its scroll target
  when technically feasible.

## 3. Wireframes

### Desktop, 1440px

```text
+--------------------------------------------------------------------------------------+
| Skip to main content                                                                |
+----------------+---------------------------------------------------------------------+
| LinerCore      | LinerCore  Local demo   [Global search]         Help  Alerts  User  |
| Home           +---------------------------------------------------------------------+
| Bookings       | Home / Bookings                                                     |
| Rates          |                                                                     |
| Reference Data | Bookings                                      [ + New booking ]     |
|                | 6 bookings shown                                                     |
| authorized     +---------------------------------------------------------------------+
| modules only   | Search bookings [__________________] Status [All v] [Apply filters]  |
|                | [Manual pricing x] [Clear all]                    [More filters v]   |
|                +---------------------------------------------------------------------+
|                | Booking          Customer     Route / voyage    Depart    Status     |
|                +---------------------------------------------------------------------+
|                | BKG-8c6bf...     Northstar    USNYC -> NLRTM    28 Jul    Confirmed  |
|                |                  Retail        VOY-LOCAL-002                [green]   |
|                +---------------------------------------------------------------------+
|                | BKG-[seed]       Northstar    USNYC -> NLRTM    30 Jul    Manual     |
|                |                  Retail        Pricing review               pricing  |
|                +---------------------------------------------------------------------+
|                | BKG-5489...      Northstar    USNYC -> NLRTM    Not set    Draft      |
|                |                  Retail        Reference check              required  |
|                +---------------------------------------------------------------------+
|                | 25 per page [v]                      Previous  Page 1  Next           |
+----------------+---------------------------------------------------------------------+
```

Notes:

- The table header is sticky inside the work area.
- The Booking link is the row's clear open action.
- Hover and focus tint the row without moving it.
- Full-row click is optional only if implemented with a real link overlay that
  does not interfere with text selection or secondary actions.
- No row action menu is shown because no list-level row command is confirmed.

### Tablet, 768px

```text
+-----------------------------------------------------------------------+
| [Menu] LinerCore  Local demo                         Search  User      |
+-----------------------------------------------------------------------+
| Home / Bookings                                                       |
| Bookings                                          [ + New booking ]   |
| 6 bookings shown                                                     |
+-----------------------------------------------------------------------+
| Search bookings [____________________]  Status [All v] [Apply]        |
| [More filters v] [Manual pricing x]                                  |
+-----------------------------------------------------------------------+
| Booking        Customer       Route / voyage         Status           |
| BKG-8c6bf...   Northstar      USNYC -> NLRTM         Confirmed        |
|                                VOY-LOCAL-002                           |
+-----------------------------------------------------------------------+
| 25 per page [v]                       Previous  Page 1  Next           |
+-----------------------------------------------------------------------+
```

Equipment, owner, and updated time move to secondary row text or are omitted in
this width. Critical status and attention remain visible.

### Mobile, 390px

```text
+------------------------------------------+
| Skip to main content                     |
| [Menu] LinerCore     Local demo   [User] |
+------------------------------------------+
| Home / Bookings                          |
| Bookings                                 |
| 6 bookings shown                         |
| [ + New booking                       ]  |
+------------------------------------------+
| Search bookings                          |
| [____________________________________]   |
| [Search]                    [Filters 2]   |
| [Manual pricing x] [Owner: Me x]         |
+------------------------------------------+
| BKG-8c6bf440...              Confirmed   |
| Northstar Retail                        |
| USNYC -> NLRTM                          |
| VOY-LOCAL-002 | Departs 28 Jul          |
| 1 x 22G1 | Updated 26 Jul, 20:15        |
+------------------------------------------+
| BKG-[manual-pricing-seed] Manual pricing |
| Northstar Retail                        |
| USNYC -> NLRTM                          |
| Pricing review required                 |
+------------------------------------------+
| BKG-5489c45a...               Draft      |
| Northstar Retail                        |
| USNYC -> NLRTM                          |
| Reference validation required           |
+------------------------------------------+
| [Previous]       Page 1        [Next]    |
| Rows per page [25 v]                     |
+------------------------------------------+
```

The list is one bordered sequence with dividers, not a stack of floating cards.
Each item has one clear record link containing the booking number.

### Mobile filter drawer

```text
+------------------------------------------+
| Filters                           [Close] |
| Status                                   |
| [All statuses v]                         |
| Voyage                                   |
| [____________________________]           |
| Departure from        Departure to       |
| [____________]        [____________]     |
| Attention                                |
| [All attention types v]                  |
| Owner                                    |
| [All owners v]                           |
|                                          |
| [Clear all]        [Apply filters]       |
+------------------------------------------+
```

Only controls backed by real contracts appear. Opening moves focus to the
drawer heading; closing restores focus to `Filters`.

## 4. High-Fidelity Table And Toolbar Specification

### Shared tokens

Use the approved global tokens:

| Purpose | Token | Value |
| --- | --- | --- |
| Page background | `--erp-color-bg` | `#f4f7fb` |
| Surface | `--erp-color-surface` | `#ffffff` |
| Secondary surface | `--erp-color-surface-2` | `#eef3f9` |
| Border | `--erp-color-border` | `#d7e2ef` |
| Strong border | `--erp-color-border-strong` | `#c2d0e0` |
| Text | `--erp-color-text` | `#102235` |
| Muted text | `--erp-color-text-muted` | `#5a6b7d` |
| Primary | `--erp-color-primary` | `#11427a` |
| Primary hover | `--erp-color-primary-hover` | `#0d3663` |
| Success | `--erp-color-success` / `-bg` | `#136b45` / `#e7f4ee` |
| Warning | `--erp-color-warning` / `-bg` | `#8a5200` / `#fbf0dc` |
| Danger | `--erp-color-danger` / `-bg` | `#b42318` / `#fbe9e7` |
| Information | `--erp-color-info` / `-bg` | `#2a68b0` / `#e7f0fb` |
| Radius | `--erp-radius-sm`, `--erp-radius-md` | 6px, 8px |

Do not use the UI/UX Pro Max generic amber CTA recommendation. Primary commands
use maritime blue. Amber communicates attention only.

### Typography

- Font: approved `--erp-font-sans`, resolving to Inter for Phase 1.
- Page title: 24px/1.2, weight 700.
- Result summary and body: 14px/1.5.
- Labels: 13px/1.3, weight 600.
- Column headings: 12px/1.3, weight 700, sentence case.
- Booking numbers, timestamps, quantities, and page numbers use tabular
  numerals.
- Do not uppercase every table heading.
- Letter spacing is 0.

### Dimensions and density

- Top bar: 56px.
- Desktop side navigation: 232px when the content remains overflow-free.
- Main padding: 24px at 1024+, 20px at 768, 16px at 390.
- Maximum work area: fluid up to 1440px.
- Controls: 40px desktop/tablet, 44px mobile.
- Filter gap: 12px.
- Table header: 40px.
- Standard two-line row: 56px minimum.
- Compact single-line density may be 44px only when secondary lines are absent.
- Status badge: 24px minimum height, 6px radius, fixed internal padding.
- Icon buttons: 36px desktop, 44px mobile.
- Focus ring: 3px accent ring with 2px offset.

### Toolbar

- Use an unframed band with top and bottom borders.
- Search receives the largest track, minimum 280px on desktop.
- `Apply filters` is secondary blue-outline or neutral filled, not equal in
  emphasis to `New booking`.
- `New booking` contains a Lucide Plus icon and text.
- `More filters` uses a Lucide SlidersHorizontal icon.
- Active-filter chips use a close icon with an accessible removal label.
- Filter application keeps toolbar and table dimensions stable.

### Table

- Real `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, and `<caption>`.
- Sticky header uses the surface color and strong bottom border.
- Row divider uses the standard border token.
- Hover background: secondary surface at 60 to 80 percent visual strength.
- Focus-within background: information background plus visible link focus.
- Selected background is defined but unused until selection has a real task.
- No zebra striping; exception and focus scanning are clearer on a quiet field.
- Sortable headings use a text button with Lucide ArrowUp,
  ArrowDown, or ArrowUpDown and `aria-sort` on the column header.
- Sorting remains hidden until the API supports allowlisted fields.
- Truncate only noncritical secondary content. Booking number, status, customer,
  route, and attention reason wrap safely.

### Status and attention

- Badge includes a shape marker, text, and color.
- Manual Pricing: amber dot, `Manual pricing`.
- Validation Blocked: amber diamond or warning icon plus text.
- Confirmed and Reconfirmed: green dot.
- Exception: red outlined marker plus text.
- Do not use red for Draft or ordinary incomplete work.
- A short attention subline may say `Pricing review required` or
  `Reference validation required`.
- Tooltips supplement visible labels; they never contain essential meaning.

## 5. Column Priority And Responsive Matrix

| Information | 1440px | 1024px | 768px | 390px |
| --- | --- | --- | --- | --- |
| Booking number | Column | Column | Column | Primary line |
| Status | Column | Column | Column | Primary line |
| Customer | Column | Column | Column | Second line |
| Route | Column | Column | Column | Third line |
| Voyage | Route subline | Route subline | Route subline | Fourth line |
| Departure | Column | Column or route subline | Omit if unknown | Fourth line |
| Equipment | Column | Column | Detail disclosure | Fifth line |
| Owner | Column when supported | Optional | Omit | Detail disclosure |
| Updated | Column | Compact column | Omit | Fifth line |
| Attention reason | Status subline | Status subline | Status subline | Visible line |

At 1024px, switch to drawer navigation if a 232px rail plus the required
columns causes overflow. No horizontal page scroll is allowed. A table-local
horizontal scroll is a last resort at 768px, not the 390px solution.

## 6. Loading, Empty, Stale, Error, And Permission States

### Loading

- Keep page header and supported filter controls stable.
- Show one table-header skeleton and 8 row skeletons at desktop.
- Show 5 record-list skeletons at mobile.
- Do not render fake status colors.
- Announce `Loading bookings` only when a client transition is used.

### Filtered empty

- Heading: `No bookings match these filters`.
- Body: `Change or clear the filters to see other bookings.`
- Primary recovery: `Clear all filters`.
- Keep the filter controls and active chips visible.

### No bookings

- Heading: `No bookings yet`.
- Body for creators: `Create the first booking for your authorized scope.`
- Primary action: `New booking`, only when authorized.
- Body without create permission: `No bookings are available in your current
  scope.`

### Service unavailable

- Heading: `Bookings are temporarily unavailable`.
- Body: `Your filters are preserved. Try loading the queue again.`
- Primary action: `Retry`.
- Secondary action: `Return to workspace`.
- Put service name, correlation ID, and timestamp in collapsed
  `Technical details`.
- Do not display raw backend messages such as service identity failures.

### Stale data

- Warning banner: `Bookings may be out of date. Last refreshed {time}.`
- Primary inline action: `Refresh`.
- Preserve currently visible rows while refresh is attempted.
- If no trustworthy cached data exists, use the unavailable state instead.

### Partial fields and correction required

- Keep the row in the queue.
- Replace missing route or equipment values with `Correction required`.
- Add an amber attention label.
- Do not substitute an em dash or blank cell.
- Opening the row leads to detail where correction requirements are explained.

### Authorization limited

- Expected scope filtering is quiet and does not look like an error.
- If the system explicitly indicates partial scope, show
  `Showing bookings in {scope}` near the result summary.
- A 403 for the whole module uses `Access denied`, explains the blocked action,
  and offers the approved recovery path.
- Never render unavailable modules in shared navigation.

### Pagination failure

- Keep the current page rows visible.
- Show an inline footer message:
  `The next page could not be loaded.`
- Action: `Try again`.
- Restore focus to the failed pagination control after recovery.

### Search or filter validation

- Invalid dates use field-level errors and an error summary in the mobile
  drawer.
- Unsupported or malformed URL values are ignored or normalized server-side.
- Announce the normalized result without echoing unsafe text.

## 7. `@erp/ui` Component Mapping

### Reuse

| Need | Existing component | Decision |
| --- | --- | --- |
| Shared tokens | `DesignSystemStyles` | Reuse after token source is confirmed |
| Primary command | `Button` | Reuse; support link-as-button composition |
| Search | `Field` + `Input` | Reuse |
| Status and page size | `Field` + `Select` | Reuse |
| Queue table | `Table` | Reuse semantic wrapper |
| Status | `StatusBadge` | Reuse after status-map extension |
| Empty states | `EmptyState` | Reuse with action slot |
| Loading | `Skeleton` | Reuse with queue compositions |
| Async feedback | `StatusStrip` | Reuse for polite announcements |

### Extend or add globally

| Component | Ownership | Purpose |
| --- | --- | --- |
| `AppShell` | `@erp/ui` | Approved shared top bar, authorized nav slots, main landmark |
| `SideNavigation` | `@erp/ui` | Lucide icon plus text links supplied after authorization |
| `MobileNavigationDrawer` | `@erp/ui` client | Responsive module navigation and focus handling |
| `Breadcrumbs` | `@erp/ui` | Semantic linked breadcrumb list |
| `PageHeader` | `@erp/ui` | Compact title, summary, and actions |
| `FilterChip` | `@erp/ui` | Visible removable query state |
| `FilterDrawer` | `@erp/ui` client | Modal mobile filters |
| `Pagination` | `@erp/ui` | URL-backed previous, next, and page-size controls |
| `AlertBanner` | `@erp/ui` | Stale, degraded, warning, and error messages |
| `SupportDetails` | Shared composition | Safe technical information disclosure |

### Booking compositions

| Component | Ownership | Responsibility |
| --- | --- | --- |
| `BookingQueuePage` | Booking app | Server route composition |
| `BookingFilters` | Booking app | Query-specific fields and labels |
| `BookingQueueTable` | Booking app | Desktop/tablet semantic queue |
| `BookingQueueList` | Booking app | Mobile record list |
| `BookingQueueRow` | Booking app | Booking-specific hierarchy and links |
| `BookingAttention` | Booking app | Validation, pricing, and journey reason mapping |
| `BookingQueueState` | Booking app | Domain-specific empty and recovery copy |

### Do not reuse as-is

- Do not use the current `PlatformShell` composition without removing the
  journey ribbon, gradient mark, unavailable modules, inline layout styles, and
  nonfunctional search.
- Do not use `Card` for the queue, filter band, page header, or every mobile row.
- Do not create a generic clickable-row component that hides link semantics.

### Server and client boundaries

Server Components:

- Session and permission resolution.
- Query parsing and normalization.
- Initial booking fetch.
- Scope-aware navigation input.
- Customer display-name enrichment.
- Status and attention derivation where data is authoritative.

Client islands:

- Mobile navigation drawer.
- Mobile filter drawer.
- Optional focus restoration after filter transitions.
- Accessible result announcements for in-place updates.

Keep initial data fetching out of `useEffect`.

## 8. Keyboard And Screen-Reader Behavior

### Structure

- First focusable control is `Skip to main content`.
- Use `header`, `nav`, `main`, and a labelled pagination `nav`.
- Breadcrumbs are an ordered list with `aria-label="Breadcrumb"`.
- The desktop table has a visually hidden caption:
  `Booking operations queue, filtered by {summary}`.
- Mobile uses a semantic list with one heading-level record link per item.

### Focus order

1. Skip link.
2. Authorized module navigation.
3. Top-bar commands.
4. Breadcrumb links.
5. `New booking`.
6. Search and supported filters.
7. Active-filter removal controls.
8. Booking record links in visual order.
9. Pagination and page size.
10. Support details when present.

Do not put `tabindex` on table rows. The booking-number anchor is the record
open control, and `:focus-within` provides row-level focus styling.

### Sorting

- Each sortable heading contains one button.
- The active `<th>` carries `aria-sort="ascending"` or `"descending"`.
- Button names are explicit, for example `Sort by updated time, currently
  descending`.
- Sorting moves focus to the refreshed heading or preserves focus on the same
  control.

### Filtering and announcements

- Every control has a persistent visible label.
- Applying filters updates the URL.
- After full navigation, focus the page heading only when the navigation was
  initiated from the filter form and doing so does not disrupt browser Back.
- For client transitions, announce:
  `Filters applied. 6 bookings shown.`
- Removing a chip announces the removed filter and the updated shown count.
- Mobile drawer validation focuses the error summary, whose links focus the
  invalid fields.

### Opening and returning

- Enter on a focused booking link opens detail.
- Browser Back returns to the exact queue URL.
- `Back to bookings` on detail uses the validated `returnTo` value.
- After returning, restore focus to the originating booking link when the
  browser and rendering model can do so reliably. Otherwise focus the queue
  heading and preserve scroll position.

### Status and icons

- Status text is always visible.
- Decorative Lucide icons use `aria-hidden="true"`.
- Unfamiliar icon-only buttons have an accessible name and tooltip.
- Color is never the sole status or exception indicator.
- Reduced motion removes nonessential transitions and skeleton shimmer.

## 9. Playwright And Visual-Regression Acceptance Checklist

### Core journey

- Sign in as an authorized Booking user.
- Open `/bookings`.
- Assert the approved shared shell and only authorized modules are present.
- Assert the confirmed reference booking is visible with Northstar Retail,
  `USNYC` to `NLRTM`, `VOY-LOCAL-002`, `LCRU1000055`, `22G1`, and Confirmed.
- Assert one real Manual Pricing row and one Draft requiring reference
  validation exist after demo seeding.
- Search by booking number and confirm the URL and result.
- Filter by Manual Pricing and confirm the URL and result.
- Open a booking, use `Back to bookings`, and confirm filters, page, scroll, and
  focus context are preserved.
- Open `New booking` only for a role with create permission.

### Query and contract tests

- Preserve `search`, `status`, `page`, and `size`.
- Accept legacy `q` and `pageSize` without an open redirect or state loss.
- Reset page to 0 when filters change.
- Ignore unsupported sort fields and malformed direction values.
- Bound page size to the server maximum.
- Encode all query values safely.

### State tests

- Loading skeleton dimensions match final rows.
- Filtered-empty state clears filters.
- No-bookings state shows `New booking` only with create permission.
- Service unavailable preserves filters and supports retry.
- Stale state retains rows and announces refresh.
- Missing route or equipment says `Correction required`.
- Whole-module 403 uses the approved access-denied composition.
- Pagination failure retains the current page.
- No correlation ID appears before `Technical details` is expanded.

### Authorization tests

- Users see only records within their server-enforced scope.
- Users without Booking access do not see Booking navigation.
- Deep-link denial reveals no protected queue data.
- Users without create permission do not see `New booking`.
- Changing permissions while the page is open produces a deterministic denial
  or refreshed reduced view.

### Accessibility tests

- Run automated accessibility checks with zero serious or critical findings.
- Complete search, filter, sort, open, Back, pagination, and drawer flows with
  keyboard only.
- Assert visible focus at every step.
- Assert table caption, headers, `aria-sort`, pagination name, and filter labels.
- Assert result changes and failures are announced once.
- Assert mobile drawer traps focus and restores it to `Filters`.
- Test 200 percent zoom and text spacing overrides.
- Test reduced motion.

### Visual snapshots

Capture at:

- 390x844: default list, active filters, filter drawer, filtered empty, error.
- 768x1024: default queue, long customer name, stale banner.
- 1024x800: navigation threshold and high-column-pressure case.
- 1440x900: default, Manual Pricing filter, loading, service unavailable.

For every viewport assert:

- No horizontal page overflow.
- No overlap between shared navigation, toolbar, table, and pagination.
- Booking number, customer, route, status, and attention are not truncated in a
  way that changes meaning.
- Sticky headers do not cover focused controls.
- Primary actions remain visible.
- Long identifiers and localized labels wrap without resizing controls.

## Dependencies Before Implementation

### Required for the first queue slice

- Apply the approved shared `AppShell` composition to the Booking route without
  changing `/bookings` ownership.
- Redirect a signed-out queue request through the canonical Auth flow instead of
  rendering a service-identity error in the workspace.
- Accept `size` in the page search parameters.
- Resolve customer display names in the list response or server composition.
- Extend `StatusBadge` for `MANUAL_PRICING` and `VALIDATION_BLOCKED`.
- Seed Northstar Retail and a real Manual Pricing booking if they are Phase 1
  acceptance data.

### Required for richer filters

- Exact total count.
- Allowlisted sort and direction.
- Voyage and departure-date filtering.
- Explicit attention-category filtering.
- Owner assignment and owner filtering.
- Stable timestamps in the list contract.
- A defined stale-data source and timestamp.

Do not implement page-only filtering over the current 25 returned records. It
would produce incorrect results and counts.

## Approval Checklist

- [ ] Approve `/bookings` as canonical and `/booking` as compatibility-only.
- [ ] Approve the shared Shell presentation inside the Booking app route.
- [ ] Approve semantic table at desktop and unframed record list at 390px.
- [ ] Approve initial filters as Search and Status only until contracts exist.
- [ ] Approve no saved views, checkboxes, or bulk actions in the first slice.
- [ ] Approve Manual Pricing and Validation Blocked as warning states.
- [ ] Approve customer display-name enrichment.
- [ ] Approve exact-count wording only after a total-count contract exists.
- [ ] Approve demo seeding for Northstar Retail and Manual Pricing.
- [ ] Require a fresh authenticated visual browser review before construction.

## Recommended First Implementation Slice

Build the shared authenticated shell composition around `/bookings`, replace
the signed-out service error with canonical Auth redirection, and redesign the
queue using only the current trustworthy Search, Status, Page, and Size
contracts. Include the responsive mobile record list, current status coverage,
safe Back context, loading/empty/error states, and focused Playwright coverage.

Add voyage/date, attention, owner, sorting, exact totals, and saved views only
after their service and data contracts are approved.

No production files were modified for this design task.

$ui-ux-pro-max

Act as a principal enterprise UX designer with hands-on experience in ocean
freight booking, liner operations, exception management, and data-dense ERP
tables. This is an AI-DLC inception design task for LinerCore. Do not edit
production code in this turn.

Inspect the current route `http://127.0.0.1/bookings`, its Next.js page,
filter/query behavior, API data, responsive CSS, shared navigation, and running
demo. Redesign it as the daily operations queue for booking agents and
customer-service operators.

LinerCore is an enterprise ERP for an ocean shipping company. Users spend long
periods scanning records, resolving exceptions, reopening recent work, and
moving bookings through validation, pricing, and confirmation.

Existing capabilities and constraints:

- Columns include booking number, customer, route, equipment, and status.
- Search and status filters are available.
- Statuses include Draft, Validated, Priced, Confirmed, Exception, and Manual
  Pricing.
- Opening a booking must preserve the filtered list context for Back navigation.
- `New booking` is the primary creation command.
- Current route, API contract, authorization, and automated test behavior must
  remain valid during future implementation.

Design a dense, highly scannable queue with:

- Compact page header and result count.
- Search, status, voyage/date, exception, and owner filters.
- URL-persisted filters and visible active-filter chips.
- Sortable columns and sticky table header.
- Pagination and page-size control.
- Clear row hover, focus, selection, and open behavior.
- A restrained exception indicator.
- Primary `New booking` command.
- Optional saved views only if they add real repeated-task value.

Add operationally useful information without making the table unreadable:
voyage, departure context, last update, pricing or journey exception, and
assigned owner may appear as compact columns or sublines.

Use realistic data:

- BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3.
- Customer Northstar Retail.
- Route USNYC to NLRTM.
- Voyage VOY-LOCAL-002.
- Equipment LCRU1000055, type 22G1, quantity 1.
- Status Confirmed.
- Also show one Manual Pricing exception and one Draft requiring reference
  validation.

Use the shared LinerCore ERP design: persistent left module navigation, compact
top bar, breadcrumbs, light neutral surfaces, near-black text, restrained
maritime blue, semantic green/amber/red, Source Sans 3 or Inter, tabular
numerals, Lucide icons, 4-8px radii, subtle borders, stable row heights, and no
gradients, hero layout, decorative cards, nested cards, or blue-only palette.

At 390px prioritize booking number, customer, route, status, and exception
indicator. Use a deliberate row-detail expansion or compact record list. Do not
hide critical status or create horizontal page overflow.

Design loading skeleton, filtered-empty, no bookings, service unavailable, stale
data, partial fields/correction required, authorization-limited, and pagination
failure states. Meet WCAG 2.2 AA with keyboard-complete rows, clear focus, proper
table semantics, and accessible filter announcements.

Produce:

1. User/task assumptions and queue priorities.
2. Information hierarchy and filter model.
3. Desktop and mobile wireframes.
4. High-fidelity table and toolbar specification.
5. Column priority and responsive behavior matrix.
6. Loading, empty, stale, error, and permission states.
7. `@erp/ui` component mapping.
8. Keyboard and screen-reader behavior.
9. Playwright and visual-regression acceptance checklist.

Do not implement until the design is approved.

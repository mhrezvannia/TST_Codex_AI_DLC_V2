$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in ocean-freight
booking lifecycle, pricing, container journeys, exception management, and
record-detail ERP interfaces. This is an AI-DLC inception design task for
LinerCore. Do not edit production code in this turn.

Inspect the current route
`http://127.0.0.1/bookings/ecebf4a8-bbbd-4468-980b-0e9dfdf0e73a`, the Booking
detail page, validation actions, pricing snapshot, journey status component,
lifecycle data, responsive behavior, and running demo. Redesign it as the
central operational booking record.

LinerCore is an enterprise shipping ERP. Booking agents, customer-service
operators, pricing users, equipment controllers, supervisors, and auditors need
to understand the booking state, blocker, commercial result, and next action
without decoding technical data.

Existing record content:

- Booking number, status, and revision.
- Customer.
- One or more route legs and voyage.
- Equipment identity, type, and quantity.
- Currency, cargo mode, reefer, and dangerous-goods flags.
- Reference validation result and actions.
- Pricing snapshot or manual-pricing exception.
- Container journey status.
- Business lifecycle events.

Create a compact record header with booking number, customer, status, revision,
primary next action, secondary/overflow actions, and Back preserving the list
filters. Show blockers next to the next action.

Organize the record into stable tabs:

- Overview: route timeline, voyage, equipment, cargo facts, validation, blockers.
- Charges: itemized pricing lines, currency, basis, rate version, agreement,
  subtotal, total, quote ID, and pricing time.
- Journey: container, current event, next expected event, location, event
  timeline, and data freshness.
- Activity: chronological business events with actor and timestamp.

Technical correlation IDs, request hashes, and diagnostics belong in a
collapsed support section with copy affordances. They must not dominate the
Charges or Activity views.

Use this realistic demo record:

- Booking BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3, revision 1.
- Customer Northstar Retail.
- Route USNYC to NLRTM.
- Voyage VOY-LOCAL-002.
- Equipment LCRU1000055, type 22G1, quantity 1.
- FCL dry, USD, not reefer, not dangerous goods.
- Approved agreement with Freight, Surcharge, and Local pricing lines.
- Current journey state PENDING_EVENT. Explain honestly that the confirmed-event
  projection is pending rather than inventing movement data.

Design lifecycle variants:

- Draft.
- Validating and Validation Failed.
- Validated.
- Pricing.
- Manual Pricing.
- Priced.
- Confirming.
- Confirmed.
- Exception.
- Legacy incomplete/correction required.

Approval or confirmation actions must state business impact and prevent repeated
submission. Stale revision conflicts must preserve the user's context.

Use the shared LinerCore ERP style: persistent module navigation, compact top
bar and breadcrumbs, light neutral surfaces, near-black text, restrained
maritime blue, semantic green/amber/red, Source Sans 3 or Inter, tabular
numerals, Lucide icons, 4-8px radii, subtle borders, and no hero, gradients,
decorative cards, nested cards, or blue-only palette.

Ensure long booking numbers, hashes, quote IDs, and correlation IDs wrap or
truncate with copy affordances. At 390px use a compact header, scrollable tab
list only when necessary, one-column facts, and no horizontal page overflow.

Design loading, unavailable, not found, partial pricing, manual pricing,
journey unavailable, pending event, stale revision, async success, and retry
states. Meet WCAG 2.2 AA.

Produce:

1. Role/task assumptions and decision hierarchy.
2. Desktop and mobile wireframes for all tabs.
3. High-fidelity record-header, tabs, facts, charges, journey, and activity
   specification.
4. Primary action rules for each lifecycle state.
5. Status, blocker, loading, conflict, and recovery matrix.
6. `@erp/ui` component mapping.
7. Keyboard, focus, and screen-reader behavior.
8. Playwright and visual-regression acceptance checklist.

Do not implement until the design is approved.

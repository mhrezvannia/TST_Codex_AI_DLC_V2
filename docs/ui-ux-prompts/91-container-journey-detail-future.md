$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in DCSA Track and
Trace, container movement capture, event timelines, append-only operational
audit, and ocean-shipping ERP record details. This is an AI-DLC inception design
task for the future LinerCore Container Movement frontend. Do not edit
production code in this turn.

The Container Movement backend exists, but this frontend page is not currently
delivered in the demo. Do not describe it as implemented. Inspect journey and
movement APIs, domain transition rules, event contracts, Booking links,
reference-data dependencies, and shared `@erp/ui` components before designing
the future page.

Design a future route such as `/journeys/{journeyId}` for equipment controllers,
operations supervisors, customer-service operators, and auditors.

Create a compact record header showing:

- Container number.
- Journey status.
- Booking number and backlink.
- Origin and destination.
- Voyage or transport call.
- Current event and event time.
- Last known location and freshness.
- Primary next action for an authorized operator.

Organize the record into stable views:

- Overview: booking/equipment context and operational status.
- Movement Timeline: append-only DCSA-aligned events.
- Record Movement: authorized manual capture workflow.
- Activity and Audit: publication, correction, actor, and correlation history.

Each movement should show:

- Event classifier and event type.
- Event time and recording time.
- UN/LOCODE.
- Transport call or voyage.
- Source.
- Publication state.
- Actor where manually entered.
- Correction relationship where applicable.

The `Record movement` workflow must use canonical event codes and locations.
Validate impossible or out-of-sequence transitions, prevent duplicate events,
show the expected next event, require a reason for manual correction, and
preserve append-only history. Never silently edit a published movement.

Use realistic context:

- Booking BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3.
- Container LCRU1000055.
- Route USNYC to NLRTM.
- Voyage VOY-LOCAL-002.
- Current state `Pending event` until a real movement is accepted.

Design event accepted, publication pending, published, rejected, duplicate,
out-of-sequence, correction recorded, replayed, stale, and service-unavailable
states. Clearly separate event occurrence from event publication.

Use the shared LinerCore ERP design: persistent module navigation, compact top
bar and breadcrumbs, light neutral surfaces, near-black text, restrained
maritime blue, semantic green/amber/red, Source Sans 3 or Inter, tabular
numerals, Lucide icons, 4-8px radii, subtle borders, and no gradients, giant
map, decorative timeline, nested cards, or blue-only palette.

At 390px use a compact record header, one-column facts, an accessible vertical
timeline, and full-width movement form. Avoid horizontal page overflow and
truncated container/event identifiers.

Meet WCAG 2.2 AA. Define keyboard movement through the timeline, form error
focus, async announcements, and reduced-motion behavior.

Produce:

1. Operations roles, tasks, and DCSA assumptions.
2. Information architecture and primary-action rules.
3. Desktop and mobile wireframes for all views.
4. High-fidelity record header, timeline, movement form, and audit
   specification.
5. Transition validation and correction behavior.
6. Event/publication/error state matrix.
7. `@erp/ui` component mapping.
8. Accessibility acceptance criteria.
9. Playwright and visual-regression acceptance checklist for future delivery.

End with API, contract, and transition questions that W2-04 must answer before
implementation. Do not implement until the design and contracts are approved.

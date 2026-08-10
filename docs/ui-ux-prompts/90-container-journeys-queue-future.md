$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in container
operations, DCSA Track and Trace events, exception triage, and data-dense ocean
shipping ERP workbenches. This is an AI-DLC inception design task for the future
LinerCore Container Movement frontend. Do not edit production code in this turn.

The Container Movement backend exists, but this frontend page is not currently
delivered in the demo. Do not describe it as implemented. Inspect the current
container-movement service APIs, journey and movement domain models, Booking
integration, event contracts, shared `@erp/ui` system, and running demo before
designing the future page.

LinerCore is an enterprise ERP for an ocean shipping company. Equipment
controllers and operations supervisors need to find journeys quickly, identify
missing or delayed movement events, and drill into a container's operational
history.

Design a future route such as `/journeys` as a high-efficiency operations queue.
Show:

- Container number.
- Booking number.
- Customer.
- Origin and destination.
- Voyage or transport call.
- Current DCSA-aligned event.
- Event time.
- Last known UN/LOCODE.
- Next expected event.
- Journey status.
- Exception indicator.
- Data freshness.

Provide search by container or booking, filters by journey status, event type,
location, voyage, exception, and freshness, URL-persisted filters, sortable
columns, sticky table header, pagination, and an exception-first saved view.

Use realistic data:

- Booking BKG-8c6bf440-bd67-4883-8b8f-623b6ba362b3.
- Container LCRU1000055.
- Route USNYC to NLRTM.
- Voyage VOY-LOCAL-002.
- One journey in `Pending event`.
- One journey with a recorded movement.

Do not invent real movement events for the currently pending booking. Clearly
distinguish `No event received yet`, `Expected event late`, `Event rejected`,
and `Service unavailable`.

Use the shared LinerCore ERP design: persistent left navigation, compact top bar
and breadcrumbs, light neutral surfaces, near-black text, restrained maritime
blue, semantic green/amber/red, Source Sans 3 or Inter, tabular numerals, Lucide
icons, 4-8px radii, subtle borders, stable table dimensions, and no gradients,
hero layout, decorative map, nested cards, or blue-only palette.

At 390px prioritize container, booking, route, current event, freshness, and
exception. Use compact record rows or deliberate row expansion without
horizontal page overflow.

Design loading, empty, filtered-empty, no event yet, delayed event,
out-of-sequence event, duplicate event, unknown container, stale data, partial
service outage, and permission-limited states. Meet WCAG 2.2 AA.

Produce:

1. Operations roles, tasks, and DCSA assumptions.
2. Queue information hierarchy and filter model.
3. Desktop and mobile wireframes.
4. High-fidelity table and toolbar specification.
5. Status/event terminology and visual semantics.
6. Exception, freshness, loading, empty, and unavailable matrix.
7. `@erp/ui` component mapping.
8. Keyboard and screen-reader behavior.
9. Playwright and visual-regression acceptance checklist for future delivery.

End with API or domain questions that W2-04 must resolve before implementation.
Do not implement until the design and W2-04 contracts are approved.

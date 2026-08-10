$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in DCSA Track and
Trace, container journey exception triage, append-only movement timelines,
Booking reconciliation, and accessible ERP list-detail workflows. This is the
Container Movement unit of the LinerCore W4-01 AI-DLC Inception design.
Do not edit production code in this turn.

Inspect `docs/intents/W4-01-module-list-detail-uplift.md` and its complete
Context Pack, approved designs from `90-container-journeys-queue-future.md`,
`91-container-journey-detail-future.md`, and
`21-reference-data-list-detail-uplift.md`, the actual CMM APIs/domain/events,
Booking links, shared `@erp/ui`, and the running demo.

First verify whether a Container Movement frontend and route mount actually
exist. If they do not, say so and treat `90-91` plus this output as a binding
design package for Application Design; do not claim a route or frontend is
implemented and do not invent a replacement app.

Apply the approved W4-01 list-detail grammar to the Journey queue and Journey
detail while preserving CMM's append-only movement and correction behavior.

The Journey list must provide real search by container or Booking, filters for
journey status, event, location, voyage, exception, and freshness where the API
supports them, plus sorting, pagination, result count, URL-preserved state,
stable row links, and honest no-event/freshness semantics. Prioritize container,
Booking, route, voyage, current event, event time/location, next expected event,
status, exception, and freshness.

The Journey detail must use these stable views:

- `Summary`: container, Booking backlink, route/voyage, status, current/next
  event, location, and freshness.
- `Movement timeline`: append-only accepted/corrected movement history.
- `Linked booking`: canonical Booking facts and backlink without duplicating the
  Booking detail page.

Place authorized Record Movement and correction commands in the action rail or
a focused task route/drawer. Preserve canonical event/location controls,
expected-transition guidance, duplicate/out-of-sequence validation, reason for
manual correction, publication evidence, and immutable prior movements.

Design loading, empty, filtered-empty, no event received, expected event late,
accepted, publication pending/failed, duplicate, out of sequence, correction,
stale data, unknown container, not found, denied, partial outage, Booking link
unavailable, and service unavailable states. Event occurrence and publication
must remain visually and semantically separate.

Use the approved LinerCore/W4-01 language: compact list/detail headers, dense
tables, readable vertical timeline, stable tabs, action rail, light neutral
surfaces, restrained maritime blue, semantic status tokens, tabular identifiers
and times, Lucide icons, and no decorative map/timeline, nested cards, fake
filters, bulk actions, new palette/fonts, or horizontal page overflow.

At 390px prioritize container, Booking, route, event, freshness, and exception
in semantic records; detail uses one-column facts and an accessible vertical
timeline. At 768px stack the action rail. At 1024/1440px use the dense table and
detail/evidence rail. Meet WCAG 2.2 AA with non-color event/status meaning,
keyboard timeline navigation, form-error focus, async announcements, and reduced
motion.

Produce:

1. Binding CMM interaction specification using the repository template.
2. Verified route/source inventory and route proposal if the frontend is absent.
3. Desktop/mobile Journey list and detail wireframes.
4. High-fidelity table, tabs, timeline, action rail, and linked-Booking specs.
5. Event, publication, correction, freshness, and failure state matrix.
6. Responsive and accessibility behavior.
7. Shared-versus-CMM `@erp/ui` component mapping.
8. Canonical Booking cross-link and return-context behavior.
9. Playwright and visual-regression acceptance checklist.

Do not implement until the CMM source/mount and W4-01 design are approved.

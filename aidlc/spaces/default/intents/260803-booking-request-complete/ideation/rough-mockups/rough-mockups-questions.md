# Rough Mockups Questions — W3-04 Booking Request Completeness

## Established UX context

- `intent-statement.md`, `scope-document.md`, and `intent-backlog.md` define one authenticated Booking journey: create, save, reopen/correct, validate, price, confirm, and inspect one commercially complete FCL-dry request.
- The binding LinerCore master and reviewed Booking queue/create/detail designs establish `/bookings`, `/bookings/new`, `/bookings/{bookingId}`, the one shared shell, route-backed detail views, WCAG 2.1 AA, keyboard/focus behavior, stable Skeleton states, and responsive evidence at 375, 390, 768, 1024, and 1440 px.
- W3-04 must replace the thin create model: it adds customer and party references, cargo/package/weight/volume facts, requested-versus-derived schedule facts, equipment type × positive quantity, and removes any initial physical `equipmentId` requirement.
- UI/UX Pro Max recommendations retained: persistent labels, nearby announced errors, explicit recovery, stable responsive layout, visible focus, reduced-motion support, and Next.js loading boundaries.
- UI/UX Pro Max recommendations rejected because LinerCore has higher authority: marketing/hero structure, logo or trust sections, generic palette/fonts, charts/KPI cards, amber primary CTAs, spinners, decorative effects, and a second navigation shell.

## Pending decisions

1. How should the expanded W3-04 request form be composed?
   - A. One efficient page with five semantic sections—Booking and parties, Cargo, Route and schedule, Equipment request, and Review and save—with a sticky desktop summary and inline mobile summary (recommended)
   - B. A multi-step wizard with one section per step
   - C. Route-backed tabs within the create form
   - X. Other
   - `[Answer]: A — One grouped page with five semantic sections, a sticky desktop summary, and an inline mobile summary.`

2. How should draft creation, correction, and lifecycle commands be separated?
   - A. The form has one primary `Save draft` command; the detail record exposes exactly one next lifecycle action at a time—Validate, Price, or Confirm—and `Correct booking` edits the same record (recommended)
   - B. Create, Validate, Price, and Confirm all run from the creation form
   - C. Autosave every field and offer no explicit draft-save command
   - X. Other
   - `[Answer]: A — Save the draft explicitly, then expose one next lifecycle action on detail; correction edits the same record.`

3. How should Booking detail absorb the new information without becoming one long undifferentiated page?
   - A. Preserve route-backed Overview, Charges, Journey, and Activity; enrich Overview with commercial request, route/schedule provenance, equipment request, completeness, and reference-validation sections; keep pricing in Charges and diagnostics collapsed (recommended)
   - B. Put all commercial, schedule, pricing, journey, and activity facts on one page
   - C. Add a new route-backed tab for every field group
   - X. Other
   - `[Answer]: A — Preserve the four route-backed views and enrich Overview with the complete request and provenance.`

4. What rough-artifact breadth should this stage use?
   - A. Draw the core desktop/mobile create and detail concepts plus legacy correction and confirmation checkpoints; cover the complete negative/degraded state inventory in matrices rather than duplicating a wireframe for every state (recommended)
   - B. Draw a separate wireframe for every required UI state and breakpoint now
   - C. Draw only the happy-path create form
   - X. Other
   - `[Answer]: A — Draw the core desktop/mobile create and detail concepts plus correction and confirmation checkpoints; cover every negative/degraded state in matrices.`

## Consolidated confirmation

- `[Answer]: Confirmed — one grouped request form; explicit Save draft followed by one next lifecycle action on the same record; enriched Overview within the existing four detail views; core wireframes plus complete state matrices.`

## Fixed constraints requiring no new decision

- Primary entry points remain `New booking` from the Booking queue and `Correct booking` from the existing record.
- Canonical reference selectors never accept uncommitted free text; user entries survive recoverable validation, reference, pricing, and conflict failures.
- Requested departure is editable as a POL-local date. Carrier voyage number, ETD/ETA, cargo cutoff, and documentation deadline are derived, read-only, timezone-aware, and visibly sourced from the selected voyage.
- Optional consignee, notify party, and volume are captured but do not block confirmation.
- Initial draft and confirmation show equipment type and quantity, never a fabricated container identifier.
- Authorization remains server-enforced; technical identifiers and transport details remain in collapsed audit/support disclosures.
